# Functional Requirements Document
## Org Dependency & Bus-Factor Analyzer (CognoDB Graph Application)

---

## 1. Overview

A web application that models an organization's people, skills, modules, and projects as a graph, letting users answer questions like *"what breaks if this person leaves?"* and *"who can step in?"* — questions that are natural graph traversals and awkward relational joins.

---

## 2. Feature List

### 2.1 MUST-HAVE (Core MVP — required for grading)

| ID | Feature | Description |
|----|---------|-------------|
| F1 | **Seed data generator** | Script that creates realistic fake org data (people, modules, projects, teams, skills) with deliberate single-points-of-failure baked in |
| F2 | **Bus-factor / blast-radius query** | Given a person, find modules they own and all downstream modules that depend on those (multi-hop traversal) |
| F3 | **Skill-backfill query** | Given a person, find other people who share their skills, ranked by overlap |
| F4 | **Dashboard / overview page** | Org-wide stats (total people, modules, projects) + a list of "at-risk" items (single-owner critical modules) |
| F5 | **Person detail page** | Shows a person's skills, owned modules, team — with a "What if they leave?" action that triggers F2 + F3 |
| F6 | **Module detail page** | Shows owner, contributors, what it depends on, what depends on it |
| F7 | **Search / browse** | Simple list or search to navigate from dashboard into a specific person or module |
| F8 | **Loading states** | Every data-fetching view shows a loading indicator |
| F9 | **Empty states** | Meaningful empty states (e.g. "No backup found — skill gap" is a real finding, not a dead end) |
| F10 | **Error handling** | Graceful UI + API response when CognoDB is unreachable or a query returns nothing |
| F11 | **Parameterized Cypher queries** | All queries via official Neo4j driver, no string concatenation |
| F12 | **Env-based config** | DB URI/password read from environment variables, never committed |

### 2.2 OPTIONAL (Stretch — only if time remains, in priority order)

| ID | Feature | Description | Value if added |
|----|---------|-------------|-----------------|
| O1 | **Combined backfill ranking** | Rank backup candidates by skill overlap **+** existing `CONTRIBUTES_TO` activity on the affected module, not skill overlap alone | Stronger, more realistic signal |
| O2 | **Org-wide dependency graph visualization** | Interactive force-directed graph on the dashboard showing modules + dependency edges at a glance | Strong visual centerpiece for demo/recording |
| O3 | **Project-level risk rollup** | Aggregate module-level risk up to the project level ("Project X is at risk because 3 of its modules are single-owner") | Shows richer traversal (Module → Project) |
| O4 | **Filter/sort on at-risk dashboard list** | Sort by criticality, team, or number of downstream dependents | UX polish |
| O5 | **Team-level view** | Team detail page showing members, collective skill coverage, team-owned modules | Extra depth, not essential |

### 2.3 OUT OF SCOPE (explicitly not building — note in README why)

| ID | Feature | Reason excluded |
|----|---------|------------------|
| X1 | **Auth / login / roles** | Not part of grading criteria; adds friction to demo access; no write-protection needed for a read-only exploration tool |
| X2 | **Create/edit/delete UI (CRUD forms)** | Seed script serves as the write path; app is read-only exploration, which satisfies requirements without extra build time |
| X3 | **Multi-tenant / multi-org support** | Single org dataset is sufficient to demonstrate the use case |

---

## 3. Feature-to-Query Mapping (traceability)

| Feature | Backed by Cypher query | Multi-hop? | "Awkward in SQL"? |
|---------|------------------------|------------|---------------------|
| F2 (bus-factor) | `OWNS` → `DEPENDS_ON*1..3` traversal | ✅ Yes | ✅ Yes (recursive CTE in SQL) |
| F3 (skill backfill) | `HAS_SKILL` shared-node pattern | No (1-hop via shared node) | Moderate (self-join on bridge table) |
| F4 (dashboard at-risk list) | Aggregation: modules with `count(owners) = 1` | No | Easy in both |
| F6 (module detail) | `DEPENDS_ON` both directions from a module | No (1-hop) | Easy in both |
| O2 (org graph viz) | All `Module`/`DEPENDS_ON` nodes+edges | N/A | N/A |
| O3 (project risk rollup) | `Module -[:PART_OF]-> Project` + risk aggregation | Yes (2-hop) | Moderate |

