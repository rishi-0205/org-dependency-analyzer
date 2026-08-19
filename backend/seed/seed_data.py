import sys
import os
import random
from typing import Dict, List, Any

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db import get_driver, close_driver

# Deterministic random seed for reproducible graph generation
random.seed(42)

# ==========================================
# 1. STATIC ORGANIZATIONAL SEED DEFINITIONS
# ==========================================

TEAMS = [
    {"name": "Platform Core"},
    {"name": "Payments & Billing"},
    {"name": "E-Commerce Core"},
    {"name": "Customer Experience"},
    {"name": "Data & Analytics"},
    {"name": "Developer Operations"},
]

SKILLS = [
    # Languages
    {"name": "Rust", "category": "Language"},
    {"name": "Go", "category": "Language"},
    {"name": "Python", "category": "Language"},
    {"name": "TypeScript", "category": "Language"},
    {"name": "Java", "category": "Language"},
    {"name": "C++", "category": "Language"},
    # Infrastructure & Ops
    {"name": "Kubernetes", "category": "Infrastructure"},
    {"name": "Docker", "category": "Infrastructure"},
    {"name": "Terraform", "category": "Infrastructure"},
    {"name": "AWS Architecture", "category": "Infrastructure"},
    {"name": "Kafka", "category": "Infrastructure"},
    {"name": "GraphQL", "category": "Infrastructure"},
    # Architecture & Domain
    {"name": "Distributed Systems", "category": "Architecture"},
    {"name": "OAuth2 / OIDC", "category": "Architecture"},
    {"name": "Microservices Design", "category": "Architecture"},
    {"name": "Zero-Trust Security", "category": "Architecture"},
    {"name": "PCI-DSS Compliance", "category": "Domain"},
    {"name": "Payment Gateways", "category": "Domain"},
    {"name": "Search & Recommendation", "category": "Domain"},
    {"name": "Data Warehousing", "category": "Domain"},
    # Frontend & Design
    {"name": "React", "category": "Frontend"},
    {"name": "Next.js", "category": "Frontend"},
    {"name": "Tailwind CSS", "category": "Frontend"},
    {"name": "Accessibility (a11y)", "category": "Frontend"},
    {"name": "Web Performance", "category": "Frontend"},
]

PROJECTS = [
    {"id": "proj-auth-federation", "name": "Global Identity Federation", "status": "active"},
    {"id": "proj-checkout-revamp", "name": "One-Click Checkout V3", "status": "active"},
    {"id": "proj-analytics-lakehouse", "name": "Real-time Lakehouse Core", "status": "active"},
    {"id": "proj-mobile-redesign", "name": "Omnichannel Mobile Suite", "status": "active"},
    {"id": "proj-infra-modernization", "name": "Kubernetes Multi-Region Mesh", "status": "active"},
]

