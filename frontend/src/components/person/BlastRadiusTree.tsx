import { Link } from 'react-router-dom';
import { ArrowDownRight, Layers, ShieldCheck, Box } from 'lucide-react';
import { OwnedModuleImpact } from '../../types';
import CriticalityBadge from '../common/CriticalityBadge';
import EmptyState from '../common/EmptyState';

interface BlastRadiusTreeProps {
  ownedModules: OwnedModuleImpact[];
}

export default function BlastRadiusTree({ ownedModules }: BlastRadiusTreeProps) {
  if (ownedModules.length === 0) {
    return (
      <EmptyState
        title="No Modules Owned"
        description="This individual does not currently serve as primary owner for any architectural modules."
        type="neutral"
        icon={Box}
      />
    );
  }

  return (
    <div className="space-y-6">
      {ownedModules.map((mod) => (
        <div
          key={mod.module_id}
          className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4"
        >
          {/* Owned Root Module Header */}
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                  Primary Asset
                </span>
                <Link
                  to={`/modules/${mod.module_id}`}
                  className="font-mono text-base font-bold text-indigo-300 hover:text-indigo-200 transition-colors"
                >
                  {mod.module_name}
                </Link>
              </div>
              {mod.description && (
                <p className="text-xs text-slate-400 max-w-md">{mod.description}</p>
              )}
            </div>

            <CriticalityBadge level={mod.criticality} size="sm" />
          </div>

          {/* Downstream Impact List */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Downstream Cascading Dependents ({mod.at_risk_downstream.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Multi-Hop Graph Traversal
              </span>
            </div>

            {mod.at_risk_downstream.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero downstream service dependencies (Isolated Leaf Module)</span>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {mod.at_risk_downstream.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs font-mono font-bold">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <Link
                          to={`/modules/${dep.id}`}
                          className="font-mono text-xs font-bold text-slate-200 hover:text-indigo-300 transition-colors"
                        >
                          {dep.name}
                        </Link>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Layers className="w-3 h-3 text-slate-500" />
                          <span>
                            Dependency Distance: <strong className="text-slate-300">{dep.depth} {dep.depth === 1 ? 'hop' : 'hops'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <CriticalityBadge level={dep.criticality || 'medium'} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
