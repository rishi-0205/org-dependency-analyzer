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
          <div key={i} className="warm-card p-5 animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-20 h-4 bg-[#EFE5D3] rounded-md" />
              <div className="w-8 h-8 bg-[#EFE5D3] rounded-xl" />
            </div>
            <div className="w-16 h-8 bg-[#EFE5D3] rounded-md" />
            <div className="w-32 h-3 bg-[#EFE5D3]/70 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="warm-card overflow-hidden animate-pulse">
        <div className="p-4 border-b border-[#EFE5D3] bg-[#FDF9F2] flex justify-between items-center">
          <div className="w-36 h-5 bg-[#EFE5D3] rounded-md" />
          <div className="w-24 h-4 bg-[#EFE5D3] rounded-md" />
        </div>
        <div className="divide-y divide-[#EFE5D3] p-4 space-y-4">
          {items.map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1.5">
                <div className="w-48 h-4 bg-[#EFE5D3] rounded-md" />
                <div className="w-32 h-3 bg-[#EFE5D3]/70 rounded-md" />
              </div>
              <div className="w-20 h-6 bg-[#EFE5D3] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="warm-card p-6 animate-pulse space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#EFE5D3] rounded-2xl" />
          <div className="space-y-2">
            <div className="w-48 h-6 bg-[#EFE5D3] rounded-md" />
            <div className="w-32 h-4 bg-[#EFE5D3]/70 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#EFE5D3]">
          <div className="w-full h-24 bg-[#EFE5D3]/50 rounded-xl" />
          <div className="w-full h-24 bg-[#EFE5D3]/50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="warm-card p-6 animate-pulse space-y-4">
      <div className="w-40 h-5 bg-[#EFE5D3] rounded-md" />
      <div className="w-full h-32 bg-[#EFE5D3]/40 rounded-xl" />
    </div>
  );
}
