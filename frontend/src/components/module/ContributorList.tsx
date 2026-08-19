import { Link } from 'react-router-dom';
import { Users, GitCommit, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { ContributorRef } from '../../types';

interface ContributorListProps {
  contributors: ContributorRef[];
}

export default function ContributorList({ contributors }: ContributorListProps) {
  if (contributors.length === 0) {
    return (
      <div className="warm-card p-6 border-[#E15B43]/30 bg-[#E15B43]/10 text-center space-y-2">
        <div className="w-10 h-10 rounded-lg bg-[#E15B43]/20 text-[#E15B43] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-[#E15B43]">Zero Secondary Contributors</h4>
        <p className="text-xs text-[#1C1912]/80 max-w-sm mx-auto">
          This module is a single point of failure (Bus Factor = 1). If the primary owner leaves, there is no secondary codebase maintainer.
        </p>
      </div>
    );
  }

  return (
    <div className="warm-card p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#EFE5D3]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#1C1912]" />
          <h3 className="text-sm font-bold text-[#1C1912] uppercase tracking-wider">
            Active Secondary Contributors ({contributors.length})
          </h3>
        </div>
        <span className="text-[11px] text-[#A39A8B]">Codebase Activity</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contributors.map((c) => (
          <Link
            key={c.id}
            to={`/people/${c.id}`}
            className="flex items-center justify-between p-3.5 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] hover:border-[#1C1912] transition-colors group"
          >
            <div>
              <div className="font-semibold text-xs text-[#1C1912] group-hover:text-[#F4A62C] flex items-center gap-1">
                <span>{c.name}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {c.last_active && (
                <div className="text-[10px] text-[#A39A8B]">
                  Last active: {c.last_active}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#416124] bg-[#7FA65A]/15 px-2.5 py-0.5 rounded-md border border-[#7FA65A]/30">
              <GitCommit className="w-3 h-3 text-[#416124]" />
              <span>{c.commits}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
