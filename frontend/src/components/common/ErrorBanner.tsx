import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  title?: string;
  message: string;
  hint?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function ErrorBanner({
  title = 'Database Connection Error',
  message,
  hint,
  onRetry,
  isRetrying = false,
}: ErrorBannerProps) {
  return (
    <div className="rounded-[20px] border border-[#E15B43]/30 bg-[#E15B43]/10 p-6 text-[#1C1912] shadow-sm space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#E15B43]/20 text-[#E15B43] flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-base font-bold text-[#E15B43]">{title}</h4>
          <p className="text-sm text-[#1C1912]/80 leading-relaxed">{message}</p>
          {hint && (
            <p className="text-xs text-[#E15B43] font-mono bg-white/70 px-3 py-1.5 rounded-lg border border-[#E15B43]/20 mt-2 inline-block">
              {hint}
            </p>
          )}
        </div>
      </div>

      {onRetry && (
        <div className="flex justify-end pt-2 border-t border-[#E15B43]/20">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-full bg-[#E15B43] hover:bg-[#C94A34] disabled:opacity-50 text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Reconnecting...' : 'Retry Connection'}
          </button>
        </div>
      )}
    </div>
  );
}