PEOPLE = [
    # Key Bottleneck Architect 1 (Elena Rostova - Auth SPoF)
    {
        "id": "p-elena-rostova",
        "name": "Elena Rostova",
        "role": "Principal Infrastructure Architect",
        "seniority": "Principal",
        "email": "elena.rostova@company.internal",
        "team": "Platform Core",
        "skills": [
            {"name": "Rust", "level": "expert"},
            {"name": "Distributed Systems", "level": "expert"},
            {"name": "OAuth2 / OIDC", "level": "expert"},
            {"name": "Kubernetes", "level": "expert"},
            {"name": "Zero-Trust Security", "level": "expert"},
        ],
    },
    # Key Bottleneck Architect 2 (Marcus Vance - Payment SPoF)
    {
        "id": "p-marcus-vance",
        "name": "Marcus Vance",
        "role": "Staff Backend Engineer",
        "seniority": "Staff",
        "email": "marcus.vance@company.internal",
        "team": "Payments & Billing",
        "skills": [
            {"name": "Go", "level": "expert"},
            {"name": "PCI-DSS Compliance", "level": "expert"},
            {"name": "Payment Gateways", "level": "expert"},
            {"name": "Kafka", "level": "intermediate"},
            {"name": "Microservices Design", "level": "expert"},
        ],
    },
    # Lead Engineer 3 (Sarah Chen - Healthy Module with Backups)
    {
        "id": "p-sarah-chen",
        "name": "Sarah Chen",
        "role": "Staff Frontend Engineer",
        "seniority": "Staff",
        "email": "sarah.chen@company.internal",
        "team": "Customer Experience",
        "skills": [
            {"name": "React", "level": "expert"},
            {"name": "TypeScript", "level": "expert"},
            {"name": "Tailwind CSS", "level": "expert"},
            {"name": "Accessibility (a11y)", "level": "expert"},
            {"name": "Web Performance", "level": "expert"},
        ],
    },
    # Potential Backfill Candidate for Elena with partial skill overlap
    {
        "id": "p-tariq-ahmed",
        "name": "Tariq Ahmed",
        "role": "Senior Cloud Platform Engineer",
        "seniority": "Senior",
        "email": "tariq.ahmed@company.internal",
        "team": "Platform Core",
        "skills": [
            {"name": "Kubernetes", "level": "expert"},
            {"name": "Distributed Systems", "level": "intermediate"},
            {"name": "Terraform", "level": "expert"},
            {"name": "Go", "level": "intermediate"},
            {"name": "Rust", "level": "intermediate"},
        ],
    },
    # Backfill Candidate for Payments
    {
        "id": "p-priya-patel",
        "name": "Priya Patel",
        "role": "Senior Payments Engineer",
        "seniority": "Senior",
        "email": "priya.patel@company.internal",
        "team": "Payments & Billing",
        "skills": [
            {"name": "Go", "level": "expert"},
            {"name": "Payment Gateways", "level": "intermediate"},
            {"name": "Kafka", "level": "intermediate"},
            {"name": "Microservices Design", "level": "intermediate"},
        ],
    },
    # Leaf Module Owner 1 (David Kim - Zero Downstream Modules)
    {
        "id": "p-david-kim",
        "name": "David Kim",
        "role": "DevOps Engineer",
        "seniority": "Mid",
        "email": "david.kim@company.internal",
        "team": "Developer Operations",
        "skills": [
            {"name": "Docker", "level": "expert"},
            {"name": "Kubernetes", "level": "intermediate"},
            {"name": "Python", "level": "intermediate"},
        ],
    },
    # Leaf Module Owner 2 (Amina Diallo)
    {
        "id": "p-amina-diallo",
        "name": "Amina Diallo",
        "role": "Data Analyst & Engineer",
        "seniority": "Senior",
        "email": "amina.diallo@company.internal",
        "team": "Data & Analytics",
        "skills": [
            {"name": "Python", "level": "expert"},
            {"name": "Data Warehousing", "level": "expert"},
            {"name": "Kafka", "level": "intermediate"},
        ],
    },
    # Additional Engineers across teams
    {
        "id": "p-lucas-silva",
        "name": "Lucas Silva",
        "role": "Frontend Engineer",
        "seniority": "Mid",
        "email": "lucas.silva@company.internal",
        "team": "Customer Experience",
        "skills": [
            {"name": "React", "level": "intermediate"},
            {"name": "TypeScript", "level": "expert"},
            {"name": "Tailwind CSS", "level": "intermediate"},
        ],
    },
    {
        "id": "p-chloe-dupont",
        "name": "Chloe Dupont",
        "role": "UI/UX Frontend Specialist",
        "seniority": "Senior",
        "email": "chloe.dupont@company.internal",
        "team": "Customer Experience",
        "skills": [
            {"name": "React", "level": "expert"},
            {"name": "TypeScript", "level": "intermediate"},
            {"name": "Accessibility (a11y)", "level": "expert"},
            {"name": "Next.js", "level": "intermediate"},
        ],
    },
    {
        "id": "p-alex-novak",
        "name": "Alex Novak",
        "role": "Backend Engineer",
        "seniority": "Mid",
        "email": "alex.novak@company.internal",
        "team": "E-Commerce Core",
        "skills": [
            {"name": "Go", "level": "intermediate"},
            {"name": "GraphQL", "level": "intermediate"},
            {"name": "Docker", "level": "intermediate"},
        ],
    },
    {
        "id": "p-mei-ling",
        "name": "Mei Ling",
        "role": "Lead Data Architect",
        "seniority": "Lead",
        "email": "mei.ling@company.internal",
        "team": "Data & Analytics",
        "skills": [
            {"name": "Python", "level": "expert"},
            {"name": "Kafka", "level": "expert"},
            {"name": "Data Warehousing", "level": "expert"},
            {"name": "Distributed Systems", "level": "intermediate"},
        ],
    },
    {
        "id": "p-jordan-reed",
        "name": "Jordan Reed",
        "role": "Site Reliability Engineer",
        "seniority": "Senior",
        "email": "jordan.reed@company.internal",
        "team": "Developer Operations",
        "skills": [
            {"name": "Terraform", "level": "expert"},
            {"name": "AWS Architecture", "level": "expert"},
            {"name": "Kubernetes", "level": "expert"},
            {"name": "Python", "level": "intermediate"},
        ],
    },
    {
        "id": "p-hannah-becker",
        "name": "Hannah Becker",
        "role": "Fullstack Engineer",
        "seniority": "Mid",
        "email": "hannah.becker@company.internal",
        "team": "E-Commerce Core",
        "skills": [
            {"name": "TypeScript", "level": "intermediate"},
            {"name": "React", "level": "intermediate"},
            {"name": "GraphQL", "level": "intermediate"},
            {"name": "Go", "level": "beginner"},
        ],
    },
    {
        "id": "p-omar-farooq",
        "name": "Omar Farooq",
        "role": "Security & Compliance Engineer",
        "seniority": "Senior",
        "email": "omar.farooq@company.internal",
        "team": "Platform Core",
        "skills": [
            {"name": "Zero-Trust Security", "level": "expert"},
            {"name": "OAuth2 / OIDC", "level": "intermediate"},
            {"name": "Kubernetes", "level": "intermediate"},
        ],
    },
    {
        "id": "p-sophia-martinez",
        "name": "Sophia Martinez",
        "role": "Backend Services Lead",
        "seniority": "Lead",
        "email": "sophia.martinez@company.internal",
        "team": "E-Commerce Core",
        "skills": [
            {"name": "Go", "level": "expert"},
            {"name": "Microservices Design", "level": "expert"},
            {"name": "Kafka", "level": "intermediate"},
            {"name": "GraphQL", "level": "expert"},
        ],
    },
    {
        "id": "p-liam-obrien",
        "name": "Liam O'Brien",
        "role": "Infrastructure Automation Engineer",
        "seniority": "Mid",
        "email": "liam.obrien@company.internal",
        "team": "Developer Operations",
        "skills": [
            {"name": "Terraform", "level": "intermediate"},
            {"name": "Docker", "level": "expert"},
            {"name": "AWS Architecture", "level": "intermediate"},
        ],
    },
    {
        "id": "p-nina-petrov",
        "name": "Nina Petrov",
        "role": "Machine Learning Engineer",
        "seniority": "Senior",
        "email": "nina.petrov@company.internal",
        "team": "Data & Analytics",
        "skills": [
            {"name": "Python", "level": "expert"},
            {"name": "Search & Recommendation", "level": "expert"},
            {"name": "Distributed Systems", "level": "intermediate"},
        ],
    },
    {
        "id": "p-carlos-gomez",
        "name": "Carlos Gomez",
        "role": "Mobile Applications Lead",
        "seniority": "Lead",
        "email": "carlos.gomez@company.internal",
        "team": "Customer Experience",
        "skills": [
            {"name": "TypeScript", "level": "expert"},
            {"name": "React", "level": "expert"},
            {"name": "GraphQL", "level": "intermediate"},
            {"name": "Web Performance", "level": "intermediate"},
        ],
    },
    {
        "id": "p-ananya-sharma",
        "name": "Ananya Sharma",
        "role": "Billing Systems Engineer",
        "seniority": "Senior",
        "email": "ananya.sharma@company.internal",
        "team": "Payments & Billing",
        "skills": [
            {"name": "Go", "level": "intermediate"},
            {"name": "Payment Gateways", "level": "intermediate"},
            {"name": "PCI-DSS Compliance", "level": "intermediate"},
        ],
    },
    {
        "id": "p-kevin-larson",
        "name": "Kevin Larson",
        "role": "Frontend Engineer",
        "seniority": "Junior",
        "email": "kevin.larson@company.internal",
        "team": "Customer Experience",
        "skills": [
            {"name": "React", "level": "beginner"},
            {"name": "TypeScript", "level": "beginner"},
            {"name": "Tailwind CSS", "level": "intermediate"},
        ],
    },
]

