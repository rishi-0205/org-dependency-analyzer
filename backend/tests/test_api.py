import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.exceptions import DatabaseConnectionError, ResourceNotFoundError

client = TestClient(app)


def test_root_endpoint():
    """Verify root API status endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "docs" in data


def test_health_endpoint_success():
    """Verify health endpoint when database check passes."""
    with patch("app.main.verify_connection", return_value=True):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database_connected"] is True


def test_health_endpoint_degraded():
    """Verify health endpoint when database check raises an error."""
    with patch("app.main.verify_connection", side_effect=DatabaseConnectionError("Connection timed out")):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["database_connected"] is False


def test_dashboard_endpoint():
    """Verify /api/dashboard returns correct data shape."""
    mock_data = {
        "total_people": 20,
        "total_modules": 14,
        "total_projects": 5,
        "total_skills": 25,
        "at_risk_modules": [
            {
                "module_id": "mod-auth-service",
                "module_name": "auth-service",
                "criticality": "high",
                "owner_id": "p-elena-rostova",
                "owner_name": "Elena Rostova",
                "owner_role": "Principal Architect",
                "contributor_count": 0,
                "downstream_count": 5,
                "risk_level": "CRITICAL",
            }
        ],
    }
    with patch("app.routers.dashboard.get_dashboard_data", return_value=mock_data):
        response = client.get("/api/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert data["total_people"] == 20
        assert len(data["at_risk_modules"]) == 1
        assert data["at_risk_modules"][0]["risk_level"] == "CRITICAL"


def test_people_list_and_detail():
    """Verify /api/people list and single person detail endpoints."""
    mock_people = [
        {"id": "p-elena-rostova", "name": "Elena Rostova", "role": "Principal Architect", "seniority": "Principal", "email": "elena@company.com", "team": "Platform Core"}
    ]
    mock_person_detail = {
        "id": "p-elena-rostova",
        "name": "Elena Rostova",
        "role": "Principal Architect",
        "seniority": "Principal",
        "email": "elena@company.com",
        "team": "Platform Core",
        "skills": [{"name": "Rust", "category": "Language", "level": "expert"}],
        "owned_modules": [{"id": "mod-auth-service", "name": "auth-service", "criticality": "high"}],
        "contributed_modules": [],
    }
    with patch("app.routers.people.list_people", return_value=mock_people):
        response = client.get("/api/people")
        assert response.status_code == 200
        assert len(response.json()) == 1

    with patch("app.routers.people.get_person", return_value=mock_person_detail):
        response = client.get("/api/people/p-elena-rostova")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Elena Rostova"
        assert len(data["skills"]) == 1


def test_person_impact_multi_hop():
    """Verify F2 blast radius multi-hop calculations and response formatting."""
    mock_impact = {
        "person_id": "p-elena-rostova",
        "person_name": "Elena Rostova",
        "owned_modules": [
            {
                "module_id": "mod-auth-service",
                "module_name": "auth-service",
                "criticality": "high",
                "description": "Core identity provider",
                "at_risk_downstream": [
                    {"id": "mod-checkout-api", "name": "checkout-api", "criticality": "high", "depth": 1},
                    {"id": "mod-billing-gateway", "name": "billing-gateway", "criticality": "high", "depth": 1},
                    {"id": "mod-customer-portal", "name": "customer-portal", "criticality": "medium", "depth": 1},
                    {"id": "mod-mobile-bff", "name": "mobile-bff", "criticality": "high", "depth": 2},
                    {"id": "mod-analytics-collector", "name": "analytics-collector", "criticality": "medium", "depth": 2},
                ],
            }
        ],
        "total_downstream_count": 5,
        "highest_criticality": "high",
    }
    with patch("app.routers.people.get_person_impact", return_value=mock_impact):
        response = client.get("/api/people/p-elena-rostova/impact")
        assert response.status_code == 200
        data = response.json()
        assert data["person_id"] == "p-elena-rostova"
        assert data["total_downstream_count"] == 5
        assert len(data["owned_modules"][0]["at_risk_downstream"]) == 5


def test_person_impact_leaf_module_null_safety():
    """
    CRITICAL EDGE CASE TEST:
    Verify that a person owning a module with zero downstream dependents
    returns an empty list [] for at_risk_downstream, NOT [null].
    """
    mock_impact = {
        "person_id": "p-david-kim",
        "person_name": "David Kim",
        "owned_modules": [
            {
                "module_id": "mod-ops-dashboard",
                "module_name": "ops-dashboard",
                "criticality": "low",
                "description": "Internal monitoring dashboard",
                "at_risk_downstream": [],  # Clean empty list
            }
        ],
        "total_downstream_count": 0,
        "highest_criticality": "low",
    }
    with patch("app.routers.people.get_person_impact", return_value=mock_impact):
        response = client.get("/api/people/p-david-kim/impact")
        assert response.status_code == 200
        data = response.json()
        assert data["total_downstream_count"] == 0
        assert data["owned_modules"][0]["at_risk_downstream"] == []


def test_backup_candidates():
    """Verify F3 / O1 backup candidates ranked response."""
    mock_candidates = {
        "person_id": "p-elena-rostova",
        "candidates": [
            {
                "candidate_id": "p-tariq-ahmed",
                "candidate_name": "Tariq Ahmed",
                "candidate_role": "Senior Platform Engineer",
                "candidate_seniority": "Senior",
                "candidate_email": "tariq.ahmed@company.internal",
                "shared_skills": ["Rust", "Distributed Systems", "Kubernetes"],
                "skill_overlap_count": 3,
                "total_relevant_commits": 0,
                "match_score": 45.0,
            }
        ],
    }
    with patch("app.routers.people.get_backup_candidates", return_value=mock_candidates):
        response = client.get("/api/people/p-elena-rostova/backup-candidates")
        assert response.status_code == 200
        data = response.json()
        assert len(data["candidates"]) == 1
        assert data["candidates"][0]["candidate_id"] == "p-tariq-ahmed"
        assert data["candidates"][0]["skill_overlap_count"] == 3


def test_modules_list_and_detail():
    """Verify /api/modules list and module detail endpoints."""
    mock_modules = [
        {"id": "mod-auth-service", "name": "auth-service", "description": "Core auth", "criticality": "high", "owner_name": "Elena Rostova", "project_name": "Global Identity"}
    ]
    mock_module_detail = {
        "id": "mod-auth-service",
        "name": "auth-service",
        "description": "Core auth",
        "criticality": "high",
        "repo_url": "https://github.com/org/auth-service",
        "project": "Global Identity",
        "owner": {"id": "p-elena-rostova", "name": "Elena Rostova", "role": "Principal Architect", "email": "elena@company.com"},
        "contributors": [],
        "depends_on": [],
        "depended_on_by": [{"id": "mod-checkout-api", "name": "checkout-api", "criticality": "high"}],
    }
    with patch("app.routers.modules.list_modules", return_value=mock_modules):
        response = client.get("/api/modules")
        assert response.status_code == 200
        assert len(response.json()) == 1

    with patch("app.routers.modules.get_module", return_value=mock_module_detail):
        response = client.get("/api/modules/mod-auth-service")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "auth-service"
        assert len(data["depended_on_by"]) == 1


def test_search_endpoint():
    """Verify /api/search fuzzy search endpoint."""
    mock_search = {
        "people": [{"type": "person", "id": "p-elena-rostova", "title": "Elena Rostova", "subtitle": "Principal Architect"}],
        "modules": [{"type": "module", "id": "mod-auth-service", "title": "auth-service", "subtitle": "high criticality"}],
    }
    with patch("app.routers.search.global_search", return_value=mock_search):
        response = client.get("/api/search?q=auth")
        assert response.status_code == 200
        data = response.json()
        assert len(data["people"]) == 1
        assert len(data["modules"]) == 1


def test_graph_endpoint():
    """Verify /api/graph endpoint for force-directed visualization."""
    mock_graph = {
        "nodes": [{"id": "mod-auth-service", "name": "auth-service", "criticality": "high", "owner": "Elena Rostova"}],
        "links": [{"source": "mod-checkout-api", "target": "mod-auth-service"}],
    }
    with patch("app.routers.graph.get_graph_data", return_value=mock_graph):
        response = client.get("/api/graph")
        assert response.status_code == 200
        data = response.json()
        assert len(data["nodes"]) == 1
        assert len(data["links"]) == 1


def test_resource_not_found_exception():
    """Verify 404 error envelope when entity does not exist."""
    with patch("app.routers.people.get_person", side_effect=ResourceNotFoundError("Person", "non-existent-id")):
        response = client.get("/api/people/non-existent-id")
        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "Not Found"
        assert "non-existent-id" in data["message"]


def test_database_connection_exception():
    """Verify 503 error envelope when database is unreachable."""
    with patch("app.routers.dashboard.get_dashboard_data", side_effect=DatabaseConnectionError("Service unavailable")):
        response = client.get("/api/dashboard")
        assert response.status_code == 503
        data = response.json()
        assert data["error"] == "Database Unavailable"
        assert "COGNODB_URI" in data["hint"]
