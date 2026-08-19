import { Link } from 'react-router-dom';
import { ArrowUpLeft, ArrowDownRight, ShieldCheck } from 'lucide-react';
import { ModuleRef } from '../../types';
import CriticalityBadge from '../common/CriticalityBadge';

interface DependencyFlowProps {
  upstream: ModuleRef[];    // Depends on
  downstream: ModuleRef[];  // Depended on by
}

export default function DependencyFlow({ upstream, downstream }: DependencyFlowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Upstream Dependencies (What this module relies on) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <ArrowUpLeft className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Prerequisite Dependencies ({upstream.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Upstream</span>
        </div>

        {upstream.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Independent root service (0 upstream dependencies)</span>
          </div>
        ) : (
          <div className="space-y-2">
            {upstream.map((mod) => (
              <Link
                key={mod.id}
                to={`/modules/${mod.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-colors group"
              >
                <div className="font-mono text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {mod.name}
                </div>
                <CriticalityBadge level={mod.criticality || 'medium'} size="sm" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Downstream Dependents (What relies on this module) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Dependent Consumers ({downstream.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Downstream Blast Radius</span>
        </div>

        {downstream.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero downstream consumers (Leaf module)</span>
          </div>
        ) : (
          <div className="space-y-2">
            {downstream.map((mod) => (
              <Link
                key={mod.id}
                to={`/modules/${mod.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-colors group"
              >
                <div className="font-mono text-xs font-bold text-slate-200 group-hover:text-rose-300 transition-colors">
                  {mod.name}
                </div>
                <CriticalityBadge level={mod.criticality || 'medium'} size="sm" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
