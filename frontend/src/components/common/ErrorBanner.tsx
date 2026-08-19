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
    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-md p-6 text-rose-200 shadow-xl space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 ring-1 ring-rose-500/40">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-base font-semibold text-rose-100">{title}</h4>
          <p className="text-sm text-rose-300/90 leading-relaxed">{message}</p>
          {hint && (
            <p className="text-xs text-rose-400/80 font-mono bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-900/40 mt-2 inline-block">
              💡 {hint}
            </p>
          )}
        </div>
      </div>

      {onRetry && (
        <div className="flex justify-end pt-2 border-t border-rose-500/20">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition-all shadow-lg shadow-rose-950/50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Reconnecting...' : 'Retry Connection'}
          </button>
        </div>
      )}
    </div>
  );
}