---

## 4. Priority Order for Build

1. F1 → F2 → F3 (data + core queries — the "why graph" proof)
2. F4 → F6 → F5 → F7 (frontend pages, dashboard first since it needs no user input)
3. F8 → F9 → F10 → F11 → F12 (cross-cutting, woven in as each feature is built, not bolted on after)
4. O1 → O2 → O3 → O4 → O5 (only if MVP is done with time to spare)

---

## 5. Data Model (Technical)

### 5.1 Node labels & properties

| Label | Properties |
|-------|------------|
| `Person` | `id` (UUID, unique constraint), `name`, `role`, `seniority`, `email` |
| `Skill` | `id`, `name` (unique constraint), `category` |
| `Module` | `id` (unique constraint), `name`, `description`, `repo_url`, `criticality` (`low`/`medium`/`high`) |
| `Project` | `id` (unique constraint), `name`, `status` (`active`/`archived`) |
| `Team` | `id`, `name` (unique constraint) |

### 5.2 Relationship types

| Relationship | Direction | Properties | Cardinality |
|---|---|---|---|
| `(Person)-[:OWNS]->(Module)` | Person → Module | — | 1 owner per module (enforced in app logic, not DB) |
| `(Person)-[:CONTRIBUTES_TO]->(Module)` | Person → Module | `commits` (int), `last_active` (date string) | many-to-many |
| `(Person)-[:HAS_SKILL]->(Skill)` | Person → Skill | `level` (`beginner`/`intermediate`/`expert`) | many-to-many |
| `(Person)-[:MEMBER_OF]->(Team)` | Person → Team | — | many-to-one (usually) |
| `(Module)-[:DEPENDS_ON]->(Module)` | Module → Module | — | many-to-many, self-referential |
| `(Module)-[:PART_OF]->(Project)` | Module → Project | — | many-to-one |

### 5.3 Constraints to create on CognoDB (run once, at setup)

```cypher
CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT module_id_unique IF NOT EXISTS FOR (m:Module) REQUIRE m.id IS UNIQUE;
CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (pr:Project) REQUIRE pr.id IS UNIQUE;
CREATE CONSTRAINT skill_name_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE;
CREATE CONSTRAINT team_name_unique IF NOT EXISTS FOR (t:Team) REQUIRE t.name IS UNIQUE;
```

---

## 6. Feature Technical Specs

### F2 — Bus-factor / blast-radius query

- **Endpoint:** `GET /api/people/{person_id}/impact`
- **Cypher:**
```cypher
MATCH (a:Person {id: $person_id})-[:OWNS]->(m:Module)
OPTIONAL MATCH (m)<-[:DEPENDS_ON*1..3]-(downstream:Module)
RETURN m.id AS module_id, m.name AS module_name, m.criticality AS criticality,
       collect(DISTINCT {id: downstream.id, name: downstream.name}) AS at_risk_downstream
```
- **Response shape:**
```json
{
  "person_id": "uuid",
  "owned_modules": [
    {
      "module_id": "uuid",
      "module_name": "auth-service",
      "criticality": "high",
      "at_risk_downstream": [{"id": "uuid", "name": "checkout-service"}]
    }
  ]
}
```
- **Frontend:** rendered inside Person detail page (F5) as a triggered panel, plus optionally visualized via O2's graph component scoped to just this subgraph.

### F3 — Skill-backfill query

- **Endpoint:** `GET /api/people/{person_id}/backup-candidates`
- **Cypher:**
```cypher
MATCH (a:Person {id: $person_id})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(candidate:Person)
WHERE candidate <> a
RETURN candidate.id AS candidate_id, candidate.name AS candidate_name,
       collect(s.name) AS shared_skills, count(s) AS overlap_score
ORDER BY overlap_score DESC
LIMIT 5
```
- **Response shape:**
```json
{
  "person_id": "uuid",
  "candidates": [
    {"candidate_id": "uuid", "candidate_name": "Bob", "shared_skills": ["Python", "Kubernetes"], "overlap_score": 2}
  ]
}
```
- **Frontend:** rendered alongside F2's output in the "What if they leave?" panel — side by side (broken pipeline | backup candidates).

