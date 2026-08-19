interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'profile' | 'panel';
  count?: number;
}

export default function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {items.map((_, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-20 h-4 bg-slate-800 rounded" />
              <div className="w-8 h-8 bg-slate-800 rounded-xl" />
            </div>
            <div className="w-16 h-8 bg-slate-800 rounded-md" />
            <div className="w-32 h-3 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-panel rounded-2xl overflow-hidden animate-pulse border border-slate-800">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex justify-between items-center">
          <div className="w-36 h-5 bg-slate-800 rounded" />
          <div className="w-24 h-4 bg-slate-800 rounded" />
        </div>
        <div className="divide-y divide-slate-800/50 p-4 space-y-4">
          {items.map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1.5">
                <div className="w-48 h-4 bg-slate-800 rounded" />
                <div className="w-32 h-3 bg-slate-800/60 rounded" />
              </div>
              <div className="w-20 h-6 bg-slate-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl" />
          <div className="space-y-2">
            <div className="w-48 h-6 bg-slate-800 rounded" />
            <div className="w-32 h-4 bg-slate-800/70 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="w-full h-24 bg-slate-800/50 rounded-xl" />
          <div className="w-full h-24 bg-slate-800/50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
      <div className="w-40 h-5 bg-slate-800 rounded" />
      <div className="w-full h-32 bg-slate-800/40 rounded-xl" />
    </div>
  );
}
