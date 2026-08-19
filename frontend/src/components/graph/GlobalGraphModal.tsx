import { useState, useEffect } from 'react';
import { X, Network, RefreshCw } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { GraphData } from '../../types';
import DependencyGraph from './DependencyGraph';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ErrorBanner from '../common/ErrorBanner';

interface GlobalGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalGraphModal({ isOpen, onClose }: GlobalGraphModalProps) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-6xl h-[85vh] rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden bg-[#0D121F]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/30">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Org-Wide Architecture Dependency Topology
                {graphData && (
                  <span className="text-xs font-mono font-medium text-slate-400">
                    ({graphData.nodes.length} nodes · {graphData.links.length} links)
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Click any service node to navigate to its detailed dependency and contributor breakdown.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchGraph}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Refresh Graph"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 relative p-4 flex flex-col justify-center items-center overflow-hidden">
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center">
              <LoadingSkeleton type="panel" count={1} />
            </div>
          )}

          {error && (
            <div className="max-w-md w-full">
              <ErrorBanner
                title="Could Not Load Graph Data"
                message={error.message}
                hint={error.data?.hint}
                onRetry={fetchGraph}
              />
            </div>
          )}

          {!isLoading && graphData && (
            <div className="w-full h-full">
              <DependencyGraph
                data={graphData}
                height={window.innerHeight * 0.7}
                onNodeClick={() => onClose()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
