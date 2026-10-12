import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:right-auto z-50 flex items-center justify-between gap-3 rounded-2xl bg-slate-900/95 text-white border border-amber-500/40 px-4 py-2.5 text-xs font-medium shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <WifiOff className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-bold text-amber-400">Offline App Mode</span>
          <p className="text-[11px] text-slate-300">Using cached tax models and local IP storage.</p>
        </div>
      </div>
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
    </div>
  );
};
