import { Link } from 'react-router-dom';
import { Users, GitCommit, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { ContributorRef } from '../../types';

interface ContributorListProps {
  contributors: ContributorRef[];
}

export default function ContributorList({ contributors }: ContributorListProps) {
  if (contributors.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto ring-1 ring-rose-500/30">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-rose-200">Zero Secondary Contributors</h4>
        <p className="text-xs text-rose-300/80 max-w-sm mx-auto">
          This module is a single point of failure (Bus Factor = 1). If the primary owner leaves, there is no secondary codebase maintainer.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Active Secondary Contributors ({contributors.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Codebase Activity</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contributors.map((c) => (
          <Link
            key={c.id}
            to={`/people/${c.id}`}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-colors group"
          >
            <div>
              <div className="font-medium text-xs text-slate-200 group-hover:text-purple-300 flex items-center gap-1">
                <span>{c.name}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {c.last_active && (
                <div className="text-[10px] text-slate-500">
                  Last active: {c.last_active}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs font-mono font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
              <GitCommit className="w-3 h-3 text-purple-400" />
              <span>{c.commits}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
