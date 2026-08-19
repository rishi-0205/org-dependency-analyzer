import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'amber' | 'ink' | 'rose' | 'green' | 'taupe' | 'terracotta';
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'ink',
  onClick,
}: StatCardProps) {
  const colorMap = {
    ink: 'bg-[#1C1912] text-white',
    amber: 'bg-[#F4A62C] text-[#1C1912]',
    rose: 'bg-[#E15B43] text-white',
    green: 'bg-[#7FA65A] text-white',
    taupe: 'bg-[#B8A78D] text-white',
    terracotta: 'bg-[#D9724A] text-white',
  }[color];

  return (
    <div
      onClick={onClick}
      className="warm-card p-5 warm-card-hover flex flex-col justify-between group cursor-pointer"
      title="Click to view full directory & explore in graph"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#A39A8B] uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap}`}>
            <Icon className="w-4 h-4" />
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#A39A8B] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="text-3xl font-extrabold text-[#1C1912] tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-[#A39A8B] flex items-center justify-between">
            <span>{subtitle}</span>
            <span className="text-[10px] text-[#1C1912] group-hover:text-[#F4A62C] font-semibold transition-colors">
              Browse →
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
