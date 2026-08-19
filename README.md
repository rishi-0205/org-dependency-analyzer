# Org Dependency & Bus-Factor Analyzer

> **Graph-Powered Blast Radius Analysis & Skill-Backfill Intelligence**
> Built with CognoDB (openCypher over Bolt Protocol), FastAPI, Python 3.13, React 18, TypeScript, and Tailwind CSS.

---

## Overview

When key personnel leave an engineering organization, traditional relational HR systems can tell you *who reported to them*, but they cannot easily answer:

1. **"What breaks downstream if this person leaves?"** (Organizational Blast Radius)
2. **"Who in the company can immediately step in to maintain these assets?"** (Backfill Matching & Skill-Gap Detection)
3. **"Where are our single points of failure before someone gives notice?"** (Bus-Factor = 1 Risk Rollup)

These are multi-hop path traversals and pattern-matching questions over a network of ownership, dependency, and skill relationships — the kind of question a graph database is built to answer directly.

---

## Why a Graph Database?

This application's core questions are all about **the shape of connections**, not the shape of rows:

- *"If Alice leaves, what breaks — and what breaks because of what broke?"* requires walking a **variable-depth dependency chain** (1 to 3+ hops). In PostgreSQL, this means a recursive CTE or repeated self-joins on the `Module` table, re-scanning and re-joining at every level of depth, with query complexity that grows as the schema grows.
- In CognoDB (openCypher/Bolt), the same question is a single traversal pattern: `(m)<-[:DEPENDS_ON*1..3]-(downstream)`. Each node physically stores its own relationships — this is **index-free adjacency** — so following a chain of dependencies is a matter of hopping between stored pointers, not re-searching a shared table at every step.
- *"Who else has overlapping skills?"* is a shared-neighbor pattern: `(person)-[:HAS_SKILL]->(skill)<-[:HAS_SKILL]-(candidate)`. In SQL this needs a self-join through a bridge table; in Cypher it reads like the sentence describing it.
- Relationships here are also **first-class data**, not just foreign keys — `CONTRIBUTES_TO` carries its own `commits` and `last_active` properties independent of either node it connects, and `HAS_SKILL` carries a `level`. Modeling this relationally would require extra join tables just to attach metadata to a connection.
- The org's shape also isn't fixed — teams, ownership, and skills evolve constantly. CognoDB's schema-optional model means new relationship types or node properties can be added without a migration, matching how a real org chart actually changes.

In short: the questions this tool answers are graph-traversal questions by nature, and a graph database lets the query express exactly that shape — no more, no less.

---

## Architecture & Tech Stack

```
                              ┌────────────────────────────────────────────────────────┐
                              │                  CognoDB Cloud (Graph DB)              │
                              │   Nodes: Person, Module, Project, Team, Skill          │
                              │   Edges: OWNS, CONTRIBUTES_TO, HAS_SKILL, DEPENDS_ON   │
                              └───────────────────────────▲────────────────────────────┘
                                                          │ Bolt Protocol (Cypher)
                                                          │ neo4j Python Driver
                              ┌───────────────────────────▼────────────────────────────┐
                              │            FastAPI Backend (Python 3.13)               │
                              │  - Isolated Virtual Environment (backend/venv)         │
                              │  - db.py (Connection Pool & Safe Parameterized Cypher) │
                              │  - routers/ (dashboard, people, modules, search, graph)│
                              │  - models.py (Pydantic Response Schemas & Validation)  │
                              └───────────────────────────▲────────────────────────────┘
                                                          │ HTTP / JSON REST APIs (Port 8000)
                                                          │ CORS Enabled
                              ┌───────────────────────────▼────────────────────────────┐
                              │        React 18 + TypeScript + Vite (Port 5173)        │
                              │  - Tailwind CSS (Executive Dark Slate Design System)   │
                              │  - Side-by-Side What-If Departure Simulation Panel     │
                              │  - Interactive Force-Directed 2D Graph (react-force-..)│
                              │  - Real-Time Global Fuzzy Search & Risk Analytics      │
                              └────────────────────────────────────────────────────────┘
```

