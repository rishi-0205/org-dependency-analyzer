from typing import List, Optional
from fastapi import APIRouter, Query
from app.models import PersonDetail, PersonSummary, ImpactResponse, CandidateResponse
from app.queries.people_queries import (
    list_people,
    get_person,
    get_person_impact,
    get_backup_candidates,
)

router = APIRouter(prefix="/api/people", tags=["People"])


@router.get("", response_model=List[PersonSummary])
def read_people(q: Optional[str] = Query(None, description="Search query by name or role")):
    """List all people or filter by keyword."""
    return list_people(search_query=q)


@router.get("/{person_id}", response_model=PersonDetail)
def read_person_detail(person_id: str):
    """Retrieve detailed profile, skills, and owned modules for a person (F5)."""
    return get_person(person_id=person_id)


@router.get("/{person_id}/impact", response_model=ImpactResponse)
def read_person_impact(person_id: str):
    """
    Calculate blast radius when a person leaves the organization (F2).
    Evaluates multi-hop downstream cascading service dependencies.
    """
    return get_person_impact(person_id=person_id)


@router.get("/{person_id}/backup-candidates", response_model=CandidateResponse)
def read_backup_candidates(person_id: str):
    """
    Find and rank replacement candidates based on skill overlap and module contributions (F3 / O1).
    """
    return get_backup_candidates(person_id=person_id)
