import { useState, useEffect } from 'react';
import { X, Search, User, Box, Briefcase, Sparkles, Network, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { GraphNodeType } from '../../types';
import CriticalityBadge from '../common/CriticalityBadge';
import LoadingSkeleton from '../common/LoadingSkeleton';

interface EntityDrilldownModalProps {
  isOpen: boolean;
  type: GraphNodeType | null;
  onClose: () => void;
  onOpenGraphWithEntity: (id: string, type: GraphNodeType) => void;
}

export default function EntityDrilldownModal({
  isOpen,
  type,
  onClose,
  onOpenGraphWithEntity,
}: EntityDrilldownModalProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !type) return;
    setIsLoading(true);
    setSearchFilter('');

    // Fetch from graph or specific endpoints
    api
      .getGraph()
      .then((data) => {
        const filtered = data.nodes.filter((n) => n.type === type);
        setItems(filtered);
      })
      .catch((err) => {
        console.error('Error fetching entities for drill-down:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, type]);

  if (!isOpen || !type) return null;

  const filteredItems = items.filter((item) => {
    const q = searchFilter.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.role && item.role.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.team && item.team.toLowerCase().includes(q))
    );
  });

  const getTitle = () => {
    switch (type) {
      case 'person':
        return 'Engineering Staff Directory';
      case 'module':
        return 'System Architecture Modules';
      case 'project':
        return 'Active Strategic Initiatives';
      case 'skill':
        return 'Organization Skill Matrix';
      case 'team':
        return 'Engineering Teams';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'person':
        return <User className="w-5 h-5 text-indigo-400" />;
      case 'module':
        return <Box className="w-5 h-5 text-rose-400" />;
      case 'project':
        return <Briefcase className="w-5 h-5 text-orange-400" />;
      case 'skill':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'team':
        return <User className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-2xl max-h-[80vh] rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden bg-[#0D121F]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {getTitle()}
                <span className="text-xs font-mono font-normal text-slate-400">
                  ({items.length} total)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Click any item to inspect its neighborhood directly on the interactive dependency topology.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter items..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading && <LoadingSkeleton type="table" count={4} />}

          {!isLoading && filteredItems.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching entities found.
            </div>
          )}

          {!isLoading &&
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onClose();
                  onOpenGraphWithEntity(item.id, type);
                }}
                className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/50 flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-sm text-slate-200 group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.criticality && <CriticalityBadge level={item.criticality} size="sm" />}
                    {item.status && (
                      <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 text-[10px] font-bold uppercase border border-orange-500/20">
                        {item.status}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    {item.role && <span>{item.role}</span>}
                    {item.team && <span>· {item.team}</span>}
                    {item.category && <span>Category: {item.category}</span>}
                    {item.owner && <span>Owner: {item.owner}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Network className="w-3.5 h-3.5" />
                  <span>Explore in Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