### F4 — Dashboard / overview

- **Endpoint:** `GET /api/dashboard`
- **Cypher (at-risk modules — single owner + high criticality):**
```cypher
MATCH (m:Module {criticality: "high"})<-[:OWNS]-(owner:Person)
WITH m, collect(owner) AS owners
WHERE size(owners) = 1
RETURN m.id AS module_id, m.name AS module_name, owners[0].name AS sole_owner
```
- **Also returns:** `count(Person)`, `count(Module)`, `count(Project)` via simple `MATCH (n:Label) RETURN count(n)` queries.
- **Frontend:** stat cards (people/modules/projects count) + an "At Risk" table (module name, sole owner, criticality) with click-through to module detail.

### F5 — Person detail page

- **Endpoint:** `GET /api/people/{person_id}`
- **Cypher:**
```cypher
MATCH (p:Person {id: $person_id})
OPTIONAL MATCH (p)-[:HAS_SKILL]->(s:Skill)
OPTIONAL MATCH (p)-[:OWNS]->(m:Module)
OPTIONAL MATCH (p)-[:MEMBER_OF]->(t:Team)
RETURN p, collect(DISTINCT s.name) AS skills, collect(DISTINCT m.name) AS owned_modules, t.name AS team
```
- **Frontend components:** profile header, skills chip list, owned-modules list (links to F6), team badge, "What if they leave?" button → calls F2 + F3 endpoints on click, not on page load (avoid unnecessary query cost).

### F6 — Module detail page

- **Endpoint:** `GET /api/modules/{module_id}`
- **Cypher:**
```cypher
MATCH (m:Module {id: $module_id})
OPTIONAL MATCH (owner:Person)-[:OWNS]->(m)
OPTIONAL MATCH (contributor:Person)-[:CONTRIBUTES_TO]->(m)
OPTIONAL MATCH (m)-[:DEPENDS_ON]->(dep:Module)
OPTIONAL MATCH (m)<-[:DEPENDS_ON]-(dependent:Module)
RETURN m, owner.name AS owner,
       collect(DISTINCT contributor.name) AS contributors,
       collect(DISTINCT dep.name) AS depends_on,
       collect(DISTINCT dependent.name) AS depended_on_by
```
- **Frontend:** module header (name, criticality, project), owner + contributors list, two-column dependency view (upstream / downstream), optional mini dependency graph (O2 subset).

### F7 — Search / browse

- **Endpoint:** `GET /api/people?q=`, `GET /api/modules?q=`
- **Cypher:** simple `WHERE toLower(p.name) CONTAINS toLower($q)` filter — a plain string-match query (not graph-specific), included for navigation only.
- **Frontend:** a search bar on the dashboard, debounced, results as a dropdown list linking to detail pages.

### F8–F10 — Cross-cutting technical approach

- **Loading:** React state (`isLoading`) per fetch, skeleton components or spinners — no browser storage, in-memory state only.
- **Empty states:** explicit checks in components (e.g. `if (candidates.length === 0) → "No backup found — skill gap"` messaging, styled distinctly from a loading/error state).
- **Error handling:**
  - Backend: `try/except` around driver `session.run()` calls; catch `ServiceUnavailable`/`AuthError` from the Neo4j driver specifically, return `503` with a clear message.
  - Frontend: fetch wrapper catches non-2xx responses, surfaces a toast/banner ("Can't reach the database right now").

### F11 — Parameterized queries (technical convention)

All query functions live in `backend/app/queries/*.py`, each returning a `(cypher_string, params_dict)` tuple or directly executing via a shared `run_query(cypher, params)` helper wrapping the driver session — never f-string/`.format()` building of Cypher.

### F12 — Env config

`backend/.env` (gitignored): `COGNODB_URI`, `COGNODB_USER`, `COGNODB_PASSWORD`. Loaded via `python-dotenv` / `pydantic-settings` in `db.py`. `frontend/.env`: `VITE_API_BASE_URL` pointing at deployed backend.

---

## 7. Optional Feature Technical Notes (brief)

