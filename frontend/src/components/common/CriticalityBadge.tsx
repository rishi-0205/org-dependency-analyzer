import { Criticality, RiskLevel } from '../../types';

interface CriticalityBadgeProps {
  level: Criticality | RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export default function CriticalityBadge({
  level,
  size = 'md',
  showDot = true,
}: CriticalityBadgeProps) {
  const norm = (level || 'low').toLowerCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  if (norm === 'critical' || norm === 'high') {
    colorClasses = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    dotColor = 'bg-rose-400';
  } else if (norm === 'medium' || norm === 'warning') {
    colorClasses = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400';
  } else if (norm === 'low' || norm === 'healthy') {
    colorClasses = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider ${sizeClasses} ${colorClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      <span>{level}</span>
    </span>
  );
}