MODULES = [
    # High Criticality Single-Owner Bottlenecks
    {
        "id": "mod-auth-service",
        "name": "auth-service",
        "description": "Core identity provider, token issuance, and zero-trust authentication gateway",
        "criticality": "high",
        "repo_url": "https://github.com/org/auth-service",
        "project": "proj-auth-federation",
        "owner_id": "p-elena-rostova",
        "contributors": [],  # SPoF: 0 contributors
    },
    {
        "id": "mod-payment-gateway",
        "name": "payment-gateway",
        "description": "PCI-compliant payment processing broker and transaction ledger",
        "criticality": "high",
        "repo_url": "https://github.com/org/payment-gateway",
        "project": "proj-checkout-revamp",
        "owner_id": "p-marcus-vance",
        "contributors": [],  # SPoF: 0 contributors
    },
    # Downstream dependants on auth-service and payment-gateway
    {
        "id": "mod-checkout-api",
        "name": "checkout-api",
        "description": "Orchestrates cart checkout and inventory reservations",
        "criticality": "high",
        "repo_url": "https://github.com/org/checkout-api",
        "project": "proj-checkout-revamp",
        "owner_id": "p-sophia-martinez",
        "contributors": [
            {"person_id": "p-alex-novak", "commits": 142, "last_active": "2026-08-10"},
            {"person_id": "p-hannah-becker", "commits": 68, "last_active": "2026-08-04"},
        ],
    },
    {
        "id": "mod-billing-gateway",
        "name": "billing-gateway",
        "description": "Invoice reconciliation, tax calculation, and receipt generation",
        "criticality": "high",
        "repo_url": "https://github.com/org/billing-gateway",
        "project": "proj-checkout-revamp",
        "owner_id": "p-ananya-sharma",
        "contributors": [
            {"person_id": "p-priya-patel", "commits": 85, "last_active": "2026-07-28"},
        ],
    },
    {
        "id": "mod-customer-portal",
        "name": "customer-portal",
        "description": "Web client dashboard for customer order management and profile settings",
        "criticality": "medium",
        "repo_url": "https://github.com/org/customer-portal",
        "project": "proj-mobile-redesign",
        "owner_id": "p-lucas-silva",
        "contributors": [
            {"person_id": "p-chloe-dupont", "commits": 94, "last_active": "2026-08-12"},
        ],
    },
    {
        "id": "mod-mobile-bff",
        "name": "mobile-bff",
        "description": "Backend-for-Frontend API gateway powering iOS and Android native apps",
        "criticality": "high",
        "repo_url": "https://github.com/org/mobile-bff",
        "project": "proj-mobile-redesign",
        "owner_id": "p-carlos-gomez",
        "contributors": [
            {"person_id": "p-hannah-becker", "commits": 45, "last_active": "2026-08-01"},
        ],
    },
    {
        "id": "mod-analytics-collector",
        "name": "analytics-collector",
        "description": "High-throughput telemetry ingestion pipeline for business intelligence",
        "criticality": "medium",
        "repo_url": "https://github.com/org/analytics-collector",
        "project": "proj-analytics-lakehouse",
        "owner_id": "p-mei-ling",
        "contributors": [
            {"person_id": "p-nina-petrov", "commits": 110, "last_active": "2026-08-15"},
        ],
    },
    {
        "id": "mod-subscription-engine",
        "name": "subscription-engine",
        "description": "Recurring billing lifecycle, tiered memberships, and churn recovery",
        "criticality": "high",
        "repo_url": "https://github.com/org/subscription-engine",
        "project": "proj-checkout-revamp",
        "owner_id": "p-priya-patel",
        "contributors": [
            {"person_id": "p-ananya-sharma", "commits": 78, "last_active": "2026-08-11"},
        ],
    },
    {
        "id": "mod-order-fulfillment",
        "name": "order-fulfillment",
        "description": "Warehouse routing, carrier label generation, and dispatch tracking",
        "criticality": "medium",
        "repo_url": "https://github.com/org/order-fulfillment",
        "project": "proj-checkout-revamp",
        "owner_id": "p-alex-novak",
        "contributors": [
            {"person_id": "p-sophia-martinez", "commits": 52, "last_active": "2026-07-20"},
        ],
    },
    # Healthy Distributed Module (Sarah Chen Lead + 4 active contributors)
    {
        "id": "mod-design-system-core",
        "name": "design-system-core",
        "description": "Shared React component library, accessibility primitives, and design tokens",
        "criticality": "medium",
        "repo_url": "https://github.com/org/design-system-core",
        "project": "proj-mobile-redesign",
        "owner_id": "p-sarah-chen",
        "contributors": [
            {"person_id": "p-lucas-silva", "commits": 210, "last_active": "2026-08-18"},
            {"person_id": "p-chloe-dupont", "commits": 185, "last_active": "2026-08-16"},
            {"person_id": "p-carlos-gomez", "commits": 120, "last_active": "2026-08-05"},
            {"person_id": "p-kevin-larson", "commits": 64, "last_active": "2026-08-14"},
        ],
    },
    # Leaf Modules with 0 Downstream Dependants (Testing null safety on F2 Blast Radius)
    {
        "id": "mod-ops-dashboard",
        "name": "ops-dashboard",
        "description": "Internal operations monitoring dashboard and cluster health inspector",
        "criticality": "low",
        "repo_url": "https://github.com/org/ops-dashboard",
        "project": "proj-infra-modernization",
        "owner_id": "p-david-kim",
        "contributors": [
            {"person_id": "p-jordan-reed", "commits": 32, "last_active": "2026-06-15"},
        ],
    },
    {
        "id": "mod-internal-reporting-tools",
        "name": "internal-reporting-tools",
        "description": "Ad-hoc financial and operational metric export utilities",
        "criticality": "low",
        "repo_url": "https://github.com/org/internal-reporting-tools",
        "project": "proj-analytics-lakehouse",
        "owner_id": "p-amina-diallo",
        "contributors": [],
    },
    # Infrastructure Modules
    {
        "id": "mod-k8s-mesh-controller",
        "name": "k8s-mesh-controller",
        "description": "Multi-cluster Istio service mesh ingress routing and mutual TLS controller",
        "criticality": "high",
        "repo_url": "https://github.com/org/k8s-mesh-controller",
        "project": "proj-infra-modernization",
        "owner_id": "p-tariq-ahmed",
        "contributors": [
            {"person_id": "p-jordan-reed", "commits": 98, "last_active": "2026-08-12"},
            {"person_id": "p-liam-obrien", "commits": 44, "last_active": "2026-07-29"},
        ],
    },
    {
        "id": "mod-search-engine",
        "name": "search-engine",
        "description": "Semantic product catalog search index and vector recommendation engine",
        "criticality": "high",
        "repo_url": "https://github.com/org/search-engine",
        "project": "proj-analytics-lakehouse",
        "owner_id": "p-nina-petrov",
        "contributors": [
            {"person_id": "p-mei-ling", "commits": 60, "last_active": "2026-08-08"},
        ],
    },
]

