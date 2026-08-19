import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowUpRight, Filter, ChevronRight } from 'lucide-react';
import { AtRiskModule } from '../../types';
import CriticalityBadge from '../common/CriticalityBadge';

interface AtRiskTableProps {
  modules: AtRiskModule[];
}

export default function AtRiskTable({ modules }: AtRiskTableProps) {
  const [filterCrit, setFilterCrit] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'downstream'>('risk');
  const navigate = useNavigate();

  const filteredModules = modules.filter((m) => {
    if (filterCrit === 'all') return true;
    return m.criticality.toLowerCase() === filterCrit.toLowerCase();
  });

  const sortedModules = [...filteredModules].sort((a, b) => {
    if (sortBy === 'downstream') {
      return b.downstream_count - a.downstream_count;
    }
    const priority: Record<string, number> = { CRITICAL: 1, HIGH: 2, MEDIUM: 3 };
    const pA = priority[a.risk_level] || 4;
    const pB = priority[b.risk_level] || 4;
    if (pA !== pB) return pA - pB;
    return b.downstream_count - a.downstream_count;
  });

  return (
    <div className="warm-card overflow-hidden">
      {/* Header with Title & Filter Controls */}
      <div className="p-6 border-b border-[#EFE5D3] bg-[#FDF9F2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E15B43]/15 text-[#E15B43] flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C1912] flex items-center gap-2">
              Single-Point-of-Failure Modules
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-[#E15B43]/15 text-[#E15B43]">
                Bus Factor = 1
              </span>
            </h2>
            <p className="text-xs text-[#A39A8B]">
              Critical services owned by 1 person with 0 secondary contributors.
            </p>
          </div>
        </div>

        {/* Filter / Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#EFE5D3] text-xs">
            <Filter className="w-3.5 h-3.5 text-[#A39A8B] ml-2" />
            <button
              onClick={() => setFilterCrit('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                filterCrit === 'all'
                  ? 'bg-[#1C1912] text-white shadow-sm'
                  : 'text-[#A39A8B] hover:text-[#1C1912]'
              }`}
            >
              All ({modules.length})
            </button>
            <button
              onClick={() => setFilterCrit('high')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                filterCrit === 'high'
                  ? 'bg-[#E15B43] text-white shadow-sm'
                  : 'text-[#A39A8B] hover:text-[#1C1912]'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setFilterCrit('medium')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                filterCrit === 'medium'
                  ? 'bg-[#F4A62C] text-[#1C1912] shadow-sm font-bold'
                  : 'text-[#A39A8B] hover:text-[#1C1912]'
              }`}
            >
              Medium
            </button>
          </div>

          <button
            onClick={() => setSortBy(sortBy === 'risk' ? 'downstream' : 'risk')}
            className="px-3.5 py-1.5 bg-white text-xs font-semibold text-[#1C1912] rounded-lg border border-[#EFE5D3] hover:border-[#DFCDB7] transition-colors shadow-sm"
          >
            Sort: {sortBy === 'risk' ? 'Risk Tier' : 'Blast Radius'}
          </button>
        </div>
      </div>

      {/* Table / List Rows Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#1C1912]">
          <thead className="bg-[#FDF9F2] text-[11px] uppercase tracking-wider text-[#A39A8B] border-b border-[#EFE5D3]">
            <tr>
              <th className="py-3.5 px-6 font-bold">Module / Service</th>
              <th className="py-3.5 px-4 font-bold">Criticality</th>
              <th className="py-3.5 px-6 font-bold">Sole Owner (SPoF)</th>
              <th className="py-3.5 px-4 font-bold text-center">Downstream Dependents</th>
              <th className="py-3.5 px-4 font-bold">Risk Level</th>
              <th className="py-3.5 px-6 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE5D3]">
            {sortedModules.map((item) => (
              <tr
                key={item.module_id}
                className="hover:bg-[#FDF9F2] transition-colors group"
              >
                {/* Module Column */}
                <td className="py-4 px-6">
                  <Link
                    to={`/modules/${item.module_id}`}
                    className="font-mono text-sm font-bold text-[#1C1912] hover:text-[#F4A62C] flex items-center gap-1.5 transition-colors"
                  >
                    <span>{item.module_name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <div className="text-[11px] text-[#A39A8B] mt-0.5">
                    Contributors: <strong className="text-[#E15B43]">0</strong> (Zero redundancy)
                  </div>
                </td>

                {/* Criticality Column */}
                <td className="py-4 px-4">
                  <CriticalityBadge level={item.criticality} size="sm" />
                </td>

                {/* Owner Column */}
                <td className="py-4 px-6">
                  <Link
                    to={`/people/${item.owner_id}`}
                    className="font-semibold text-[#1C1912] hover:text-[#F4A62C] transition-colors block"
                  >
                    {item.owner_name}
                  </Link>
                  {item.owner_role && (
                    <div className="text-xs text-[#A39A8B]">{item.owner_role}</div>
                  )}
                </td>

                {/* Downstream Count Column */}
                <td className="py-4 px-4 text-center">
                  <span
                    className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-md ${
                      item.downstream_count > 2
                        ? 'bg-[#E15B43]/15 text-[#E15B43]'
                        : item.downstream_count > 0
                        ? 'bg-[#F4A62C]/18 text-[#995900]'
                        : 'bg-[#EFE5D3] text-[#1C1912]'
                    }`}
                  >
                    {item.downstream_count} {item.downstream_count === 1 ? 'service' : 'services'}
                  </span>
                </td>

                {/* Risk Level Badge */}
                <td className="py-4 px-4">
                  <CriticalityBadge level={item.risk_level} size="sm" />
                </td>

                {/* Actions Column */}
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => navigate(`/people/${item.owner_id}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#1C1912] hover:bg-[#332E22] text-white transition-all shadow-sm"
                  >
                    <span>Simulate Impact</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedModules.length === 0 && (
        <div className="p-8 text-center text-[#A39A8B] text-sm">
          No at-risk single-owner modules found matching the selected filter.
        </div>
      )}
    </div>
  );
}