| Layer | Choice |
|---|---|
| Database | CognoDB Cloud (managed graph DB, openCypher over Bolt) |
| DB Driver | Official `neo4j` Python driver |
| Backend | FastAPI (Python 3.13), Uvicorn, Pydantic |
| Frontend | React 18 + TypeScript + Vite, Tailwind CSS |
| Graph Visualization | `react-force-graph-2d` |
| Seed Data | Faker (Python) |

---

## Graph Data Model

### Diagram

> _Insert the data model diagram here — e.g. an Excalidraw/draw.io export showing each node label as a box and each relationship as a labeled, directed arrow between boxes, matching the schema below. Save as `docs/data-model-diagram.png` and embed with:_
> `![Data model diagram](docs/data-model-diagram.png)`

A quick text sketch of the shape, for reference while building the visual diagram:

```
(Person)-[:OWNS]->(Module)
(Person)-[:CONTRIBUTES_TO {commits, last_active}]->(Module)
(Person)-[:HAS_SKILL {level}]->(Skill)
(Person)-[:MEMBER_OF]->(Team)
(Module)-[:DEPENDS_ON]->(Module)      // self-referential
(Module)-[:PART_OF]->(Project)
```

### Node Schema & Primary Keys

| Label | Primary Lookup Key | Properties | Constraint / Index |
|---|---|---|---|
| **`Person`** | `id` (UUID/slug) | `name`, `role`, `seniority`, `email` | `REQUIRE p.id IS UNIQUE`, index on `name` |
| **`Module`** | `id` (UUID/slug) | `name`, `description`, `repo_url`, `criticality` (`high`/`medium`/`low`) | `REQUIRE m.id IS UNIQUE`, index on `name`, `criticality` |
| **`Project`**| `id` (UUID/slug) | `name`, `status` (`active`/`archived`) | `REQUIRE pr.id IS UNIQUE`, index on `name` |
| **`Team`** | `name` (string) | — | `REQUIRE t.name IS UNIQUE` |
| **`Skill`** | `name` (string) | `category` (`Language`, `Infrastructure`, `Architecture`, `Domain`) | `REQUIRE s.name IS UNIQUE` |

### Relationships

- `(:Person)-[:OWNS]->(:Module)` — primary architect responsible (1 owner per module)
- `(:Person)-[:CONTRIBUTES_TO {commits: int, last_active: str}]->(:Module)` — secondary active maintainer
- `(:Person)-[:HAS_SKILL {level: str}]->(:Skill)` — skill profile (`beginner`, `intermediate`, `expert`)
- `(:Person)-[:MEMBER_OF]->(:Team)` — team assignment
- `(:Module)-[:DEPENDS_ON]->(:Module)` — directed dependency DAG (downstream relies on upstream)
- `(:Module)-[:PART_OF]->(:Project)` — project scope grouping

---

## Key Cypher Queries Explained

### 1. Multi-Hop Blast Radius Query
Traverses 1 to 3 hops downstream from the person's owned modules, taking `min(length(path))` to calculate shortest hop distance and using null-safe `collect()` to cleanly return `[]` for leaf modules with no downstream dependents:

```cypher
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
```

*This is the query that would be genuinely awkward in a relational database — variable-depth traversal needs a recursive CTE in SQL, versus a single `*1..3` pattern here.*

### 2. Multi-Stage Skill Backfill & Replacement Ranking
Finds replacement candidates via a shared-skill pattern, then sequentially aggregates module contribution history and team affinity in separate `WITH` stages to avoid Cartesian cross-multiplication between unrelated match clauses:

```cypher
// Stage 1: Match shared skills and calculate base overlap
MATCH (a:Person {id: $person_id})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(candidate:Person)
WHERE candidate <> a
WITH a, candidate, collect(DISTINCT s.name) AS shared_skills, count(DISTINCT s) AS skill_overlap_count

// Stage 2: Aggregate module contributions without cross-multiplying
OPTIONAL MATCH (candidate)-[c:CONTRIBUTES_TO]->(m:Module)<-[:OWNS]-(a)
WITH a, candidate, shared_skills, skill_overlap_count, sum(coalesce(c.commits, 0)) AS total_relevant_commits

// Stage 3: Check team affinity (1.5x multiplier for same team)
OPTIONAL MATCH (candidate)-[:MEMBER_OF]->(t:Team)<-[:MEMBER_OF]-(a)
WITH candidate, shared_skills, skill_overlap_count, total_relevant_commits,
     case when t IS NOT NULL then 1.5 else 1.0 end AS team_affinity_multiplier

// Stage 4: Compute final composite rank score
WITH candidate, shared_skills, skill_overlap_count, total_relevant_commits,
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
```

