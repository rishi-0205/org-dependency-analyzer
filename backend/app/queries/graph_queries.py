from typing import Dict, Any, List
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
    WHERE toLower(p.name) CONTAINS toLower($q)
       OR toLower(p.id) CONTAINS toLower($q)
       OR toLower(coalesce(p.role, '')) CONTAINS toLower($q)
    WITH collect({type: 'person', id: p.id, title: p.name, subtitle: coalesce(p.role, 'Engineer')})[0..8] AS people
    MATCH (m:Module)
    WHERE toLower(m.name) CONTAINS toLower($q)
       OR toLower(m.id) CONTAINS toLower($q)
       OR toLower(coalesce(m.description, '')) CONTAINS toLower($q)
    WITH people, collect({type: 'module', id: m.id, title: m.name, subtitle: coalesce(m.criticality, 'medium') + ' criticality'})[0..8] AS modules
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
    Fetch all 5 node types and 6 relationship types with rich properties for the interactive topology graph (O2).
    """
    # 1. Fetch Person Nodes
    people_cypher = """
    MATCH (p:Person)
    OPTIONAL MATCH (p)-[:MEMBER_OF]->(t:Team)
    OPTIONAL MATCH (p)-[hs:HAS_SKILL]->(s:Skill)
    OPTIONAL MATCH (p)-[:OWNS]->(om:Module)
    WITH p, t,
         collect(DISTINCT {name: s.name, level: hs.level, category: s.category}) AS skills,
         collect(DISTINCT {id: om.id, name: om.name, criticality: om.criticality}) AS owned_modules
    RETURN collect({
      id: p.id,
      name: p.name,
      type: 'person',
      role: p.role,
      seniority: p.seniority,
      email: p.email,
      team: t.name,
      skills: [sk in skills WHERE sk.name IS NOT NULL],
      owned_modules: [m in owned_modules WHERE m.id IS NOT NULL]
    }) AS nodes
    """
    people_records = run_query(people_cypher)
    people_nodes = people_records[0].get("nodes", []) if people_records else []

    # 2. Fetch Module Nodes
    modules_cypher = """
    MATCH (m:Module)
    OPTIONAL MATCH (owner:Person)-[:OWNS]->(m)
    OPTIONAL MATCH (m)-[:PART_OF]->(pr:Project)
    OPTIONAL MATCH (c:Person)-[ct:CONTRIBUTES_TO]->(m)
    OPTIONAL MATCH (m)-[:DEPENDS_ON]->(upstream:Module)
    OPTIONAL MATCH (downstream:Module)-[:DEPENDS_ON]->(m)
    WITH m, owner, pr,
         count(DISTINCT downstream) AS downstream_count,
         count(DISTINCT c) AS contributor_count,
         collect(DISTINCT {id: c.id, name: c.name, commits: ct.commits, last_active: ct.last_active}) AS raw_contributors,
         collect(DISTINCT {id: upstream.id, name: upstream.name, criticality: upstream.criticality}) AS raw_depends_on,
         collect(DISTINCT {id: downstream.id, name: downstream.name, criticality: downstream.criticality}) AS raw_depended_on_by
    RETURN collect({
      id: m.id,
      name: m.name,
      type: 'module',
      description: m.description,
      criticality: m.criticality,
      repo_url: m.repo_url,
      project: pr.name,
      owner: owner.name,
      owner_id: owner.id,
      downstream_count: downstream_count,
      contributor_count: contributor_count,
      contributors: [cb in raw_contributors WHERE cb.id IS NOT NULL],
      depends_on: [up in raw_depends_on WHERE up.id IS NOT NULL],
      depended_on_by: [dn in raw_depended_on_by WHERE dn.id IS NOT NULL]
    }) AS nodes
    """
    modules_records = run_query(modules_cypher)
    module_nodes = modules_records[0].get("nodes", []) if modules_records else []

    # 3. Fetch Skill Nodes
    skills_cypher = """
    MATCH (s:Skill)
    OPTIONAL MATCH (p:Person)-[hs:HAS_SKILL]->(s)
    WITH s, collect(DISTINCT {id: p.id, name: p.name, role: p.role, level: hs.level}) AS people
    RETURN collect({
      id: s.name,
      name: s.name,
      type: 'skill',
      category: s.category,
      people_with_skill: [peep in people WHERE peep.id IS NOT NULL]
    }) AS nodes
    """
    skills_records = run_query(skills_cypher)
    skill_nodes = skills_records[0].get("nodes", []) if skills_records else []

    # 4. Fetch Team Nodes
    teams_cypher = """
    MATCH (t:Team)
    OPTIONAL MATCH (p:Person)-[:MEMBER_OF]->(t)
    OPTIONAL MATCH (p)-[:OWNS]->(m:Module)
    OPTIONAL MATCH (contributor:Person)-[:CONTRIBUTES_TO]->(m)
    WITH t, p, m, count(DISTINCT contributor) AS contrib_count
    WITH t,
         collect(DISTINCT {id: p.id, name: p.name, role: p.role}) AS members,
         collect(DISTINCT case when m IS NOT NULL then {id: m.id, name: m.name, criticality: m.criticality, is_spof: (contrib_count = 0)} else null end) AS owned_modules
    RETURN collect({
      id: t.name,
      name: t.name,
      type: 'team',
      member_count: size([mem in members WHERE mem.id IS NOT NULL]),
      members: [mem in members WHERE mem.id IS NOT NULL],
      team_owned_modules: [mod in owned_modules WHERE mod IS NOT NULL],
      spof_count: size([mod in owned_modules WHERE mod IS NOT NULL AND mod.is_spof = true])
    }) AS nodes
    """
    teams_records = run_query(teams_cypher)
    team_nodes = teams_records[0].get("nodes", []) if teams_records else []

    # 5. Fetch Project Nodes
    projects_cypher = """
    MATCH (pr:Project)
    OPTIONAL MATCH (m:Module)-[:PART_OF]->(pr)
    WITH pr, collect(DISTINCT {id: m.id, name: m.name, criticality: m.criticality}) AS modules
    RETURN collect({
      id: pr.id,
      name: pr.name,
      type: 'project',
      status: pr.status,
      project_modules: [mod in modules WHERE mod.id IS NOT NULL]
    }) AS nodes
    """
    projects_records = run_query(projects_cypher)
    project_nodes = projects_records[0].get("nodes", []) if projects_records else []

    all_nodes = people_nodes + module_nodes + skill_nodes + team_nodes + project_nodes

    # 6. Fetch All Links (OWNS, CONTRIBUTES_TO, HAS_SKILL, MEMBER_OF, DEPENDS_ON, PART_OF)
    links_cypher = """
    // OWNS
    MATCH (p:Person)-[:OWNS]->(m:Module)
    WITH collect({source: p.id, target: m.id, relationship: 'owns'}) AS owns_links

    // CONTRIBUTES_TO
    MATCH (p:Person)-[c:CONTRIBUTES_TO]->(m:Module)
    WITH owns_links, collect({source: p.id, target: m.id, relationship: 'contributes_to', commits: c.commits, last_active: c.last_active}) AS contrib_links

    // HAS_SKILL
    MATCH (p:Person)-[hs:HAS_SKILL]->(s:Skill)
    WITH owns_links, contrib_links, collect({source: p.id, target: s.name, relationship: 'has_skill', level: hs.level}) AS skill_links

    // MEMBER_OF
    MATCH (p:Person)-[:MEMBER_OF]->(t:Team)
    WITH owns_links, contrib_links, skill_links, collect({source: p.id, target: t.name, relationship: 'member_of'}) AS member_links

    // DEPENDS_ON
    MATCH (m1:Module)-[:DEPENDS_ON]->(m2:Module)
    WITH owns_links, contrib_links, skill_links, member_links, collect({source: m1.id, target: m2.id, relationship: 'depends_on'}) AS dep_links

    // PART_OF
    MATCH (m:Module)-[:PART_OF]->(pr:Project)
    WITH owns_links, contrib_links, skill_links, member_links, dep_links, collect({source: m.id, target: pr.id, relationship: 'part_of'}) AS part_links

    RETURN owns_links + contrib_links + skill_links + member_links + dep_links + part_links AS all_links
    """
    links_records = run_query(links_cypher)
    all_links = links_records[0].get("all_links", []) if links_records else []

    return {
        "nodes": all_nodes,
        "links": all_links,
    }
