from typing import Dict, Any, List, Optional
from app.db import run_query
from app.exceptions import ResourceNotFoundError


def list_modules(search_query: Optional[str] = None) -> List[Dict[str, Any]]:
    """List all modules or filter by search query."""
    if search_query:
        cypher = """
        MATCH (m:Module)
        WHERE toLower(m.name) CONTAINS toLower($q) OR toLower(m.description) CONTAINS toLower($q)
        OPTIONAL MATCH (owner:Person)-[:OWNS]->(m)
        OPTIONAL MATCH (m)-[:PART_OF]->(proj:Project)
        RETURN m.id AS id,
               m.name AS name,
               m.description AS description,
               m.criticality AS criticality,
               owner.name AS owner_name,
               proj.name AS project_name
        ORDER BY m.criticality DESC, m.name ASC
        """
        return run_query(cypher, {"q": search_query})
    else:
        cypher = """
        MATCH (m:Module)
        OPTIONAL MATCH (owner:Person)-[:OWNS]->(m)
        OPTIONAL MATCH (m)-[:PART_OF]->(proj:Project)
        RETURN m.id AS id,
               m.name AS name,
               m.description AS description,
               m.criticality AS criticality,
               owner.name AS owner_name,
               proj.name AS project_name
        ORDER BY m.criticality DESC, m.name ASC
        """
        return run_query(cypher)


def get_module(module_id: str) -> Dict[str, Any]:
    """
    Fetch comprehensive module details, owner, contributors, and bidirectional dependencies (F6).
    """
    cypher = """
    MATCH (m:Module {id: $module_id})
    OPTIONAL MATCH (owner:Person)-[:OWNS]->(m)
    OPTIONAL MATCH (p:Person)-[ct:CONTRIBUTES_TO]->(m)
    OPTIONAL MATCH (m)-[:PART_OF]->(proj:Project)
    OPTIONAL MATCH (m)-[:DEPENDS_ON]->(upstream:Module)
    OPTIONAL MATCH (downstream:Module)-[:DEPENDS_ON]->(m)
    RETURN m.id AS id,
           m.name AS name,
           m.description AS description,
           m.criticality AS criticality,
           m.repo_url AS repo_url,
           proj.name AS project,
           case when owner IS NOT NULL then {id: owner.id, name: owner.name, role: owner.role, email: owner.email} else null end AS owner,
           collect(DISTINCT {id: p.id, name: p.name, commits: ct.commits, last_active: ct.last_active}) AS contributors,
           collect(DISTINCT {id: upstream.id, name: upstream.name, criticality: upstream.criticality}) AS depends_on,
           collect(DISTINCT {id: downstream.id, name: downstream.name, criticality: downstream.criticality}) AS depended_on_by
    """
    records = run_query(cypher, {"module_id": module_id})
    if not records:
        raise ResourceNotFoundError("Module", module_id)

    record = records[0]
    # Clean up empty collections from OPTIONAL MATCH
    record["contributors"] = [c for c in record.get("contributors", []) if c and c.get("id")]
    record["depends_on"] = [d for d in record.get("depends_on", []) if d and d.get("id")]
    record["depended_on_by"] = [d for d in record.get("depended_on_by", []) if d and d.get("id")]
    return record
