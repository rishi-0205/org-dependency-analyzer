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
          className="warm-card p-5 space-y-4"
        >
          {/* Owned Root Module Header */}
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#EFE5D3]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#E15B43]/15 text-[#E15B43] rounded-md">
                  Primary Asset
                </span>
                <Link
                  to={`/modules/${mod.module_id}`}
                  className="font-mono text-base font-bold text-[#1C1912] hover:text-[#F4A62C] transition-colors"
                >
                  {mod.module_name}
                </Link>
              </div>
              {mod.description && (
                <p className="text-xs text-[#A39A8B] max-w-md">{mod.description}</p>
              )}
            </div>

            <CriticalityBadge level={mod.criticality} size="sm" />
          </div>

          {/* Downstream Impact List */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B] flex items-center justify-between">
              <span>Downstream Cascading Dependents ({mod.at_risk_downstream.length})</span>
              <span className="text-[10px] text-[#A39A8B] font-normal">
                Multi-Hop Graph Traversal
              </span>
            </div>

            {mod.at_risk_downstream.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#FDF9F2] border border-[#EFE5D3] text-center text-xs text-[#A39A8B] flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7FA65A]" />
                <span>Zero downstream service dependencies (Isolated Leaf Module)</span>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {mod.at_risk_downstream.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] hover:border-[#1C1912] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-[#E15B43]/15 text-[#E15B43] flex items-center justify-center text-xs font-mono font-bold">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <Link
                          to={`/modules/${dep.id}`}
                          className="font-mono text-xs font-bold text-[#1C1912] hover:text-[#F4A62C] transition-colors"
                        >
                          {dep.name}
                        </Link>
                        <div className="text-[10px] text-[#A39A8B] flex items-center gap-1.5 mt-0.5">
                          <Layers className="w-3 h-3 text-[#A39A8B]" />
                          <span>
                            Dependency Distance: <strong className="text-[#1C1912]">{dep.depth} {dep.depth === 1 ? 'hop' : 'hops'}</strong>
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
