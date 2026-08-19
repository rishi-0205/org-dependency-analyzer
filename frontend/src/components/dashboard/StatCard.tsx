import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'purple' | 'amber' | 'emerald' | 'rose';
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  onClick,
}: StatCardProps) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
      border: 'hover:border-indigo-500/30',
      accent: 'text-indigo-300',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
      border: 'hover:border-purple-500/30',
      accent: 'text-purple-300',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
      border: 'hover:border-amber-500/30',
      accent: 'text-amber-300',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
      border: 'hover:border-emerald-500/30',
      accent: 'text-emerald-300',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
      border: 'hover:border-rose-500/30',
      accent: 'text-rose-300',
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 rounded-2xl glass-panel-hover flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      } ${colorMap.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 ${colorMap.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="text-3xl font-extrabold text-slate-100 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-400">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
