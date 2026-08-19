from fastapi import APIRouter
from app.models import GraphData
from app.queries.graph_queries import get_graph_data

router = APIRouter(prefix="/api/graph", tags=["Graph Visualizer"])


@router.get("", response_model=GraphData)
def read_dependency_graph():
    """Retrieve all modules and dependency links for force-directed 2D graph visualization (O2)."""
    return get_graph_data()
