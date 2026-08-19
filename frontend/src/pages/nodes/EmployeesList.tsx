import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Search, Network, ArrowRight } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { GraphNode } from '../../types';
import PageContainer from '../../components/layout/PageContainer';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function EmployeesList() {
  const [employees, setEmployees] = useState<GraphNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    api
      .getGraph()
      .then((data) => {
        const staff = data.nodes.filter((n) => n.type === 'person');
        setEmployees(staff);
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      (e.role && e.role.toLowerCase().includes(q)) ||
      (e.team && e.team.toLowerCase().includes(q)) ||
      (e.seniority && e.seniority.toLowerCase().includes(q))
    );
  });

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE5D3] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#1C1912] text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1912] tracking-tight">
                Engineering Staff Directory
              </h1>
              <p className="text-sm text-[#A39A8B] mt-0.5">
                {employees.length} mapped engineers across all squads and specialties.
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
            placeholder="Search by name, role, team..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#EFE5D3] text-xs text-[#1C1912] placeholder:text-[#A39A8B] focus:outline-none focus:border-[#1C1912] shadow-sm"
          />
        </div>
      </div>

      {error && <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />}
      {isLoading && <LoadingSkeleton type="table" count={5} />}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="warm-card p-5 warm-card-hover flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#FDF5E7] border border-[#DFCDB7] flex items-center justify-center font-bold text-[#1C1912] text-base">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <Link
                      to={`/people/${emp.id}`}
                      className="text-base font-bold text-[#1C1912] hover:text-[#F4A62C] transition-colors"
                    >
                      {emp.name}
                    </Link>
                    <div className="text-xs text-[#A39A8B]">{emp.role}</div>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-md bg-[#EFE5D3] text-[#1C1912] text-[10px] font-semibold">
                  {emp.seniority}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EFE5D3] text-xs text-[#A39A8B]">
                {emp.team && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FDF5E7] border border-[#EFE5D3] font-medium text-[#1C1912]">
                    Team: {emp.team}
                  </span>
                )}
                {emp.owned_modules && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FDF5E7] border border-[#EFE5D3]">
                    {emp.owned_modules.length} modules owned
                  </span>
                )}
                {emp.skills && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FDF5E7] border border-[#EFE5D3]">
                    {emp.skills.length} skills
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  to={`/people/${emp.id}`}
                  className="text-xs font-semibold text-[#1C1912] hover:text-[#F4A62C] transition-colors flex items-center gap-1"
                >
                  <span>View Full Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => navigate(`/graph?node=${emp.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-[#1C1912] hover:bg-[#332E22] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Inspect in Graph</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
