from typing import Dict, Any
from app.db import run_query


def global_search(query: str) -> Dict[str, Any]:
    """
    Search people and modules by keyword (F7).
    """
    clean_q = query.strip()
    if not clean_q:
        return {"people": [], "modules": []}

    cypher = """
    MATCH (p:Person)
    WHERE toLower(p.name) CONTAINS toLower($q) OR toLower(p.role) CONTAINS toLower($q)
    WITH collect({type: 'person', id: p.id, title: p.name, subtitle: p.role})[0..8] AS people
    MATCH (m:Module)
    WHERE toLower(m.name) CONTAINS toLower($q) OR toLower(m.description) CONTAINS toLower($q)
    WITH people, collect({type: 'module', id: m.id, title: m.name, subtitle: m.criticality + ' criticality'})[0..8] AS modules
    RETURN people, modules
    """
    records = run_query(cypher, {"q": clean_q})
    if records:
        return {
            "people": records[0].get("people", []),
            "modules": records[0].get("modules", []),
        }
    return {"people": [], "modules": []}


def get_graph_data() -> Dict[str, Any]:
    """
    Fetch all modules as nodes and DEPENDS_ON relationships as links for force-directed graph visualizer (O2).
    """
    cypher = """
    MATCH (m:Module)
    OPTIONAL MATCH (owner:Person)-[:OWNS]->(m)
    OPTIONAL MATCH (m)-[:DEPENDS_ON]->(target:Module)
    RETURN collect(DISTINCT {
             id: m.id,
             name: m.name,
             criticality: m.criticality,
             owner: owner.name
           }) AS nodes,
           [rel in collect(DISTINCT case when target IS NOT NULL then {source: m.id, target: target.id} else null end) where rel is not null] AS links
    """
    records = run_query(cypher)
    if records:
        return {
            "nodes": records[0].get("nodes", []),
            "links": records[0].get("links", []),
        }
    return {"nodes": [], "links": []}
