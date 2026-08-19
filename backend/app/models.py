from typing import List, Optional
from pydantic import BaseModel, Field


# ==========================================
# 1. DASHBOARD & RISK METRIC MODELS
# ==========================================

class AtRiskModule(BaseModel):
    module_id: str
    module_name: str
    criticality: str
    owner_id: str
    owner_name: str
    owner_role: Optional[str] = None
    contributor_count: int = 0
    downstream_count: int = 0
    risk_level: str = "HIGH"  # CRITICAL, HIGH, MEDIUM


class DashboardStats(BaseModel):
    total_people: int
    total_modules: int
    total_projects: int
    total_skills: int
    at_risk_modules: List[AtRiskModule] = Field(default_factory=list)


# ==========================================
# 2. IMPACT & BLAST RADIUS MODELS (F2)
# ==========================================

class DownstreamModule(BaseModel):
    id: str
    name: str
    criticality: Optional[str] = "medium"
    depth: int = 1


class OwnedModuleImpact(BaseModel):
    module_id: str
    module_name: str
    criticality: str
    description: Optional[str] = None
    at_risk_downstream: List[DownstreamModule] = Field(default_factory=list)


class ImpactResponse(BaseModel):
    person_id: str
    person_name: Optional[str] = None
    owned_modules: List[OwnedModuleImpact] = Field(default_factory=list)
    total_downstream_count: int = 0
    highest_criticality: Optional[str] = None


# ==========================================
# 3. BACKFILL CANDIDATE MODELS (F3 / O1)
# ==========================================

class BackupCandidate(BaseModel):
    candidate_id: str
    candidate_name: str
    candidate_role: str
    candidate_seniority: str
    candidate_email: str
    shared_skills: List[str] = Field(default_factory=list)
    skill_overlap_count: int = 0
    total_relevant_commits: int = 0
    match_score: float = 0.0


class CandidateResponse(BaseModel):
    person_id: str
    candidates: List[BackupCandidate] = Field(default_factory=list)


# ==========================================
# 4. PERSON DETAIL & PROFILE MODELS (F5)
# ==========================================

class SkillDetail(BaseModel):
    name: str
    category: Optional[str] = None
    level: Optional[str] = "intermediate"


class OwnedModuleRef(BaseModel):
    id: str
    name: str
    criticality: str


class ContributedModuleRef(BaseModel):
    id: str
    name: str
    commits: int = 0
    last_active: Optional[str] = None


class PersonDetail(BaseModel):
    id: str
    name: str
    role: str
    seniority: str
    email: str
    team: Optional[str] = None
    skills: List[SkillDetail] = Field(default_factory=list)
    owned_modules: List[OwnedModuleRef] = Field(default_factory=list)
    contributed_modules: List[ContributedModuleRef] = Field(default_factory=list)


class PersonSummary(BaseModel):
    id: str
    name: str
    role: str
    seniority: str
    email: str
    team: Optional[str] = None


# ==========================================
# 5. MODULE DETAIL MODELS (F6)
# ==========================================

class OwnerRef(BaseModel):
    id: str
    name: str
    role: Optional[str] = None
    email: Optional[str] = None


class ContributorRef(BaseModel):
    id: str
    name: str
    commits: int = 0
    last_active: Optional[str] = None


class ModuleRef(BaseModel):
    id: str
    name: str
    criticality: Optional[str] = "medium"


class ModuleDetail(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    criticality: str
    repo_url: Optional[str] = None
    project: Optional[str] = None
    owner: Optional[OwnerRef] = None
    contributors: List[ContributorRef] = Field(default_factory=list)
    depends_on: List[ModuleRef] = Field(default_factory=list)  # Upstream dependencies
    depended_on_by: List[ModuleRef] = Field(default_factory=list)  # Downstream dependants


class ModuleSummary(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    criticality: str
    owner_name: Optional[str] = None
    project_name: Optional[str] = None


# ==========================================
# 6. SEARCH & GRAPH MODELS (F7 & O2)
# ==========================================

class SearchItem(BaseModel):
    type: str  # "person" | "module"
    id: str
    title: str
    subtitle: Optional[str] = None


class SearchResult(BaseModel):
    people: List[SearchItem] = Field(default_factory=list)
    modules: List[SearchItem] = Field(default_factory=list)


class GraphNode(BaseModel):
    id: str
    name: str
    criticality: Optional[str] = "medium"
    owner: Optional[str] = None


class GraphLink(BaseModel):
    source: str
    target: str


class GraphData(BaseModel):
    nodes: List[GraphNode] = Field(default_factory=list)
    links: List[GraphLink] = Field(default_factory=list)