### 3. Bus-Factor = 1 Risk Rollup
Identifies modules where `owner IS NOT NULL` and `contributor_count = 0` — true single points of failure with zero redundancy:

```cypher
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
ORDER BY case risk_level when 'CRITICAL' then 1 when 'HIGH' then 2 else 3 end, downstream_count DESC;
```

---

## Setting Up CognoDB Cloud

1. Go to **[console.cognodb.com/signup](https://console.cognodb.com/signup)** and create a free account — no credit card required.
2. From the console, create a **free `c0` instance** and select a region. Provisioning takes under a minute. Each workspace gets one free instance.
3. Once provisioned, copy the connection URI (`bolt+s://<instance-id>.databases.cognodb.cloud`) and the generated password for the `cognodb` user.
   > **Important:** The password is shown **exactly once**. Copy or download it immediately.
4. Save these values — you'll enter them into `backend/.env` in the setup steps below.

**Free tier limits:** burstable 0.5 vCPU, 256 MB RAM, 1 GB disk, up to 200 connections — comfortably sufficient for this project's seed dataset.

---

## Local Development Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- A CognoDB Cloud instance (see above)

### 2. Backend Setup (Port 8000)

```powershell
cd backend

# 1. Create and activate an isolated virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure credentials
copy .env.example .env
# Edit backend/.env and fill in:
#   COGNODB_URI=bolt+s://<instance-id>.databases.cognodb.cloud
#   COGNODB_USER=cognodb
#   COGNODB_PASSWORD=<your generated password>

# 4. Apply schema constraints and indexes (one-time)
python seed/constraints.py

# 5. Generate the deterministic org dataset with engineered failure scenarios (one-time)
python seed/seed_data.py

# 6. Run tests
python -m pytest tests/

# 7. Start the backend development server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup (Port 5173)

```powershell
cd frontend

# 1. Install dependencies
npm install

# 2. Configure the API base URL
copy .env.example .env
# Edit frontend/.env:
#   VITE_API_BASE_URL=http://localhost:8000

# 3. Start the Vite development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## Screenshots

> _Insert screenshots here once the app is running locally or deployed. Suggested shots:_
> - Dashboard overview (stat cards + at-risk modules table)
> - Person detail page with "What if they leave?" panel expanded (blast radius + backup candidates side by side)
> - Module detail page (owner, contributors, upstream/downstream dependencies)
> - Interactive dependency graph visualization
>
> ```markdown
> ![Dashboard](docs/screenshots/dashboard.png)
> ![Person Detail — Impact Simulation](docs/screenshots/person-detail.png)
> ![Module Detail](docs/screenshots/module-detail.png)
> ![Dependency Graph](docs/screenshots/dependency-graph.png)
> ```

---

## Live Demo & Screen Recording

- **Hosted demo:** _[insert deployed frontend URL here]_
- **Screen recording:** _[insert recording link here]_

---

## Verification & Test Results

- **Backend Pytest Suite:** `13 passed in 0.87s (100% pass rate)`
- **Frontend Production Build:** `tsc && vite build` passed with `0 TypeScript errors`
- **Engineered Demo Scenarios:**
  - **Elena Rostova (`p-elena-rostova`)** — owns `auth-service` (high criticality, 0 contributors) → 5 downstream services cascade in the Blast Radius simulator; backfill search exposes an OAuth2/Rust skill gap.
  - **Marcus Vance (`p-marcus-vance`)** — owns `payment-gateway` → 3 downstream services cascade.
  - **David Kim (`p-david-kim`)** — owns `ops-dashboard` (leaf module) → returns a clean empty downstream list `[]` (null-safety verification).

---

## Scope Notes

- **Auth/RBAC** is intentionally out of scope for this assignment — the application is a read-only exploration tool with no write-protection concerns. In a production deployment, this would be added as a `Role` node type gating write operations.
- **CRUD UI** is intentionally omitted; the seed script serves as the write path, and the app focuses on read-side graph exploration and analysis.

---

## License
MIT License