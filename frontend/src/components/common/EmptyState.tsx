import { AlertCircle, ShieldCheck, Search, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  type?: 'neutral' | 'warning' | 'success' | 'skill-gap';
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  type = 'neutral',
  icon: CustomIcon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  let IconComponent = CustomIcon || Search;
  let containerColor = 'bg-slate-900/40 border-slate-800 text-slate-400';
  let iconBg = 'bg-slate-800/80 text-slate-300 ring-slate-700';

  if (type === 'skill-gap') {
    IconComponent = CustomIcon || AlertCircle;
    containerColor = 'bg-amber-500/5 border-amber-500/20 text-amber-200/80';
    iconBg = 'bg-amber-500/10 text-amber-400 ring-amber-500/30';
  } else if (type === 'success') {
    IconComponent = CustomIcon || ShieldCheck;
    containerColor = 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200/80';
    iconBg = 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30';
  } else if (type === 'warning') {
    IconComponent = CustomIcon || AlertCircle;
    containerColor = 'bg-rose-500/5 border-rose-500/20 text-rose-200/80';
    iconBg = 'bg-rose-500/10 text-rose-400 ring-rose-500/30';
  }

  return (
    <div
      className={`rounded-2xl border p-8 text-center flex flex-col items-center justify-center space-y-3 ${containerColor}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ring-1 ${iconBg}`}>
        <IconComponent className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-semibold text-slate-200">{title}</h3>
        <p className="text-xs leading-relaxed text-slate-400">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
