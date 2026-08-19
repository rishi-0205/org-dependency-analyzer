import { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Network,
  RefreshCw,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { GraphData, GraphNode, GraphNodeType } from '../../types';
import DependencyGraph, { DependencyGraphHandle } from './DependencyGraph';
import NodeDetailPanel from './NodeDetailPanel';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ErrorBanner from '../common/ErrorBanner';

interface GlobalGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedNodeId?: string | null;
  initialFilterType?: GraphNodeType | null;
}

export default function GlobalGraphModal({
  isOpen,
  onClose,
  initialSelectedNodeId = null,
  initialFilterType = null,
}: GlobalGraphModalProps) {
  const graphHandleRef = useRef<DependencyGraphHandle | null>(null);

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Selected node for slide-in inspection panel
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Layer 1: Type Visibility Filters
  const [visibleTypes, setVisibleTypes] = useState<Record<GraphNodeType, boolean>>({
    person: true,
    module: true,
    skill: true,
    team: true,
    project: true,
  });

  // Layer 2: Live Search Query
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGraph = () => {
    setIsLoading(true);
    setError(null);
    api
      .getGraph()
      .then((data) => {
        setGraphData(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchGraph();
    }
  }, [isOpen]);

  // Handle initial selected node / initial filter when opening modal
  useEffect(() => {
    if (isOpen && graphData && initialSelectedNodeId) {
      const found = graphData.nodes.find((n) => n.id === initialSelectedNodeId);
      if (found) {
        setSelectedNode(found);
        setTimeout(() => {
          if (found.x !== undefined && found.y !== undefined && graphHandleRef.current) {
            graphHandleRef.current.centerAt(found.x, found.y, 400);
            graphHandleRef.current.zoom(2.5, 400);
          }
        }, 350);
      }
    }
    if (isOpen && initialFilterType) {
      // Focus on a specific type
      setVisibleTypes({
        person: initialFilterType === 'person',
        module: initialFilterType === 'module',
        skill: initialFilterType === 'skill',
        team: initialFilterType === 'team',
        project: initialFilterType === 'project',
      });
    }
  }, [isOpen, graphData, initialSelectedNodeId, initialFilterType]);

  // Client-side Filtered Dataset based on Layer 1 Type Visibility
  const filteredData = useMemo(() => {
    if (!graphData) return { nodes: [], links: [] };

    const activeNodes = graphData.nodes.filter((n) => visibleTypes[n.type]);
    const activeNodeIdSet = new Set(activeNodes.map((n) => n.id));

    const activeLinks = graphData.links.filter((l) => {
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      const tgt = typeof l.target === 'object' ? l.target.id : l.target;
      return activeNodeIdSet.has(src) && activeNodeIdSet.has(tgt);
    });

    return {
      nodes: activeNodes,
      links: activeLinks,
    };
  }, [graphData, visibleTypes]);

  // Handle Search Auto-Center
  useEffect(() => {
    const clean = searchQuery.trim().toLowerCase();
    if (!clean || !filteredData.nodes.length) return;

    const firstMatch = filteredData.nodes.find(
      (n) => n.name.toLowerCase().includes(clean) || (n.role && n.role.toLowerCase().includes(clean))
    );

    if (firstMatch && firstMatch.x !== undefined && firstMatch.y !== undefined && graphHandleRef.current) {
      graphHandleRef.current.centerAt(firstMatch.x, firstMatch.y, 350);
      graphHandleRef.current.zoom(2.2, 350);
    }
  }, [searchQuery, filteredData]);

  const toggleTypeVisibility = (type: GraphNodeType) => {
    setVisibleTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSelectNodeById = (id: string) => {
    if (!graphData) return;
    const found = graphData.nodes.find((n) => n.id === id);
    if (found) {
      setSelectedNode(found);
      if (found.x !== undefined && found.y !== undefined && graphHandleRef.current) {
        graphHandleRef.current.centerAt(found.x, found.y, 400);
        graphHandleRef.current.zoom(2.5, 400);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-7xl h-[90vh] rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden bg-[#0D121F] relative">
        {/* ========================================== */}
        {/* TOP TOOLBAR & CONTROLS                     */}
        {/* ========================================== */}
        <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/30 flex-shrink-0">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Org-Wide Architecture & Dependency Topology
                {graphData && (
                  <span className="text-xs font-mono font-medium text-slate-400">
                    ({filteredData.nodes.length} nodes · {filteredData.links.length} links)
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Click any node for instant in-situ departure simulation and component inspection.
              </p>
            </div>
          </div>

          {/* Layer 1: Type Visibility Toggle Chips & Search Input */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find node in graph..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Type Toggles */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => toggleTypeVisibility('person')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  visibleTypes.person
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                People
              </button>
              <button
                onClick={() => toggleTypeVisibility('module')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  visibleTypes.module
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Modules
              </button>
              <button
                onClick={() => toggleTypeVisibility('skill')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  visibleTypes.skill
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Skills
              </button>
              <button
                onClick={() => toggleTypeVisibility('team')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  visibleTypes.team
                    ? 'bg-slate-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Teams
              </button>
              <button
                onClick={() => toggleTypeVisibility('project')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  visibleTypes.project
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Projects
              </button>
            </div>

            {/* Actions: Refresh & Close */}
            <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
              <button
                onClick={fetchGraph}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Refresh Graph"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* GRAPH CANVAS & EMBEDDED SIDE PANEL         */}
        {/* ========================================== */}
        <div className="flex-1 relative flex overflow-hidden">
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center p-8">
              <LoadingSkeleton type="panel" count={1} />
            </div>
          )}

          {error && (
            <div className="m-auto max-w-md w-full p-4">
              <ErrorBanner
                title="Could Not Load Graph Data"
                message={error.message}
                hint={error.data?.hint}
                onRetry={fetchGraph}
              />
            </div>
          )}

          {!isLoading && graphData && (
            <div className="w-full h-full relative">
              <DependencyGraph
                ref={graphHandleRef}
                data={filteredData}
                height={window.innerHeight * 0.78}
                selectedNodeId={selectedNode ? selectedNode.id : null}
                searchQuery={searchQuery}
                onNodeClick={(node) => setSelectedNode(node)}
                onCanvasClick={() => setSelectedNode(null)}
              />

              {/* Camera Controls Overlay (Top-Right) */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 z-20 text-slate-300">
                <button
                  onClick={() => graphHandleRef.current?.zoom(1.4, 250)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => graphHandleRef.current?.zoom(0.7, 250)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => graphHandleRef.current?.zoomToFit(300)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Node Detail Slide-In Panel */}
              {selectedNode && (
                <NodeDetailPanel
                  node={selectedNode}
                  onClose={() => setSelectedNode(null)}
                  onSelectNodeById={handleSelectNodeById}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
