// ==========================================
// 1. DASHBOARD & RISK METRIC TYPES
// ==========================================

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM';
export type Criticality = 'high' | 'medium' | 'low';

export interface AtRiskModule {
  module_id: string;
  module_name: string;
  criticality: Criticality;
  owner_id: string;
  owner_name: string;
  owner_role?: string;
  contributor_count: number;
  downstream_count: number;
  risk_level: RiskLevel;
}

export interface DashboardStats {
  total_people: number;
  total_modules: number;
  total_projects: number;
  total_skills: number;
  at_risk_modules: AtRiskModule[];
}

// ==========================================
// 2. IMPACT & BLAST RADIUS TYPES (F2)
// ==========================================

export interface DownstreamModule {
  id: string;
  name: string;
  criticality?: Criticality;
  depth: number;
}

export interface OwnedModuleImpact {
  module_id: string;
  module_name: string;
  criticality: Criticality;
  description?: string;
  at_risk_downstream: DownstreamModule[];
}

export interface ImpactResponse {
  person_id: string;
  person_name?: string;
  owned_modules: OwnedModuleImpact[];
  total_downstream_count: number;
  highest_criticality?: Criticality;
}

// ==========================================
// 3. BACKFILL CANDIDATE TYPES (F3 / O1)
// ==========================================

export interface BackupCandidate {
  candidate_id: string;
  candidate_name: string;
  candidate_role: string;
  candidate_seniority: string;
  candidate_email: string;
  shared_skills: string[];
  skill_overlap_count: number;
  total_relevant_commits: number;
  match_score: number;
}

export interface CandidateResponse {
  person_id: string;
  candidates: BackupCandidate[];
}

// ==========================================
// 4. PERSON DETAIL & PROFILE TYPES (F5)
// ==========================================

export interface SkillDetail {
  name: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'expert';
}

export interface OwnedModuleRef {
  id: string;
  name: string;
  criticality: Criticality;
}

export interface ContributedModuleRef {
  id: string;
  name: string;
  commits: number;
  last_active?: string;
}

export interface PersonDetail {
  id: string;
  name: string;
  role: string;
  seniority: string;
  email: string;
  team?: string;
  skills: SkillDetail[];
  owned_modules: OwnedModuleRef[];
  contributed_modules: ContributedModuleRef[];
}

export interface PersonSummary {
  id: string;
  name: string;
  role: string;
  seniority: string;
  email: string;
  team?: string;
}

// ==========================================
// 5. MODULE DETAIL TYPES (F6)
// ==========================================

export interface OwnerRef {
  id: string;
  name: string;
  role?: string;
  email?: string;
}

export interface ContributorRef {
  id: string;
  name: string;
  commits: number;
  last_active?: string;
}

export interface ModuleRef {
  id: string;
  name: string;
  criticality?: Criticality;
}

export interface ModuleDetail {
  id: string;
  name: string;
  description?: string;
  criticality: Criticality;
  repo_url?: string;
  project?: string;
  owner?: OwnerRef;
  contributors: ContributorRef[];
  depends_on: ModuleRef[];       // Upstream dependencies
  depended_on_by: ModuleRef[];   // Downstream dependents
}

export interface ModuleSummary {
  id: string;
  name: string;
  description?: string;
  criticality: Criticality;
  owner_name?: string;
  project_name?: string;
}

// ==========================================
// 6. SEARCH & GRAPH TYPES (F7 & O2)
// ==========================================

export interface SearchItem {
  type: 'person' | 'module';
  id: string;
  title: string;
  subtitle?: string;
}

export interface SearchResult {
  people: SearchItem[];
  modules: SearchItem[];
}

export interface GraphNode {
  id: string;
  name: string;
  criticality?: Criticality;
  owner?: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
