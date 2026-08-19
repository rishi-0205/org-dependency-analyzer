from fastapi import APIRouter, Query
from app.models import SearchResult
from app.queries.graph_queries import global_search

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get("", response_model=SearchResult)
def execute_search(q: str = Query("", description="Keyword to search across people and modules")):
    """Global search across people and modules for dashboard navigation (F7)."""
    return global_search(query=q)
