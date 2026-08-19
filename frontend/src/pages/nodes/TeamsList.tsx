import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, Network, AlertTriangle } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { GraphNode } from '../../types';
import PageContainer from '../../components/layout/PageContainer';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function TeamsList() {
  const [teams, setTeams] = useState<GraphNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    api
      .getGraph()
      .then((data) => {
        const list = data.nodes.filter((n) => n.type === 'team');
        setTeams(list);
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = teams.filter((t) => {
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q);
  });

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE5D3] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#B8A78D] text-white flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1912] tracking-tight">
                Engineering Squads & Teams
              </h1>
              <p className="text-sm text-[#A39A8B] mt-0.5">
                {teams.length} organizational units managing core system domains.
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
            placeholder="Search teams..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#EFE5D3] text-xs text-[#1C1912] placeholder:text-[#A39A8B] focus:outline-none focus:border-[#1C1912] shadow-sm"
          />
        </div>
      </div>

      {error && <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />}
      {isLoading && <LoadingSkeleton type="table" count={4} />}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((team) => (
            <div
              key={team.id}
              className="warm-card p-6 warm-card-hover flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#1C1912] bg-[#EFE5D3] px-2.5 py-0.5 rounded-md">
                    {team.member_count || 0} members
                  </span>

                  {(team.spof_count || 0) > 0 ? (
                    <span className="px-2 py-0.5 rounded-md bg-[#E15B43]/12 text-[#E15B43] border border-[#E15B43]/30 text-[10px] font-bold uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{team.spof_count} SPoFs</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-[#7FA65A]/15 text-[#416124] text-[10px] font-bold uppercase">
                      Healthy
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[#1C1912] mt-3">{team.name}</h3>
              </div>

              {/* Roster & Modules */}
              <div className="space-y-2 pt-2 border-t border-[#EFE5D3] text-xs">
                {team.members && team.members.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-[#A39A8B] uppercase mb-1">Roster:</div>
                    <div className="flex flex-wrap gap-1">
                      {team.members.map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-0.5 rounded bg-white border border-[#EFE5D3] text-[11px] text-[#1C1912]"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {team.team_owned_modules && team.team_owned_modules.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[10px] font-bold text-[#A39A8B] uppercase mb-1">
                      Owned Modules ({team.team_owned_modules.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {team.team_owned_modules.map((mod) => (
                        <span
                          key={mod.id}
                          className="px-2 py-0.5 rounded bg-[#FDF5E7] border border-[#EFE5D3] text-[10px] font-mono text-[#1C1912]"
                        >
                          {mod.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => navigate(`/graph?node=${team.id}`)}
                  className="w-full py-2 rounded-lg bg-[#1C1912] hover:bg-[#332E22] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Network className="w-3.5 h-3.5 text-[#F4A62C]" />
                  <span>Inspect Team Topology</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