# Directed module dependencies: (downstream) -[:DEPENDS_ON]-> (upstream)
# Reading: "checkout-api depends on auth-service"
MODULE_DEPENDENCIES = [
    # Elena's auth-service blast radius (5 downstream services)
    {"downstream": "mod-checkout-api", "upstream": "mod-auth-service"},
    {"downstream": "mod-billing-gateway", "upstream": "mod-auth-service"},
    {"downstream": "mod-customer-portal", "upstream": "mod-auth-service"},
    {"downstream": "mod-mobile-bff", "upstream": "mod-auth-service"},
    {"downstream": "mod-mobile-bff", "upstream": "mod-customer-portal"},  # 2-hop path to auth-service
    {"downstream": "mod-analytics-collector", "upstream": "mod-billing-gateway"},  # 2-hop path to auth-service

    # Marcus's payment-gateway blast radius (2 downstream services)
    {"downstream": "mod-subscription-engine", "upstream": "mod-payment-gateway"},
    {"downstream": "mod-order-fulfillment", "upstream": "mod-payment-gateway"},
    {"downstream": "mod-checkout-api", "upstream": "mod-payment-gateway"},

    # UI dependencies on design-system-core
    {"downstream": "mod-customer-portal", "upstream": "mod-design-system-core"},
    {"downstream": "mod-ops-dashboard", "upstream": "mod-design-system-core"},

    # Search & analytics dependencies
    {"downstream": "mod-checkout-api", "upstream": "mod-search-engine"},
]


