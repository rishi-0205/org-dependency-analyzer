from typing import Dict, Any
from app.db import run_query


def get_dashboard_data() -> Dict[str, Any]:
    """
    Fetch high-level organizational KPI counts and Bus-Factor = 1 at-risk modules (F4).
    """
    # 1. Total counts across entities
    counts_cypher = """
    MATCH (p:Person) WITH count(p) AS total_people
    MATCH (m:Module) WITH total_people, count(m) AS total_modules
    MATCH (pr:Project) WITH total_people, total_modules, count(pr) AS total_projects
    MATCH (s:Skill) WITH total_people, total_modules, total_projects, count(s) AS total_skills
    RETURN total_people, total_modules, total_projects, total_skills
    """
    counts_records = run_query(counts_cypher)
    if counts_records:
        counts = counts_records[0]
    else:
        counts = {
            "total_people": 0,
            "total_modules": 0,
            "total_projects": 0,
            "total_skills": 0,
        }

    # 2. Single Point of Failure modules (Bus Factor = 1: Exactly 1 owner AND 0 secondary contributors)
    at_risk_cypher = """
    MATCH (m:Module)
    OPTIONAL MATCH (owner:Person)-[:OWNS]->(m)
    OPTIONAL MATCH (contributor:Person)-[:CONTRIBUTES_TO]->(m)
    OPTIONAL MATCH (downstream:Module)-[:DEPENDS_ON]->(m)
    WITH m, owner, count(DISTINCT contributor) AS contributor_count, count(DISTINCT downstream) AS downstream_count
    WHERE owner IS NOT NULL AND contributor_count = 0
    RETURN m.id AS module_id,
           m.name AS module_name,
           m.criticality AS criticality,
           owner.id AS owner_id,
           owner.name AS owner_name,
           owner.role AS owner_role,
           contributor_count,
           downstream_count,
           case
             when m.criticality = 'high' and downstream_count > 2 then 'CRITICAL'
             when m.criticality = 'high' or downstream_count > 0 then 'HIGH'
             else 'MEDIUM'
           end AS risk_level
    ORDER BY case risk_level when 'CRITICAL' then 1 when 'HIGH' then 2 else 3 end, downstream_count DESC
    """
    at_risk_records = run_query(at_risk_cypher)

    return {
        "total_people": counts["total_people"],
        "total_modules": counts["total_modules"],
        "total_projects": counts["total_projects"],
        "total_skills": counts["total_skills"],
        "at_risk_modules": at_risk_records,
    }
