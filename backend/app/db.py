import logging
from typing import Any, Dict, List, Optional
from neo4j import GraphDatabase, Driver
from neo4j.exceptions import (
    ServiceUnavailable,
    AuthError,
    Neo4jError,
    ConfigurationError,
)

from app.config import get_settings
from app.exceptions import DatabaseConnectionError, DatabaseQueryError

logger = logging.getLogger("org_analyzer.db")

_driver: Optional[Driver] = None


def get_driver() -> Driver:
    """Get the active Neo4j Driver singleton instance."""
    global _driver
    if _driver is None:
        init_driver()
    return _driver


def init_driver() -> Driver:
    """Initialize the Neo4j Driver singleton using application settings."""
    global _driver
    settings = get_settings()

    try:
        _driver = GraphDatabase.driver(
            settings.COGNODB_URI,
            auth=(settings.COGNODB_USER, settings.COGNODB_PASSWORD),
            max_connection_lifetime=3600,
            max_connection_pool_size=50,
            connection_acquisition_timeout=15.0,
        )
        logger.info("Neo4j driver initialized for URI: %s", settings.COGNODB_URI)
        return _driver
    except (ConfigurationError, Exception) as exc:
        logger.error("Failed to initialize Neo4j driver: %s", exc)
        raise DatabaseConnectionError(f"Driver initialization failed: {exc}") from exc


def close_driver() -> None:
    """Close the driver and release connection pool resources."""
    global _driver
    if _driver is not None:
        try:
            _driver.close()
            logger.info("Neo4j driver closed successfully")
        except Exception as exc:
            logger.warning("Error closing Neo4j driver: %s", exc)
        finally:
            _driver = None


def verify_connection() -> bool:
    """Verify active connectivity and credentials against CognoDB."""
    try:
        driver = get_driver()
        driver.verify_connectivity()
        return True
    except (ServiceUnavailable, AuthError, Exception) as exc:
        logger.error("Database connectivity check failed: %s", exc)
        raise DatabaseConnectionError(f"Connection verification failed: {exc}") from exc


def _serialize_neo4j_value(val: Any) -> Any:
    """Recursively convert Neo4j types (Node, Relationship, Date, DateTime) to Python primitives."""
    if val is None:
        return None
    if isinstance(val, (str, int, float, bool)):
        return val
    if isinstance(val, list):
        return [_serialize_neo4j_value(item) for item in val if item is not None]
    if isinstance(val, dict):
        return {k: _serialize_neo4j_value(v) for k, v in val.items()}
    # If it's a Neo4j Node or Relationship, extract its property dict
    if hasattr(val, "items"):
        return {k: _serialize_neo4j_value(v) for k, v in dict(val).items()}
    # Fallback to string representation for dates/spatial/custom types
    return str(val)


def run_query(cypher: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Execute a parameterized Cypher query and return results as a list of dicts.

    Args:
        cypher: The Cypher query string (must use $param syntax, never string formatting).
        parameters: Dictionary of query parameters.

    Returns:
        List of dictionaries where keys match the Cypher RETURN column names.
    """
    if parameters is None:
        parameters = {}

    driver = get_driver()

    try:
        with driver.session() as session:
            result = session.run(cypher, parameters)
            records = []
            for record in result:
                record_dict = {}
                for key in record.keys():
                    raw_val = record[key]
                    record_dict[key] = _serialize_neo4j_value(raw_val)
                records.append(record_dict)
            return records
    except (ServiceUnavailable, AuthError) as exc:
        logger.error("Database unavailable during query execution: %s", exc)
        raise DatabaseConnectionError(f"Database connection error: {exc}") from exc
    except Neo4jError as exc:
        logger.error("Cypher execution error: %s | Query: %s", exc, cypher)
        raise DatabaseQueryError(f"Cypher error [{exc.code}]: {exc.message}") from exc
    except Exception as exc:
        logger.error("Unexpected error during query execution: %s", exc)
        raise DatabaseQueryError(f"Query execution failed: {exc}") from exc
