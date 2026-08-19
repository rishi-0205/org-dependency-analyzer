import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Search, Network, ArrowRight, AlertTriangle } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { GraphNode } from '../../types';
import PageContainer from '../../components/layout/PageContainer';
import CriticalityBadge from '../../components/common/CriticalityBadge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function ModulesList() {
  const [modules, setModules] = useState<GraphNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [search, setSearch] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    api
      .getGraph()
      .then((data) => {
        const list = data.nodes.filter((n) => n.type === 'module');
        setModules(list);
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = modules.filter((m) => {
    const q = search.toLowerCase();
    const matchQuery =
      m.name.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.owner && m.owner.toLowerCase().includes(q));
    const matchCrit =
      criticalityFilter === 'all' || (m.criticality || '').toLowerCase() === criticalityFilter;
    return matchQuery && matchCrit;
  });

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE5D3] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#E15B43] text-white flex items-center justify-center">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1912] tracking-tight">
                System Modules & Services
              </h1>
              <p className="text-sm text-[#A39A8B] mt-0.5">
                {modules.length} microservices and core packages forming the system architecture.
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#A39A8B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules, owners..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#EFE5D3] text-xs text-[#1C1912] placeholder:text-[#A39A8B] focus:outline-none focus:border-[#1C1912] shadow-sm"
          />
        </div>
      </div>

      {/* Criticality Filter Chips */}
      <div className="flex items-center gap-2">
        {['all', 'high', 'medium', 'low'].map((crit) => (
          <button
            key={crit}
            onClick={() => setCriticalityFilter(crit)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
              criticalityFilter === crit
                ? 'bg-[#1C1912] text-white shadow-sm'
                : 'bg-white border border-[#EFE5D3] text-[#A39A8B] hover:text-[#1C1912]'
            }`}
          >
            {crit === 'all' ? 'All Criticalities' : `${crit} Risk`}
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />}
      {isLoading && <LoadingSkeleton type="table" count={5} />}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((mod) => {
            const isSpof = mod.contributor_count === 0 && mod.owner;
            return (
              <div
                key={mod.id}
                className="warm-card p-5 warm-card-hover flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <CriticalityBadge level={mod.criticality || 'medium'} size="sm" />
                    {isSpof && (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#E15B43]/12 text-[#E15B43] border border-[#E15B43]/30 text-[10px] font-bold uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Bus Factor = 1</span>
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/modules/${mod.id}`}
                    className="text-lg font-mono font-bold text-[#1C1912] hover:text-[#F4A62C] transition-colors mt-2 block"
                  >
                    {mod.name}
                  </Link>

                  {mod.description && (
                    <p className="text-xs text-[#A39A8B] mt-1 leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EFE5D3] text-center">
                  <div className="p-2 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3]">
                    <div className="text-[10px] text-[#A39A8B]">Owner</div>
                    <div className="text-xs font-semibold text-[#1C1912] truncate mt-0.5">
                      {mod.owner || 'Unassigned'}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3]">
                    <div className="text-[10px] text-[#A39A8B]">Contributors</div>
                    <div className="text-xs font-mono font-bold text-[#1C1912] mt-0.5">
                      {mod.contributor_count || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3]">
                    <div className="text-[10px] text-[#A39A8B]">Blast Radius</div>
                    <div className="text-xs font-mono font-bold text-[#E15B43] mt-0.5">
                      {mod.downstream_count || 0}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    to={`/modules/${mod.id}`}
                    className="text-xs font-semibold text-[#1C1912] hover:text-[#F4A62C] transition-colors flex items-center gap-1"
                  >
                    <span>Module Architecture</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => navigate(`/graph?node=${mod.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-[#1C1912] hover:bg-[#332E22] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Inspect in Graph</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
