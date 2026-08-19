import { ShieldAlert, Users, AlertTriangle } from 'lucide-react';
import { ImpactResponse, CandidateResponse } from '../../types';
import BlastRadiusTree from './BlastRadiusTree';
import CandidateCard from './CandidateCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';

interface ImpactPanelProps {
  personName: string;
  impactData: ImpactResponse | null;
  candidatesData: CandidateResponse | null;
  isLoading: boolean;
}

export default function ImpactPanel({
  personName,
  impactData,
  candidatesData,
  isLoading,
}: ImpactPanelProps) {
  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 animate-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-5 bg-slate-800 rounded animate-pulse" />
            <div className="w-72 h-4 bg-slate-800/60 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton type="panel" count={2} />
          <LoadingSkeleton type="panel" count={2} />
        </div>
      </div>
    );
  }

  if (!impactData || !candidatesData) {
    return null;
  }

  const totalImpactCount = impactData.total_downstream_count;
  const candidates = candidatesData.candidates || [];

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-[#0E1524] to-[#0B0F17] shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Simulation Summary Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center ring-1 ring-rose-500/40 flex-shrink-0 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Departure Simulation: {personName}
            </h2>
            <p className="text-xs text-rose-200/80 mt-0.5">
              Organizational blast radius calculated across multi-hop dependency paths and skill redundancy graphs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Blast Radius</div>
            <div className="text-lg font-black text-rose-400 font-mono">
              {totalImpactCount} {totalImpactCount === 1 ? 'Service' : 'Services'}
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Backfills</div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {candidates.length} {candidates.length === 1 ? 'Match' : 'Matches'}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Cascading Blast Radius */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-slate-100">
                Cascading Impacted Services
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {impactData.owned_modules.length} Owned Root {impactData.owned_modules.length === 1 ? 'Module' : 'Modules'}
            </span>
          </div>

          <BlastRadiusTree ownedModules={impactData.owned_modules} />
        </div>

        {/* Right Column: Ranked Replacement Candidates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">
                Recommended Backfill Candidates
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Ranked by Skill & Commit Overlap
            </span>
          </div>

          {candidates.length === 0 ? (
            <EmptyState
              title="No Direct Backfill Found — Skill Gap"
              description="No existing employees share the required technical skill combinations for this individual's owned assets. Immediate cross-training or external hiring required."
              type="skill-gap"
              icon={AlertTriangle}
            />
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate, idx) => (
                <CandidateCard
                  key={candidate.candidate_id}
                  candidate={candidate}
                  rank={idx + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