# ==========================================
# 2. DATABASE SEED EXECUTION ENGINE
# ==========================================

def clean_database(session) -> None:
    """Clear existing graph nodes and relationships cleanly."""
    print("🧹 Cleaning existing graph database nodes and relationships...")
    session.run("MATCH (n) DETACH DELETE n")
    print("  ✅ Database purged.")


def seed_teams(session) -> None:
    print(f"👥 Seeding {len(TEAMS)} Teams...")
    for team in TEAMS:
        session.run(
            "MERGE (t:Team {name: $name})",
            {"name": team["name"]}
        )


def seed_skills(session) -> None:
    print(f"💡 Seeding {len(SKILLS)} Skills...")
    for skill in SKILLS:
        session.run(
            "MERGE (s:Skill {name: $name}) SET s.category = $category",
            {"name": skill["name"], "category": skill["category"]}
        )


def seed_projects(session) -> None:
    print(f"🚀 Seeding {len(PROJECTS)} Projects...")
    for project in PROJECTS:
        session.run(
            "MERGE (pr:Project {id: $id}) SET pr.name = $name, pr.status = $status",
            {"id": project["id"], "name": project["name"], "status": project["status"]}
        )


def seed_people(session) -> None:
    print(f"👤 Seeding {len(PEOPLE)} People, Team memberships, and Skills...")
    for person in PEOPLE:
        # Create Person node
        session.run(
            """
            MERGE (p:Person {id: $id})
            SET p.name = $name,
                p.role = $role,
                p.seniority = $seniority,
                p.email = $email
            """,
            {
                "id": person["id"],
                "name": person["name"],
                "role": person["role"],
                "seniority": person["seniority"],
                "email": person["email"],
            }
        )

        # Connect to Team by name
        session.run(
            """
            MATCH (p:Person {id: $person_id})
            MATCH (t:Team {name: $team_name})
            MERGE (p)-[:MEMBER_OF]->(t)
            """,
            {"person_id": person["id"], "team_name": person["team"]}
        )

        # Connect to Skills by name with proficiency level
        for skill_info in person.get("skills", []):
            session.run(
                """
                MATCH (p:Person {id: $person_id})
                MATCH (s:Skill {name: $skill_name})
                MERGE (p)-[hs:HAS_SKILL]->(s)
                SET hs.level = $level
                """,
                {
                    "person_id": person["id"],
                    "skill_name": skill_info["name"],
                    "level": skill_info["level"],
                }
            )


