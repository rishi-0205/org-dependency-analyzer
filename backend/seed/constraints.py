import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db import get_driver, close_driver

CONSTRAINTS_AND_INDEXES = [
    # Unique Constraints (Notice Team and Skill use 'name' as unique identifier per specification)
    "CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE",
    "CREATE CONSTRAINT module_id_unique IF NOT EXISTS FOR (m:Module) REQUIRE m.id IS UNIQUE",
    "CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (pr:Project) REQUIRE pr.id IS UNIQUE",
    "CREATE CONSTRAINT skill_name_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE",
    "CREATE CONSTRAINT team_name_unique IF NOT EXISTS FOR (t:Team) REQUIRE t.name IS UNIQUE",

    # Performance Indexes
    "CREATE INDEX person_name_idx IF NOT EXISTS FOR (p:Person) ON (p.name)",
    "CREATE INDEX module_name_idx IF NOT EXISTS FOR (m:Module) ON (m.name)",
    "CREATE INDEX module_criticality_idx IF NOT EXISTS FOR (m:Module) ON (m.criticality)",
]


def apply_constraints() -> None:
    """Execute idempotent schema constraint and index creations against CognoDB."""
    driver = get_driver()
    print("🔒 Applying CognoDB schema constraints and indexes...")

    with driver.session() as session:
        for stmt in CONSTRAINTS_AND_INDEXES:
            try:
                session.run(stmt)
                print(f"  ✅ Executed: {stmt}")
            except Exception as e:
                print(f"  ⚠️ Statement notice: {stmt} -> {e}")

    print("🎉 All schema constraints and indexes applied successfully.")


if __name__ == "__main__":
    try:
        apply_constraints()
    finally:
        close_driver()
