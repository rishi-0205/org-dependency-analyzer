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
    // Sort by risk priority
    const priority: Record<string, number> = { CRITICAL: 1, HIGH: 2, MEDIUM: 3 };
    const pA = priority[a.risk_level] || 4;
    const pB = priority[b.risk_level] || 4;
    if (pA !== pB) return pA - pB;
    return b.downstream_count - a.downstream_count;
  });

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Header with Title & Filter Controls */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center ring-1 ring-rose-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Single-Point-of-Failure Modules
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Bus Factor = 1
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Critical services owned by 1 person with 0 secondary contributors
            </p>
          </div>
        </div>

        {/* Filter / Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              onClick={() => setFilterCrit('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterCrit === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'hover:text-slate-100'
              }`}
            >
              All ({modules.length})
            </button>
            <button
              onClick={() => setFilterCrit('high')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterCrit === 'high'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'hover:text-slate-100'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setFilterCrit('medium')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterCrit === 'medium'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'hover:text-slate-100'
              }`}
            >
              Medium
            </button>
          </div>

          <button
            onClick={() => setSortBy(sortBy === 'risk' ? 'downstream' : 'risk')}
            className="px-3 py-1.5 bg-slate-900 text-xs font-medium text-slate-300 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
            title="Toggle sort by risk tier or downstream blast count"
          >
            Sort: {sortBy === 'risk' ? 'Risk Tier' : 'Blast Radius'}
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
            <tr>
              <th className="py-3.5 px-5 font-semibold">Module / Service</th>
              <th className="py-3.5 px-4 font-semibold">Criticality</th>
              <th className="py-3.5 px-5 font-semibold">Sole Owner (SPoF)</th>
              <th className="py-3.5 px-4 font-semibold text-center">Downstream Dependents</th>
              <th className="py-3.5 px-4 font-semibold">Risk Level</th>
              <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sortedModules.map((item) => (
              <tr
                key={item.module_id}
                className="hover:bg-slate-800/30 transition-colors group"
              >
                {/* Module Column */}
                <td className="py-4 px-5">
                  <Link
                    to={`/modules/${item.module_id}`}
                    className="font-mono text-sm font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1.5 transition-colors"
                  >
                    <span>{item.module_name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Contributors: <span className="text-rose-400 font-semibold">0</span> (No redundancy)
                  </div>
                </td>

                {/* Criticality Column */}
                <td className="py-4 px-4">
                  <CriticalityBadge level={item.criticality} size="sm" />
                </td>

                {/* Owner Column */}
                <td className="py-4 px-5">
                  <Link
                    to={`/people/${item.owner_id}`}
                    className="font-medium text-slate-200 hover:text-indigo-300 transition-colors block"
                  >
                    {item.owner_name}
                  </Link>
                  {item.owner_role && (
                    <div className="text-xs text-slate-400">{item.owner_role}</div>
                  )}
                </td>

                {/* Downstream Count Column */}
                <td className="py-4 px-4 text-center">
                  <span
                    className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-lg ${
                      item.downstream_count > 2
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.downstream_count > 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
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
                <td className="py-4 px-5 text-right">
                  <button
                    onClick={() => navigate(`/people/${item.owner_id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700 transition-all shadow-sm"
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
        <div className="p-8 text-center text-slate-400 text-sm">
          No at-risk single-owner modules found matching the selected filter.
        </div>
      )}
    </div>
  );
}
