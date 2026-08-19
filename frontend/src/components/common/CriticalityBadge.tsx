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

  let colorClasses = 'bg-[#EFE5D3] text-[#1C1912] border-[#DFCDB7]';
  let dotColor = 'bg-[#A39A8B]';

  if (norm === 'critical' || norm === 'high') {
    colorClasses = 'bg-[#E15B43]/12 text-[#E15B43] border-[#E15B43]/30';
    dotColor = 'bg-[#E15B43]';
  } else if (norm === 'medium' || norm === 'warning') {
    colorClasses = 'bg-[#F4A62C]/18 text-[#995900] border-[#F4A62C]/35';
    dotColor = 'bg-[#F4A62C]';
  } else if (norm === 'low' || norm === 'healthy') {
    colorClasses = 'bg-[#7FA65A]/18 text-[#416124] border-[#7FA65A]/35';
    dotColor = 'bg-[#7FA65A]';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-semibold',
    lg: 'text-sm px-3 py-1 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider ${sizeClasses} ${colorClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      <span>{level}</span>
    </span>
  );
}
