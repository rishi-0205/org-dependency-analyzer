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
      <div className="warm-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE5D3]">
          <div className="flex items-center gap-2">
            <ArrowUpLeft className="w-4 h-4 text-[#1C1912]" />
            <h3 className="text-sm font-bold text-[#1C1912] uppercase tracking-wider">
              Prerequisite Dependencies ({upstream.length})
            </h3>
          </div>
          <span className="text-[11px] text-[#A39A8B]">Upstream</span>
        </div>

        {upstream.length === 0 ? (
          <div className="p-4 rounded-lg bg-[#FDF9F2] border border-[#EFE5D3] text-center text-xs text-[#A39A8B] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7FA65A]" />
            <span>Independent root service (0 upstream dependencies)</span>
          </div>
        ) : (
          <div className="space-y-2">
            {upstream.map((mod) => (
              <Link
                key={mod.id}
                to={`/modules/${mod.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] hover:border-[#1C1912] transition-colors group"
              >
                <div className="font-mono text-xs font-bold text-[#1C1912] group-hover:text-[#F4A62C] transition-colors">
                  {mod.name}
                </div>
                <CriticalityBadge level={mod.criticality || 'medium'} size="sm" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Downstream Dependents (What relies on this module) */}
      <div className="warm-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE5D3]">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-[#E15B43]" />
            <h3 className="text-sm font-bold text-[#1C1912] uppercase tracking-wider">
              Dependent Consumers ({downstream.length})
            </h3>
          </div>
          <span className="text-[11px] text-[#A39A8B]">Downstream Blast Radius</span>
        </div>

        {downstream.length === 0 ? (
          <div className="p-4 rounded-lg bg-[#FDF9F2] border border-[#EFE5D3] text-center text-xs text-[#A39A8B] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7FA65A]" />
            <span>Zero downstream consumers (Leaf module)</span>
          </div>
        ) : (
          <div className="space-y-2">
            {downstream.map((mod) => (
              <Link
                key={mod.id}
                to={`/modules/${mod.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] hover:border-[#E15B43] transition-colors group"
              >
                <div className="font-mono text-xs font-bold text-[#1C1912] group-hover:text-[#E15B43] transition-colors">
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
