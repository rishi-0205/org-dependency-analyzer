import { Link } from 'react-router-dom';
import { Sparkles, GitCommit, Mail, ArrowUpRight } from 'lucide-react';
import { BackupCandidate } from '../../types';

interface CandidateCardProps {
  candidate: BackupCandidate;
  rank: number;
}

export default function CandidateCard({ candidate, rank }: CandidateCardProps) {
  return (
    <div className="warm-card p-5 space-y-4 hover:border-[#1C1912] transition-all group">
      {/* Top Header with Rank & Match Score */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1C1912] text-white flex items-center justify-center font-bold text-sm">
            #{rank}
          </div>
          <div>
            <Link
              to={`/people/${candidate.candidate_id}`}
              className="font-bold text-base text-[#1C1912] hover:text-[#F4A62C] flex items-center gap-1.5 transition-colors"
            >
              <span>{candidate.candidate_name}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <div className="text-xs text-[#A39A8B]">
              {candidate.candidate_role} · <span className="text-[#1C1912] font-semibold">{candidate.candidate_seniority}</span>
            </div>
          </div>
        </div>

        {/* Composite Match Score Gauge */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#7FA65A]/18 text-[#416124] border border-[#7FA65A]/30 text-xs font-bold font-mono">
            <Sparkles className="w-3 h-3 text-[#416124]" />
            <span>Score: {candidate.match_score}</span>
          </div>
        </div>
      </div>

      {/* Shared Skills Matrix */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B] flex items-center justify-between">
          <span>Shared Technical Skills ({candidate.shared_skills.length})</span>
          <span className="text-[10px] text-[#A39A8B]">Skill Graph Overlap</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {candidate.shared_skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#FDF5E7] text-[#1C1912] border border-[#EFE5D3]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Relevant Activity Bonus & Contact */}
      <div className="pt-3 border-t border-[#EFE5D3] flex items-center justify-between text-xs text-[#A39A8B]">
        <div className="flex items-center gap-1.5 text-[11px]">
          <GitCommit className="w-3.5 h-3.5 text-[#416124]" />
          <span>
            {candidate.total_relevant_commits > 0 ? (
              <>
                <strong className="text-[#416124]">{candidate.total_relevant_commits}</strong> relevant commits
              </>
            ) : (
              <span className="text-[#A39A8B]">No prior module commits</span>
            )}
          </span>
        </div>

        <a
          href={`mailto:${candidate.candidate_email}`}
          className="flex items-center gap-1 text-[11px] text-[#1C1912] hover:text-[#F4A62C] transition-colors font-medium"
          title={candidate.candidate_email}
        >
          <Mail className="w-3 h-3" />
          <span className="hidden sm:inline">Contact</span>
        </a>
      </div>
    </div>
  );
}