def seed_modules_and_dependencies(session) -> None:
    print(f"📦 Seeding {len(MODULES)} Modules, Owners, and Contributors...")
    for module in MODULES:
        # Create Module node
        session.run(
            """
            MERGE (m:Module {id: $id})
            SET m.name = $name,
                m.description = $description,
                m.criticality = $criticality,
                m.repo_url = $repo_url
            """,
            {
                "id": module["id"],
                "name": module["name"],
                "description": module["description"],
                "criticality": module["criticality"],
                "repo_url": module["repo_url"],
            }
        )

        # Connect to Project
        session.run(
            """
            MATCH (m:Module {id: $module_id})
            MATCH (pr:Project {id: $project_id})
            MERGE (m)-[:PART_OF]->(pr)
            """,
            {"module_id": module["id"], "project_id": module["project"]}
        )

        # Connect Owner (1 owner per module)
        session.run(
            """
            MATCH (p:Person {id: $person_id})
            MATCH (m:Module {id: $module_id})
            MERGE (p)-[:OWNS]->(m)
            """,
            {"person_id": module["owner_id"], "module_id": module["id"]}
        )

        # Connect Contributors
        for contributor in module.get("contributors", []):
            session.run(
                """
                MATCH (p:Person {id: $person_id})
                MATCH (m:Module {id: $module_id})
                MERGE (p)-[c:CONTRIBUTES_TO]->(m)
                SET c.commits = $commits,
                    c.last_active = $last_active
                """,
                {
                    "person_id": contributor["person_id"],
                    "module_id": module["id"],
                    "commits": contributor["commits"],
                    "last_active": contributor["last_active"],
                }
            )

    print(f"🔗 Seeding {len(MODULE_DEPENDENCIES)} Module-to-Module DEPENDS_ON relationships...")
    for dep in MODULE_DEPENDENCIES:
        session.run(
            """
            MATCH (downstream:Module {id: $downstream_id})
            MATCH (upstream:Module {id: $upstream_id})
            MERGE (downstream)-[:DEPENDS_ON]->(upstream)
            """,
            {"downstream_id": dep["downstream"], "upstream_id": dep["upstream"]}
        )


