from typing import List, Optional
from fastapi import APIRouter, Query
from app.models import ModuleDetail, ModuleSummary
from app.queries.module_queries import list_modules, get_module

router = APIRouter(prefix="/api/modules", tags=["Modules"])


@router.get("", response_model=List[ModuleSummary])
def read_modules(q: Optional[str] = Query(None, description="Search query by name or description")):
    """List all architectural modules in the organization."""
    return list_modules(search_query=q)


@router.get("/{module_id}", response_model=ModuleDetail)
def read_module_detail(module_id: str):
    """
    Retrieve module metadata, primary owner, contributors, and upstream/downstream dependencies (F6).
    """
    return get_module(module_id=module_id)
