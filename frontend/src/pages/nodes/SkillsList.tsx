import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Network } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { GraphNode } from '../../types';
import PageContainer from '../../components/layout/PageContainer';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function SkillsList() {
  const [skills, setSkills] = useState<GraphNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    api
      .getGraph()
      .then((data) => {
        const list = data.nodes.filter((n) => n.type === 'skill');
        setSkills(list);
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean)))];

  const filtered = skills.filter((s) => {
    const q = search.toLowerCase();
    const matchQuery = s.name.toLowerCase().includes(q) || (s.category && s.category.toLowerCase().includes(q));
    const matchCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchQuery && matchCategory;
  });

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE5D3] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#F4A62C] text-[#1C1912] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1912] tracking-tight">
                Organization Skill Matrix
              </h1>
              <p className="text-sm text-[#A39A8B] mt-0.5">
                {skills.length} technical capabilities cataloged across engineering.
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
            placeholder="Search skills..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#EFE5D3] text-xs text-[#1C1912] placeholder:text-[#A39A8B] focus:outline-none focus:border-[#1C1912] shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat as string)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? 'bg-[#1C1912] text-white shadow-sm'
                : 'bg-white border border-[#EFE5D3] text-[#A39A8B] hover:text-[#1C1912]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />}
      {isLoading && <LoadingSkeleton type="table" count={5} />}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill) => (
            <div
              key={skill.id}
              className="warm-card p-5 warm-card-hover flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-[#FDF5E7] border border-[#EFE5D3] text-[10px] font-semibold uppercase text-[#995900]">
                    {skill.category || 'Capability'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1C1912]">
                    {skill.people_with_skill?.length || 0} engineers
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1C1912] mt-2">{skill.name}</h3>
              </div>

              {skill.people_with_skill && skill.people_with_skill.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-[#EFE5D3]">
                  <div className="text-[10px] font-bold text-[#A39A8B] uppercase">Top Practitioners:</div>
                  <div className="flex flex-wrap gap-1">
                    {skill.people_with_skill.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded bg-white border border-[#EFE5D3] text-[11px] text-[#1C1912]"
                      >
                        {p.name}
                      </span>
                    ))}
                    {skill.people_with_skill.length > 3 && (
                      <span className="text-[10px] text-[#A39A8B] self-center">
                        +{skill.people_with_skill.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => navigate(`/graph?node=${skill.id}`)}
                  className="w-full py-2 rounded-lg bg-[#1C1912] hover:bg-[#332E22] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Network className="w-3.5 h-3.5 text-[#F4A62C]" />
                  <span>Inspect Skill Network</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
