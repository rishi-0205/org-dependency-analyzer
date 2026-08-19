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

export type GraphNodeType = 'person' | 'module' | 'skill' | 'team' | 'project';
export type GraphRelationshipType =
  | 'owns'
  | 'contributes_to'
  | 'has_skill'
  | 'member_of'
  | 'depends_on'
  | 'part_of';

export interface GraphNode {
  id: string;
  name: string;
  type: GraphNodeType;

  // Person properties
  role?: string;
  seniority?: string;
  email?: string;
  team?: string;
  skills?: { name: string; level?: string; category?: string }[];
  owned_modules?: { id: string; name: string; criticality?: Criticality }[];

  // Module properties
  criticality?: Criticality;
  description?: string;
  repo_url?: string;
  project?: string;
  owner?: string;
  owner_id?: string;
  downstream_count?: number;
  contributor_count?: number;
  contributors?: { id: string; name: string; commits: number; last_active?: string }[];
  depends_on?: { id: string; name: string; criticality?: Criticality }[];
  depended_on_by?: { id: string; name: string; criticality?: Criticality }[];

  // Skill properties
  category?: string;
  people_with_skill?: { id: string; name: string; role?: string; level?: string }[];

  // Team properties
  member_count?: number;
  members?: { id: string; name: string; role?: string }[];
  team_owned_modules?: { id: string; name: string; criticality?: Criticality; is_spof?: boolean }[];
  spof_count?: number;

  // Project properties
  status?: string;
  project_modules?: { id: string; name: string; criticality?: Criticality }[];

  // Force graph coordinates populated by simulation
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  index?: number;
}

export interface GraphLink {
  source: string | any;
  target: string | any;
  relationship: GraphRelationshipType;
  commits?: number;
  last_active?: string;
  level?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