def verify_seeded_graph(session) -> None:
    """Validate graph counts and key test queries."""
    counts = session.run(
        """
        MATCH (p:Person) WITH count(p) AS people
        MATCH (m:Module) WITH people, count(m) AS modules
        MATCH (pr:Project) WITH people, modules, count(pr) AS projects
        MATCH (t:Team) WITH people, modules, projects, count(t) AS teams
        MATCH (s:Skill) WITH people, modules, projects, teams, count(s) AS skills
        RETURN people, modules, projects, teams, skills
        """
    ).single()

    print("\n📊 Graph Seeding Summary Statistics:")
    print(f"  • People:   {counts['people']}")
    print(f"  • Modules:  {counts['modules']}")
    print(f"  • Projects: {counts['projects']}")
    print(f"  • Teams:    {counts['teams']}")
    print(f"  • Skills:   {counts['skills']}")

    # Check Elena's Blast Radius
    elena_blast = session.run(
        """
        MATCH (a:Person {id: 'p-elena-rostova'})-[:OWNS]->(m:Module)
        OPTIONAL MATCH path = (downstream:Module)-[:DEPENDS_ON*1..3]->(m)
        WITH m, downstream, min(length(path)) AS depth
        RETURN m.name AS module_name,
               collect(
                 CASE WHEN downstream IS NOT NULL THEN {
                   id: downstream.id,
                   name: downstream.name,
                   depth: depth
                 } END
               ) AS at_risk_downstream
        """
    ).single()

    print(f"\n🔍 Blast Radius Verification (Elena Rostova - {elena_blast['module_name']}):")
    print(f"  • Cascading downstream services impacted: {len(elena_blast['at_risk_downstream'])}")
    for svc in elena_blast["at_risk_downstream"]:
        print(f"    - [{svc['depth']} hop] {svc['name']}")

    # Check David Kim's Zero-Dependent Leaf Module
    david_blast = session.run(
        """
        MATCH (a:Person {id: 'p-david-kim'})-[:OWNS]->(m:Module)
        OPTIONAL MATCH path = (downstream:Module)-[:DEPENDS_ON*1..3]->(m)
        WITH m, downstream, min(length(path)) AS depth
        RETURN m.name AS module_name,
               collect(
                 CASE WHEN downstream IS NOT NULL THEN {
                   id: downstream.id,
                   name: downstream.name,
                   depth: depth
                 } END
               ) AS at_risk_downstream
        """
    ).single()

    print(f"\n🔍 Leaf Module Verification (David Kim - {david_blast['module_name']}):")
    print(f"  • Downstream list: {david_blast['at_risk_downstream']} (Must be empty list [])")


def run_seed() -> None:
    """Execute complete database seeding."""
    driver = get_driver()
    with driver.session() as session:
        clean_database(session)
        seed_teams(session)
        seed_skills(session)
        seed_projects(session)
        seed_people(session)
        seed_modules_and_dependencies(session)
        verify_seeded_graph(session)
    print("\n🎉 Seed data generation and validation complete!")


if __name__ == "__main__":
    try:
        run_seed()
    finally:
        close_driver()
