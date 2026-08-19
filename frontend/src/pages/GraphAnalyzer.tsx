import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Network,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { api, ApiError } from '../api/client';
import { GraphData, GraphNode, Criticality } from '../types';
import DependencyGraph, { DependencyGraphHandle } from '../components/graph/DependencyGraph';
import GraphSidebar, { GraphFiltersState } from '../components/graph/GraphSidebar';
import NodeDetailPanel from '../components/graph/NodeDetailPanel';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';

export default function GraphAnalyzer() {
  const [searchParams] = useSearchParams();
  const initialNodeId = searchParams.get('node');
  const initialSearch = searchParams.get('search') || '';

  const graphHandleRef = useRef<DependencyGraphHandle | null>(null);
  const [rawGraphData, setRawGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Unified Filter State
  const [filters, setFilters] = useState<GraphFiltersState>({
    search: initialSearch,
    types: { person: true, module: true, skill: true, team: true, project: true },
    criticalities: { high: true, medium: true, low: true },
    team: 'all',
    skillCategory: 'all',
    seniority: 'all',
    atRiskOnly: false,
    projectStatus: 'all',
    edges: { owns: true, contributes_to: true, has_skill: true, member_of: true, depends_on: true, part_of: true },
    hideIsolated: false,
    showDirectionality: true,
  });

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setFilters((prev) => ({ ...prev, search: urlSearch }));
    }
  }, [searchParams]);

  const fetchGraph = () => {
    setIsLoading(true);
    setError(null);
    api
      .getGraph()
      .then((data) => {
        setRawGraphData(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  // Handle URL focus parameter (?node=...)
  useEffect(() => {
    if (rawGraphData && initialNodeId) {
      const found = rawGraphData.nodes.find((n) => n.id === initialNodeId);
      if (found) {
        setSelectedNode(found);
        setTimeout(() => {
          if (found.x !== undefined && found.y !== undefined && graphHandleRef.current) {
            graphHandleRef.current.centerAt(found.x, found.y, 400);
            graphHandleRef.current.zoom(2.0, 400);
          }
        }, 400);
      }
    }
  }, [rawGraphData, initialNodeId]);

  // Extract filter options from raw graph data
  const availableTeams = useMemo(() => {
    if (!rawGraphData) return [];
    const set = new Set<string>();
    rawGraphData.nodes.forEach((n) => {
      if (n.type === 'team') set.add(n.name);
      if (n.team) set.add(n.team);
    });
    return Array.from(set);
  }, [rawGraphData]);

  const availableSkillCategories = useMemo(() => {
    if (!rawGraphData) return [];
    const set = new Set<string>();
    rawGraphData.nodes.forEach((n) => {
      if (n.type === 'skill' && n.category) set.add(n.category);
    });
    return Array.from(set);
  }, [rawGraphData]);

  const availableSeniorities = useMemo(() => {
    if (!rawGraphData) return [];
    const set = new Set<string>();
    rawGraphData.nodes.forEach((n) => {
      if (n.type === 'person' && n.seniority) set.add(n.seniority);
    });
    return Array.from(set);
  }, [rawGraphData]);

  const availableProjectStatuses = useMemo(() => {
    if (!rawGraphData) return [];
    const set = new Set<string>();
    rawGraphData.nodes.forEach((n) => {
      if (n.type === 'project' && n.status) set.add(n.status);
    });
    return Array.from(set);
  }, [rawGraphData]);

  // Apply All Multi-Dimensional Filters
  const filteredData = useMemo(() => {
    if (!rawGraphData) return { nodes: [], links: [] };

    // 1. Filter Nodes
    let activeNodes = rawGraphData.nodes.filter((node) => {
      // Type toggle
      if (!filters.types[node.type]) return false;

      // Module Criticality
      if (node.type === 'module') {
        const crit = (node.criticality || 'low').toLowerCase() as Criticality;
        if (crit === 'high' && !filters.criticalities.high) return false;
        if (crit === 'medium' && !filters.criticalities.medium) return false;
        if (crit === 'low' && !filters.criticalities.low) return false;
      }

      // Team filter
      if (filters.team !== 'all') {
        if (node.type === 'team' && node.name !== filters.team) return false;
        if (node.type === 'person' && node.team !== filters.team) return false;
      }

      // Skill Category filter
      if (filters.skillCategory !== 'all' && node.type === 'skill') {
        if (node.category !== filters.skillCategory) return false;
      }

      // Seniority filter
      if (filters.seniority !== 'all' && node.type === 'person') {
        if (node.seniority !== filters.seniority) return false;
      }

      // Project Status filter
      if (filters.projectStatus !== 'all' && node.type === 'project') {
        if (node.status !== filters.projectStatus) return false;
      }

      // At-Risk Only shortcut: only single-owner modules (bus factor = 1) and their owners
      if (filters.atRiskOnly) {
        if (node.type === 'module') {
          const isSpof = node.contributor_count === 0 && node.owner;
          if (!isSpof) return false;
        } else if (node.type === 'person') {
          const ownsSpof = node.owned_modules?.some((m) => {
            const rawMod = rawGraphData.nodes.find((rn) => rn.id === m.id);
            return rawMod && rawMod.contributor_count === 0;
          });
          if (!ownsSpof) return false;
        } else {
          return false;
        }
      }

      return true;
    });

    const activeNodeIdSet = new Set(activeNodes.map((n) => n.id));

    // 2. Filter Links by active nodes and active edge types
    let activeLinks = rawGraphData.links.filter((l) => {
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      const tgt = typeof l.target === 'object' ? l.target.id : l.target;

      if (!activeNodeIdSet.has(src) || !activeNodeIdSet.has(tgt)) return false;
      if (!filters.edges[l.relationship]) return false;

      return true;
    });

    // 3. Hide Isolated Nodes (if toggle enabled)
    if (filters.hideIsolated) {
      const connectedNodeIds = new Set<string>();
      activeLinks.forEach((l) => {
        const src = typeof l.source === 'object' ? l.source.id : l.source;
        const tgt = typeof l.target === 'object' ? l.target.id : l.target;
        connectedNodeIds.add(src);
        connectedNodeIds.add(tgt);
      });

      activeNodes = activeNodes.filter((n) => connectedNodeIds.has(n.id));
    }

    return {
      nodes: activeNodes,
      links: activeLinks,
    };
  }, [rawGraphData, filters]);

  const handleSelectNodeById = (id: string) => {
    if (!rawGraphData) return;
    const found = rawGraphData.nodes.find((n) => n.id === id);
    if (found) {
      setSelectedNode(found);
      if (found.x !== undefined && found.y !== undefined && graphHandleRef.current) {
        graphHandleRef.current.centerAt(found.x, found.y, 400);
        graphHandleRef.current.zoom(2.0, 400);
      }
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#FDF5E7]">
      {/* ========================================== */}
      {/* FLOATING TOP-LEFT TITLE PILL               */}
      {/* ========================================== */}
      <div className="absolute top-5 left-20 z-30 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-[#EFE5D3] shadow-lg text-[#1C1912]">
        <div className="w-7 h-7 rounded-lg bg-[#1C1912] text-white flex items-center justify-center">
          <Network className="w-3.5 h-3.5 text-[#F4A62C]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#1C1912] tracking-tight">
            Topology Explorer
          </span>
          {rawGraphData && (
            <span className="text-[11px] font-mono text-[#A39A8B]">
              ({filteredData.nodes.length} nodes · {filteredData.links.length} links)
            </span>
          )}
        </div>
        <button
          onClick={fetchGraph}
          className="p-1 rounded-md text-[#A39A8B] hover:text-[#1C1912] transition-colors"
          title="Refresh Graph"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ========================================== */}
      {/* FLOATING TOP-RIGHT TOOLBAR & FILTER TOGGLE */}
      {/* ========================================== */}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        {/* Camera Controls */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#EFE5D3] shadow-lg text-[#1C1912]">
          <button
            onClick={() => graphHandleRef.current?.zoom(1.3, 250)}
            className="p-2 rounded-lg hover:bg-[#FDF5E7]"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => graphHandleRef.current?.zoom(0.75, 250)}
            className="p-2 rounded-lg hover:bg-[#FDF5E7]"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => graphHandleRef.current?.zoomToFit(350)}
            className="p-2 rounded-lg hover:bg-[#FDF5E7]"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Drawer Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`px-4 py-2 rounded-xl border shadow-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            isSidebarOpen
              ? 'bg-[#1C1912] text-white border-[#1C1912]'
              : 'bg-white/95 backdrop-blur-md text-[#1C1912] border-[#EFE5D3] hover:bg-[#FDF5E7]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#F4A62C]" />
          <span>Filters & Legend</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* FLOATING FILTER & LEGEND OVERLAY (Right)   */}
      {/* ========================================== */}
      {isSidebarOpen && (
        <div className="absolute top-18 right-5 z-40 animate-in fade-in slide-in-from-top-3 duration-150">
          <GraphSidebar
            filters={filters}
            onFilterChange={setFilters}
            availableTeams={availableTeams}
            availableSkillCategories={availableSkillCategories}
            availableSeniorities={availableSeniorities}
            availableProjectStatuses={availableProjectStatuses}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* ========================================== */}
      {/* FULLSCREEN GRAPH CANVAS                    */}
      {/* ========================================== */}
      <div className="w-full h-full">
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center p-8 bg-[#FDF5E7]">
            <LoadingSkeleton type="panel" count={1} />
          </div>
        )}

        {error && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full p-4 z-20">
            <ErrorBanner message={error.message} onRetry={fetchGraph} />
          </div>
        )}

        {!isLoading && rawGraphData && (
          <DependencyGraph
            ref={graphHandleRef}
            data={filteredData}
            selectedNodeId={selectedNode ? selectedNode.id : null}
            searchQuery={filters.search}
            showDirectionality={filters.showDirectionality}
            onNodeClick={(node) => {
              setSelectedNode(node);
              setIsSidebarOpen(false);
            }}
            onCanvasClick={() => setSelectedNode(null)}
          />
        )}
      </div>

      {/* ========================================== */}
      {/* SLIDE-IN NODE DETAIL PANEL                 */}
      {/* ========================================== */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSelectNodeById={handleSelectNodeById}
        />
      )}
    </div>
  );
}
