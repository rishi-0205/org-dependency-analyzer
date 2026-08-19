from fastapi import APIRouter
from app.models import DashboardStats
from app.queries.dashboard_queries import get_dashboard_data

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardStats)
def read_dashboard():
    """Retrieve high-level organizational stats and critical single-owner at-risk modules (F4)."""
    return get_dashboard_data()
