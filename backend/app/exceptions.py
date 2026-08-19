from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class DatabaseConnectionError(Exception):
    """Raised when the backend cannot establish a connection to CognoDB."""
    def __init__(self, message: str = "Unable to connect to CognoDB graph database"):
        self.message = message
        super().__init__(self.message)


class ResourceNotFoundError(Exception):
    """Raised when a requested graph entity (Person, Module, etc.) does not exist."""
    def __init__(self, entity_type: str, entity_id: str):
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.message = f"{entity_type} with identifier '{entity_id}' was not found"
        super().__init__(self.message)


class DatabaseQueryError(Exception):
    """Raised when a Cypher query fails execution."""
    def __init__(self, message: str = "Database query execution error"):
        self.message = message
        super().__init__(self.message)


def register_exception_handlers(app: FastAPI) -> None:
    """Register application-wide exception handlers with standard error JSON envelopes."""

    @app.exception_handler(DatabaseConnectionError)
    async def database_connection_exception_handler(request: Request, exc: DatabaseConnectionError):
        return JSONResponse(
            status_code=503,
            content={
                "error": "Database Unavailable",
                "message": exc.message,
                "hint": "Check your COGNODB_URI, COGNODB_USER, and COGNODB_PASSWORD in backend/.env",
            },
        )

    @app.exception_handler(ResourceNotFoundError)
    async def resource_not_found_exception_handler(request: Request, exc: ResourceNotFoundError):
        return JSONResponse(
            status_code=404,
            content={
                "error": "Not Found",
                "message": exc.message,
                "entity_type": exc.entity_type,
                "entity_id": exc.entity_id,
            },
        )

    @app.exception_handler(DatabaseQueryError)
    async def database_query_exception_handler(request: Request, exc: DatabaseQueryError):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Query Execution Error",
                "message": exc.message,
            },
        )