| ID | Technical approach |
|----|----------------------|
| O1 | Extend F3's Cypher to also `OPTIONAL MATCH (candidate)-[:CONTRIBUTES_TO]->(affected_module)` and weight it into `overlap_score` |
| O2 | `GET /api/graph` returning all `Module` nodes + `DEPENDS_ON` edges as `{nodes, links}`; rendered via `react-force-graph-2d` |
| O3 | `Module-[:PART_OF]->Project` aggregation query, similar shape to F4's at-risk query but grouped by project |
| O4 | Client-side sort/filter on already-fetched F4 dashboard data — no new endpoint needed |
## 8. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Database | CognoDB Cloud (managed graph DB, openCypher over Bolt) | Assignment requirement |
| DB Driver | Official `neo4j` Python driver | CognoDB is Bolt/Cypher-compatible; no custom SDK needed |
| Backend framework | **FastAPI** (Python 3.11+) | Async support, automatic OpenAPI docs, Pydantic validation built in |
| Backend server | Uvicorn | Standard ASGI server for FastAPI |
| Config management | `pydantic-settings` + `.env` file | Type-safe env var loading |
| Frontend framework | **React 18** (via Vite) | Fast dev server, minimal config, team familiarity |
| Frontend language | TypeScript | Type safety across API responses/components |
| Frontend data fetching | native `fetch` wrapped in a small `api/client.ts` module | No need for heavier libs (React Query optional stretch) |
| Graph visualization (O2) | `react-force-graph-2d` | Lightweight force-directed graph, works well with node/link JSON |
| Styling | Tailwind CSS | Fast to build clean, consistent UI without custom CSS overhead |
| Seed data generation | `Faker` (Python) | Realistic fake names/roles/data |
| Backend hosting | Render or Railway (free tier) | Simple Python app deploy, env var support |
| Frontend hosting | Vercel or Netlify (free tier) | Zero-config static/Vite deploy |
| Version control | Git + GitHub (monorepo) | Single repo, `backend/` and `frontend/` as top-level folders |

---

## 9. Project Structure (Monorepo)

```
org-graph-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app entrypoint, CORS, router registration
│   │   ├── db.py                      # Neo4j driver singleton, connection lifecycle (startup/shutdown)
│   │   ├── config.py                  # pydantic-settings: loads COGNODB_URI, COGNODB_USER, COGNODB_PASSWORD
│   │   ├── models.py                  # Pydantic response models (PersonOut, ModuleOut, ImpactResponse, etc.)
│   │   ├── routers/
│   │   │   ├── people.py              # /api/people, /api/people/{id}, /api/people/{id}/impact, /backup-candidates
│   │   │   ├── modules.py             # /api/modules, /api/modules/{id}
│   │   │   ├── dashboard.py           # /api/dashboard
│   │   │   └── graph.py               # /api/graph (O2, optional)
│   │   ├── queries/                   # ALL raw Cypher lives here, nowhere else
│   │   │   ├── people_queries.py      # impact(), backup_candidates(), get_person(), list_people()
│   │   │   ├── module_queries.py      # get_module(), list_modules()
│   │   │   └── dashboard_queries.py   # at_risk_modules(), counts()
│   │   └── exceptions.py              # custom exception classes + FastAPI exception handlers
│   ├── seed/
│   │   ├── seed_data.py               # generates + loads fake org data into CognoDB
│   │   └── constraints.py             # runs the CREATE CONSTRAINT statements once
│   ├── requirements.txt
│   ├── .env.example                   # COGNODB_URI=, COGNODB_USER=, COGNODB_PASSWORD=
│   └── .env                           # (gitignored, real secrets)
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                    # router setup (react-router-dom)
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # F4
│   │   │   ├── PersonDetail.tsx       # F5
│   │   │   ├── ModuleDetail.tsx       # F6
│   │   ├── components/
│   │   │   ├── ImpactPanel.tsx        # renders F2 + F3 results side by side
│   │   │   ├── SearchBar.tsx          # F7
│   │   │   ├── AtRiskTable.tsx        # dashboard at-risk list
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBanner.tsx
│   │   │   └── DependencyGraph.tsx    # O2, wraps react-force-graph-2d
│   │   ├── api/
│   │   │   └── client.ts              # fetch wrapper: base URL, error handling, typed responses
│   │   ├── types/
│   │   │   └── index.ts               # TS interfaces mirroring backend Pydantic models
│   │   └── styles/
│   │       └── index.css              # Tailwind entrypoint
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.example                   # VITE_API_BASE_URL=
│   └── .env                           # (gitignored)
│
├── docs/
│   └── data-model-diagram.png         # exported from Excalidraw/draw.io
│
├── README.md                          # use case, why-graph, setup, queries explained, screenshots
├── .gitignore                         # .env, node_modules, __pycache__, venv
└── FRD.md                             # this document
```

