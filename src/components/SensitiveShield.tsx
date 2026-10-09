import React from 'react';
import { useBiometrics } from '../context/BiometricContext';
import { ScanFace, Fingerprint, Lock, Unlock, Eye, EyeOff } from 'lucide-react';

interface SensitiveShieldProps {
  value: string;
  maskedValue?: string;
  type?: 'kraPin' | 'idNumber' | 'currency' | 'generic';
  label?: string;
  target?: 'KRA' | 'KECOBO' | 'TAX_ESTIMATES' | 'SYSTEM';
  className?: string;
  inline?: boolean;
}

export default function SensitiveShield({
  value,
  maskedValue,
  type = 'generic',
  label = 'Sensitive Data',
  target = 'SYSTEM',
  className = '',
  inline = false
}: SensitiveShieldProps) {
  const { 
    isUnlocked, 
    settings, 
    triggerBiometricAuth, 
    lockVault,
    maskKraPin,
    maskIdNumber,
    maskCurrency
  } = useBiometrics();

  const getDisplayMasked = () => {
    if (maskedValue) return maskedValue;
    if (type === 'kraPin') return maskKraPin(value);
    if (type === 'idNumber') return maskIdNumber(value);
    if (type === 'currency') return maskCurrency(value);
    return '••••••••';
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUnlocked) {
      triggerBiometricAuth({
        reason: `Authorize biometric scan to reveal sensitive ${label}`,
        target
      });
    } else {
      // Optional toggle to re-lock
      lockVault();
    }
  };

  const isMasked = settings.isEnabled && !isUnlocked;
  const BiometricIcon = settings.primaryBiometric === 'fingerprint' ? Fingerprint : ScanFace;

  if (inline) {
    return (
      <button
        type="button"
        onClick={handleUnlockClick}
        title={isMasked ? `Click to unlock ${label} with ${settings.primaryBiometric.toUpperCase()}` : 'Click to hide'}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-mono transition-all text-xs font-bold ${
          isMasked
            ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 cursor-pointer'
            : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
        } ${className}`}
      >
        <span>{isMasked ? getDisplayMasked() : value}</span>
        {isMasked ? (
          <BiometricIcon className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        ) : (
          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
        )}
      </button>
    );
  }

  return (
    <div 
      onClick={handleUnlockClick}
      className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
        isMasked 
          ? 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/20' 
          : 'bg-white border-emerald-200 shadow-2xs'
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-sm tracking-wide">
          {isMasked ? getDisplayMasked() : value}
        </span>
        {isMasked && (
          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
            Protected
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition-colors">
        {isMasked ? (
          <span className="text-[11px] font-bold flex items-center gap-1 text-blue-600">
            <BiometricIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tap to Unlock</span>
          </span>
        ) : (
          <span className="text-[11px] font-bold flex items-center gap-1 text-emerald-600">
            <Unlock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unlocked</span>
          </span>
        )}
      </div>
    </div>
  );
}
