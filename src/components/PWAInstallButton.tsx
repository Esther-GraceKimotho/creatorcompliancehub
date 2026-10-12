import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA on the home screen, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 3000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // In case browser has not yet fired beforeinstallprompt or on desktop Chrome/Edge
      // provide instructions or modal
      setShowIOSGuide(true);
    }
  };

  // Compact button for header
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
            isInstallable
              ? 'bg-blue-600 hover:bg-blue-700 text-white animate-pulse'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
          } ${className}`}
          title="Install CreatorCompliance as an App on your phone or computer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">App</span>
        </button>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />
        )}
      </>
    );
  }

  // Full banner variant (e.g. at top of mobile dashboard or sidebar)
  return (
    <>
      <div className={`p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl shadow-md border border-blue-700/50 flex items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Install Creator App</h4>
            <p className="text-xs text-blue-200">Offline access, home screen shortcut & full screen</p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 font-extrabold text-xs rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4 text-blue-600" />
          {installSuccess ? 'Installed!' : 'Install'}
        </button>
      </div>

      {showIOSGuide && (
        <IOSInstallModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />
      )}
    </>
  );
};

interface IOSInstallModalProps {
  onClose: () => void;
  isIOS: boolean;
}

const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ onClose, isIOS }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              🇰🇪
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Install Mobile App</h3>
              <p className="text-xs text-slate-500">CreatorCompliance Kenya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-4 text-xs text-slate-600">
            <p className="font-medium text-slate-800">
              Install directly onto your iPhone or iPad home screen:
            </p>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Share className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block">Step 1: Tap Share</strong>
                <span>Tap the Share icon in Safari’s navigation toolbar at the bottom of your screen.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block">Step 2: Add to Home Screen</strong>
                <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block">Step 3: Launch from Home Screen</strong>
                <span>Tap <strong>&quot;Add&quot;</strong> in the top right to open full-screen like a native app.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-600">
            <p className="font-medium text-slate-800">
              To install on Android or Desktop Chrome / Edge:
            </p>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Download className="w-4 h-4 text-blue-600" />
                <span>One-Click Home Screen Install</span>
              </div>
              <p className="text-xs leading-relaxed text-blue-800">
                Tap your browser menu (<strong>⋮</strong> or <strong>Share</strong>) and choose <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
