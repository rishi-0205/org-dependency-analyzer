import { Link } from 'react-router-dom';
import { Sparkles, GitCommit, Mail, ArrowUpRight } from 'lucide-react';
import { BackupCandidate } from '../../types';

interface CandidateCardProps {
  candidate: BackupCandidate;
  rank: number;
}

export default function CandidateCard({ candidate, rank }: CandidateCardProps) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group space-y-4">
      {/* Top Header with Rank & Match Score */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 flex items-center justify-center ring-1 ring-indigo-500/30 font-bold text-sm">
            #{rank}
          </div>
          <div>
            <Link
              to={`/people/${candidate.candidate_id}`}
              className="font-bold text-base text-slate-100 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
            >
              <span>{candidate.candidate_name}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <div className="text-xs text-slate-400">
              {candidate.candidate_role} · <span className="text-indigo-400 font-medium">{candidate.candidate_seniority}</span>
            </div>
          </div>
        </div>

        {/* Composite Match Score Gauge */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Score: {candidate.match_score}</span>
          </div>
        </div>
      </div>

      {/* Shared Skills Matrix */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Shared Technical Skills ({candidate.shared_skills.length})</span>
          <span className="text-[10px] text-slate-500">Skill Graph Intersection</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {candidate.shared_skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Relevant Activity Bonus & Contact */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-[11px]">
          <GitCommit className="w-3.5 h-3.5 text-purple-400" />
          <span>
            {candidate.total_relevant_commits > 0 ? (
              <>
                <strong className="text-purple-300">{candidate.total_relevant_commits}</strong> relevant commits
              </>
            ) : (
              <span className="text-slate-500">No prior module commits</span>
            )}
          </span>
        </div>

        <a
          href={`mailto:${candidate.candidate_email}`}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          title={candidate.candidate_email}
        >
          <Mail className="w-3 h-3" />
          <span className="hidden sm:inline">Contact</span>
        </a>
      </div>
    </div>
  );
}
