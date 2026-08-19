import { useState } from 'react';
import { Search, X, Filter, AlertTriangle, Layers } from 'lucide-react';
import { GraphNodeType, GraphRelationshipType, Criticality } from '../../types';

export interface GraphFiltersState {
  search: string;
  types: Record<GraphNodeType, boolean>;
  criticalities: Record<Criticality, boolean>;
  team: string;
  skillCategory: string;
  seniority: string;
  atRiskOnly: boolean;
  projectStatus: string;
  edges: Record<GraphRelationshipType, boolean>;
  hideIsolated: boolean;
  showDirectionality: boolean;
}

interface GraphSidebarProps {
  filters: GraphFiltersState;
  onFilterChange: (filters: GraphFiltersState) => void;
  availableTeams: string[];
  availableSkillCategories: string[];
  availableSeniorities: string[];
  availableProjectStatuses: string[];
  onClose?: () => void;
}

export default function GraphSidebar({
  filters,
  onFilterChange,
  availableTeams,
  availableSkillCategories,
  availableSeniorities,
  availableProjectStatuses,
  onClose,
}: GraphSidebarProps) {
  const [activeTab, setActiveTab] = useState<'filters' | 'legend'>('filters');

  const updateFilter = <K extends keyof GraphFiltersState>(key: K, value: GraphFiltersState[K]) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleType = (t: GraphNodeType) => {
    updateFilter('types', {
      ...filters.types,
      [t]: !filters.types[t],
    });
  };

  const toggleCriticality = (c: Criticality) => {
    updateFilter('criticalities', {
      ...filters.criticalities,
      [c]: !filters.criticalities[c],
    });
  };

  const toggleEdge = (e: GraphRelationshipType) => {
    updateFilter('edges', {
      ...filters.edges,
      [e]: !filters.edges[e],
    });
  };

  return (
    <div className="w-80 max-h-[calc(100vh-6rem)] flex flex-col bg-white/95 backdrop-blur-md border border-[#EFE5D3] rounded-xl shadow-2xl overflow-hidden text-[#1C1912]">
      {/* Header with Tabs & Close */}
      <div className="p-3 border-b border-[#EFE5D3] bg-[#FDF9F2] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#EFE5D3]">
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'filters'
                ? 'bg-[#1C1912] text-white shadow-sm'
                : 'text-[#A39A8B] hover:text-[#1C1912]'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setActiveTab('legend')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'legend'
                ? 'bg-[#1C1912] text-white shadow-sm'
                : 'text-[#A39A8B] hover:text-[#1C1912]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Legend</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#FDF5E7] text-[#A39A8B] hover:text-[#1C1912]"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-[#1C1912]">
        {activeTab === 'filters' && (
          <>
            {/* Real-time Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#A39A8B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Filter node in graph..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] text-xs text-[#1C1912] placeholder:text-[#A39A8B] focus:outline-none focus:border-[#1C1912]"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A39A8B] hover:text-[#1C1912]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* At-Risk Only Shortcut */}
            <div className="pt-0.5">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#E15B43]/10 border border-[#E15B43]/30 cursor-pointer hover:bg-[#E15B43]/15 transition-colors">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#E15B43]" />
                  <span className="font-bold text-[#E15B43] text-xs">At-Risk Only (Bus Factor = 1)</span>
                </div>
                <input
                  type="checkbox"
                  checked={filters.atRiskOnly}
                  onChange={(e) => updateFilter('atRiskOnly', e.target.checked)}
                  className="rounded text-[#E15B43] focus:ring-[#E15B43]"
                />
              </label>
            </div>

            {/* Entity Type Toggles */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">Entity Types</div>
              <div className="flex flex-wrap gap-1.5">
                {(['person', 'module', 'skill', 'team', 'project'] as GraphNodeType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                      filters.types[t]
                        ? 'bg-[#1C1912] text-white shadow-sm'
                        : 'bg-[#FDF5E7] text-[#A39A8B] border border-[#EFE5D3] hover:text-[#1C1912]'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            {/* Module Criticality */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">Module Risk Tier</div>
              <div className="flex items-center gap-1.5">
                {(['high', 'medium', 'low'] as Criticality[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCriticality(c)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      filters.criticalities[c]
                        ? c === 'high'
                          ? 'bg-[#E15B43] text-white border-[#E15B43]'
                          : c === 'medium'
                          ? 'bg-[#F4A62C] text-[#1C1912] border-[#F4A62C]'
                          : 'bg-[#7FA65A] text-white border-[#7FA65A]'
                        : 'bg-white text-[#A39A8B] border-[#EFE5D3]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Filter */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">Isolate Squad</div>
              <select
                value={filters.team}
                onChange={(e) => updateFilter('team', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] text-xs text-[#1C1912] focus:outline-none focus:border-[#1C1912]"
              >
                <option value="all">All Squads</option>
                {availableTeams.map((tm) => (
                  <option key={tm} value={tm}>
                    {tm}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Category Filter */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">Skill Category</div>
              <select
                value={filters.skillCategory}
                onChange={(e) => updateFilter('skillCategory', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] text-xs text-[#1C1912] focus:outline-none focus:border-[#1C1912]"
              >
                <option value="all">All Categories</option>
                {availableSkillCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Seniority Filter */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">Person Seniority</div>
              <select
                value={filters.seniority}
                onChange={(e) => updateFilter('seniority', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] text-xs text-[#1C1912] focus:outline-none focus:border-[#1C1912]"
              >
                <option value="all">All Seniorities</option>
                {availableSeniorities.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Status */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">Project Status</div>
              <select
                value={filters.projectStatus}
                onChange={(e) => updateFilter('projectStatus', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] text-xs text-[#1C1912] focus:outline-none focus:border-[#1C1912]"
              >
                <option value="all">All Statuses</option>
                {availableProjectStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Edge Visibility Toggles */}
            <div className="space-y-1.5 pt-2 border-t border-[#EFE5D3]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">Relationship Edges</div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {(
                  [
                    ['owns', 'OWNS'],
                    ['depends_on', 'DEPENDS_ON'],
                    ['contributes_to', 'CONTRIB_TO'],
                    ['has_skill', 'HAS_SKILL'],
                    ['member_of', 'MEMBER_OF'],
                    ['part_of', 'PART_OF'],
                  ] as [GraphRelationshipType, string][]
                ).map(([rel, label]) => (
                  <label key={rel} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.edges[rel]}
                      onChange={() => toggleEdge(rel)}
                      className="rounded text-[#1C1912] focus:ring-[#1C1912]"
                    />
                    <span className="font-mono text-[10px]">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hide Isolated Nodes & Show Directionality */}
            <div className="pt-2 border-t border-[#EFE5D3] space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-[11px] text-[#1C1912]">Show Directionality (Arrows)</span>
                <input
                  type="checkbox"
                  checked={filters.showDirectionality}
                  onChange={(e) => updateFilter('showDirectionality', e.target.checked)}
                  className="rounded text-[#1C1912] focus:ring-[#1C1912]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-[11px] text-[#1C1912]">Hide Isolated Nodes</span>
                <input
                  type="checkbox"
                  checked={filters.hideIsolated}
                  onChange={(e) => updateFilter('hideIsolated', e.target.checked)}
                  className="rounded text-[#1C1912] focus:ring-[#1C1912]"
                />
              </label>
            </div>
          </>
        )}

        {activeTab === 'legend' && (
          <div className="space-y-4">
            {/* Section A: Entity Types */}
            {/* Section A: Entity Types (Shape + Border) */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">
                Entity Types (Shape & Border)
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Person (Pill)</span>
                  <span className="px-2.5 py-0.5 rounded-full border-2 border-[#1C1912] bg-[#FDF5E7] text-[10px] font-bold">
                    Ink Capsule
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Skill (Diamond-Cut)</span>
                  <span className="px-2 py-0.5 rounded-md border-2 border-[#F4A62C] bg-[#FDF5E7] text-[10px] font-bold text-[#995900]">
                    Amber Octagon
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Team (Hexagon)</span>
                  <span className="px-2 py-0.5 rounded-md border-2 border-[#B8A78D] bg-[#FDF5E7] text-[10px] font-bold text-[#7A6B54]">
                    Taupe Hex
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Project (Tag)</span>
                  <span className="px-2 py-0.5 rounded-md border-2 border-[#D9724A] bg-[#FDF5E7] text-[10px] font-bold text-[#D9724A]">
                    Terracotta Chevron
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Module Risk Levels */}
            <div className="space-y-2 pt-2 border-t border-[#EFE5D3]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">
                Module Risk Levels
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">High Criticality</span>
                  <span className="px-2 py-0.5 rounded-md border-2 border-[#E15B43] bg-[#FDF5E7] text-[10px] font-bold text-[#E15B43]">
                    Red Border
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Medium Criticality</span>
                  <span className="px-2 py-0.5 rounded-md border-2 border-[#F4A62C] bg-[#FDF5E7] text-[10px] font-bold text-[#995900]">
                    Amber Border
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Low / Healthy</span>
                  <span className="px-2 py-0.5 rounded-md border-2 border-[#7FA65A] bg-[#FDF5E7] text-[10px] font-bold text-[#416124]">
                    Green Border
                  </span>
                </div>
              </div>
            </div>

            {/* Section C: Relationship Edges */}
            <div className="space-y-2 pt-2 border-t border-[#EFE5D3]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">
                Relationship Edges
              </div>
              <div className="space-y-1.5 text-[11px] text-[#1C1912]">
                <div className="flex items-center justify-between">
                  <span>OWNS / DEPENDS_ON</span>
                  <span className="font-mono text-[#A39A8B]">Solid + Arrow</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>CONTRIBUTES_TO</span>
                  <span className="font-mono text-[#7FA65A]">Weighted Solid</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>HAS_SKILL / MEMBER_OF</span>
                  <span className="font-mono text-[#A39A8B]">Dashed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>PART_OF</span>
                  <span className="font-mono text-[#A39A8B]">Dotted</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
