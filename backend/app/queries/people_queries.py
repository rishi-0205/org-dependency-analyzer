from typing import Dict, Any, List, Optional
from app.db import run_query
from app.exceptions import ResourceNotFoundError


def list_people(search_query: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all people or filter by name/role."""
    if search_query:
        cypher = """
        MATCH (p:Person)
        WHERE toLower(p.name) CONTAINS toLower($q) OR toLower(p.role) CONTAINS toLower($q)
        OPTIONAL MATCH (p)-[:MEMBER_OF]->(t:Team)
        RETURN p.id AS id, p.name AS name, p.role AS role, p.seniority AS seniority, p.email AS email, t.name AS team
        ORDER BY p.name ASC
        """
        return run_query(cypher, {"q": search_query})
    else:
        cypher = """
        MATCH (p:Person)
        OPTIONAL MATCH (p)-[:MEMBER_OF]->(t:Team)
        RETURN p.id AS id, p.name AS name, p.role AS role, p.seniority AS seniority, p.email AS email, t.name AS team
        ORDER BY p.name ASC
        """
        return run_query(cypher)


def get_person(person_id: str) -> Dict[str, Any]:
    """Fetch complete profile for a single person (F5)."""
    cypher = """
    MATCH (p:Person {id: $person_id})
    OPTIONAL MATCH (p)-[:MEMBER_OF]->(t:Team)
    OPTIONAL MATCH (p)-[hs:HAS_SKILL]->(s:Skill)
    OPTIONAL MATCH (p)-[:OWNS]->(om:Module)
    OPTIONAL MATCH (p)-[ct:CONTRIBUTES_TO]->(cm:Module)
    RETURN p.id AS id,
           p.name AS name,
           p.role AS role,
           p.seniority AS seniority,
           p.email AS email,
           t.name AS team,
           collect(DISTINCT {name: s.name, category: s.category, level: hs.level}) AS skills,
           collect(DISTINCT {id: om.id, name: om.name, criticality: om.criticality}) AS owned_modules,
           collect(DISTINCT {id: cm.id, name: cm.name, commits: ct.commits, last_active: ct.last_active}) AS contributed_modules
    """
    records = run_query(cypher, {"person_id": person_id})
    if not records:
        raise ResourceNotFoundError("Person", person_id)

    record = records[0]
    # Clean up empty collections from OPTIONAL MATCH
    record["skills"] = [s for s in record.get("skills", []) if s.get("name")]
    record["owned_modules"] = [m for m in record.get("owned_modules", []) if m.get("id")]
    record["contributed_modules"] = [m for m in record.get("contributed_modules", []) if m.get("id")]
    return record


def get_person_impact(person_id: str) -> Dict[str, Any]:
    """
    Calculate blast radius when a person departs (F2).
    Traverses from owned modules to all downstream modules up to 3 hops away,
    deduplicating each affected service to its shortest path depth.
    """
    # Verify person exists
    person_check = run_query("MATCH (p:Person {id: $person_id}) RETURN p.name AS name", {"person_id": person_id})
    if not person_check:
        raise ResourceNotFoundError("Person", person_id)

    person_name = person_check[0]["name"]

    cypher = """
    MATCH (a:Person {id: $person_id})-[:OWNS]->(m:Module)
    OPTIONAL MATCH path = (downstream:Module)-[:DEPENDS_ON*1..3]->(m)
    WITH m, downstream, min(length(path)) AS depth
    RETURN m.id AS module_id,
           m.name AS module_name,
           m.criticality AS criticality,
           m.description AS description,
           collect(
             CASE WHEN downstream IS NOT NULL THEN {
               id: downstream.id,
               name: downstream.name,
               criticality: downstream.criticality,
               depth: depth
             } END
           ) AS at_risk_downstream
    """
    records = run_query(cypher, {"person_id": person_id})

    all_downstream_ids = set()
    highest_criticality = "low"
    crit_order = {"high": 3, "medium": 2, "low": 1}

    owned_modules = []
    for r in records:
        downstreams = [d for d in r.get("at_risk_downstream", []) if d and d.get("id")]
        for d in downstreams:
            all_downstream_ids.add(d["id"])
            crit = (d.get("criticality") or "low").lower()
            if crit_order.get(crit, 1) > crit_order.get(highest_criticality, 1):
                highest_criticality = crit

        mod_crit = (r.get("criticality") or "low").lower()
        if crit_order.get(mod_crit, 1) > crit_order.get(highest_criticality, 1):
            highest_criticality = mod_crit

        owned_modules.append({
            "module_id": r["module_id"],
            "module_name": r["module_name"],
            "criticality": r["criticality"],
            "description": r["description"],
            "at_risk_downstream": downstreams,
        })

    return {
        "person_id": person_id,
        "person_name": person_name,
        "owned_modules": owned_modules,
        "total_downstream_count": len(all_downstream_ids),
        "highest_criticality": highest_criticality if owned_modules else None,
    }


def get_backup_candidates(person_id: str) -> Dict[str, Any]:
    """
    Rank replacement candidates by skill overlap and contribution history (F3 / O1).
    Uses multi-stage WITH pipelines to eliminate Cartesian product duplication.
    """
    person_check = run_query("MATCH (p:Person {id: $person_id}) RETURN p.name AS name", {"person_id": person_id})
    if not person_check:
        raise ResourceNotFoundError("Person", person_id)

    cypher = """
    // Stage 1: Match shared skills and calculate base overlap
    MATCH (a:Person {id: $person_id})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(candidate:Person)
    WHERE candidate <> a
    WITH a, candidate, collect(DISTINCT s.name) AS shared_skills, count(DISTINCT s) AS skill_overlap_count

    // Stage 2: Aggregate module contributions without cross-multiplying against skills
    OPTIONAL MATCH (candidate)-[c:CONTRIBUTES_TO]->(m:Module)<-[:OWNS]-(a)
    WITH a, candidate, shared_skills, skill_overlap_count, sum(coalesce(c.commits, 0)) AS total_relevant_commits

    // Stage 3: Check team affinity (same team gives a 1.5x multiplier)
    OPTIONAL MATCH (candidate)-[:MEMBER_OF]->(t:Team)<-[:MEMBER_OF]-(a)
    WITH candidate, shared_skills, skill_overlap_count, total_relevant_commits,
         case when t IS NOT NULL then 1.5 else 1.0 end AS team_affinity_multiplier

    // Stage 4: Compute final composite rank score
    WITH candidate,
         shared_skills,
         skill_overlap_count,
         total_relevant_commits,
         ((skill_overlap_count * 10) + (total_relevant_commits * 0.5)) * team_affinity_multiplier AS composite_score
    RETURN candidate.id AS candidate_id,
           candidate.name AS candidate_name,
           candidate.role AS candidate_role,
           candidate.seniority AS candidate_seniority,
           candidate.email AS candidate_email,
           shared_skills,
           skill_overlap_count,
           total_relevant_commits,
           round(composite_score, 1) AS match_score
    ORDER BY match_score DESC, skill_overlap_count DESC
    LIMIT 6
    """
    candidates = run_query(cypher, {"person_id": person_id})
    return {
        "person_id": person_id,
        "candidates": candidates,
    }