---

## 10. End-to-End Flow (How Everything Connects)

### 10.1 One-time setup flow

1. Developer signs up on CognoDB Cloud → creates a free `c0` instance → receives `bolt+s://<instance>.databases.cognodb.cloud` URI + password (shown once, saved to `backend/.env`)
2. `backend/seed/constraints.py` is run once → connects via the Neo4j driver → executes the `CREATE CONSTRAINT` statements from Section 5.3
3. `backend/seed/seed_data.py` is run once → generates fake Person/Module/Project/Team/Skill nodes and relationships via Faker → writes them into CognoDB using parameterized `CREATE`/`MERGE` Cypher statements, batched in a single session
4. Database now contains a fully connected graph, ready to query

### 10.2 Runtime request flow (typical page load — Person Detail example)

```
Browser (PersonDetail.tsx)
   │
   │  useEffect on mount → api/client.ts → fetch GET /api/people/{id}
   ▼
FastAPI (routers/people.py)
   │
   │  calls queries/people_queries.py → get_person(driver, person_id)
   ▼
db.py (Neo4j driver session)
   │
   │  session.run(cypher, params) over Bolt protocol
   ▼
CognoDB Cloud instance
   │
   │  executes Cypher, returns matched nodes/relationships
   ▼
queries/people_queries.py
   │
   │  transforms raw Neo4j records → plain dict
   ▼
models.py (Pydantic PersonOut)
   │
   │  validates/shapes the response
   ▼
FastAPI returns JSON
   │
   ▼
Frontend receives typed response → renders profile, skills, owned modules
   │
   │  user clicks "What if they leave?"
   ▼
Two parallel fetches: GET /api/people/{id}/impact + GET /api/people/{id}/backup-candidates
   │
   ▼
ImpactPanel.tsx renders both results side by side (broken pipeline | backup candidates)
```

### 10.3 Error flow

```
Neo4j driver raises ServiceUnavailable / AuthError
   │
   ▼
Caught in queries/*.py or a shared try/except wrapper in db.py
   │
   ▼
Custom exception (exceptions.py) raised → FastAPI exception handler
   │
   ▼
Returns HTTP 503 with { "error": "Database unavailable" }
   │
   ▼
Frontend api/client.ts catches non-2xx → throws typed error
   │
   ▼
Page component catches → renders <ErrorBanner /> instead of content
```

### 10.4 Deployment flow

1. Push monorepo to GitHub
2. Backend: connect repo to Render/Railway, set root directory to `backend/`, set env vars (`COGNODB_URI`, `COGNODB_USER`, `COGNODB_PASSWORD`) in the platform's dashboard (never in code), deploy
3. Frontend: connect repo to Vercel/Netlify, set root directory to `frontend/`, set `VITE_API_BASE_URL` to the deployed backend URL, deploy
4. Verify: open deployed frontend URL → confirm dashboard loads real data → record screen capture for submission
5. Keep the CognoDB instance running post-submission per assignment instructions

---

## 11. Local Development Setup (for someone new to the repo)

1. Clone the repo
2. **Backend:**
   ```
   cd backend
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env   # fill in CognoDB credentials
   python seed/constraints.py   # one-time
   python seed/seed_data.py     # one-time
   uvicorn app.main:app --reload
   ```
3. **Frontend:**
   ```
   cd frontend
   npm install
   cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:8000
   npm run dev
   ```
4. Open `http://localhost:5173` — dashboard should load live data from the local backend, which talks to the live CognoDB Cloud instance