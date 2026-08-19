import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, Network } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { GraphNode } from '../../types';
import PageContainer from '../../components/layout/PageContainer';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function ProjectsList() {
  const [projects, setProjects] = useState<GraphNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    api
      .getGraph()
      .then((data) => {
        const list = data.nodes.filter((n) => n.type === 'project');
        setProjects(list);
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.status && p.status.toLowerCase().includes(q));
  });

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE5D3] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#D9724A] text-white flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1912] tracking-tight">
                Active Strategic Initiatives
              </h1>
              <p className="text-sm text-[#A39A8B] mt-0.5">
                {projects.length} cross-functional initiatives and project scopes.
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
            placeholder="Search initiatives..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#EFE5D3] text-xs text-[#1C1912] placeholder:text-[#A39A8B] focus:outline-none focus:border-[#1C1912] shadow-sm"
          />
        </div>
      </div>

      {error && <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />}
      {isLoading && <LoadingSkeleton type="table" count={4} />}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="warm-card p-6 warm-card-hover flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#D9724A]/15 text-[#D9724A] border border-[#D9724A]/30 text-[10px] font-bold uppercase">
                    {proj.status || 'Active'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1C1912]">
                    {proj.project_modules?.length || 0} modules
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1C1912] mt-3">{proj.name}</h3>
              </div>

              {proj.project_modules && proj.project_modules.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-[#EFE5D3]">
                  <div className="text-[10px] font-bold text-[#A39A8B] uppercase">Scope Modules:</div>
                  <div className="flex flex-wrap gap-1">
                    {proj.project_modules.map((m) => (
                      <span
                        key={m.id}
                        className="px-2 py-0.5 rounded bg-[#FDF5E7] border border-[#EFE5D3] text-[10px] font-mono text-[#1C1912]"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => navigate(`/graph?node=${proj.id}`)}
                  className="w-full py-2 rounded-lg bg-[#1C1912] hover:bg-[#332E22] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Network className="w-3.5 h-3.5 text-[#F4A62C]" />
                  <span>Inspect Initiative Graph</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
