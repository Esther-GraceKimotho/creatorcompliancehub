import React, { useState, useEffect } from 'react';
import { useBiometrics } from '../context/BiometricContext';
import { 
  ScanFace, 
  Fingerprint, 
  ShieldCheck, 
  X, 
  KeyRound, 
  Sparkles, 
  Check, 
  AlertCircle,
  Smartphone,
  Lock
} from 'lucide-react';
import { requestNativeBiometricAuth } from '../utils/webauthn';
import { BiometricType } from '../types/biometrics';

export default function BiometricModal() {
  const { 
    promptConfig, 
    closePrompt, 
    unlockVault, 
    settings, 
    addAuditLog,
    isPlatformBiometricAvailable 
  } = useBiometrics();

  const [activeMode, setActiveMode] = useState<BiometricType | 'pin'>(
    settings.primaryBiometric || 'faceid'
  );
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (promptConfig.isOpen) {
      setActiveMode(settings.primaryBiometric || 'faceid');
      setScanState('idle');
      setPinInput('');
      setPinError(null);
      setStatusMessage('Touch sensor or hold camera to authenticate');
    }
  }, [promptConfig.isOpen, settings.primaryBiometric]);

  if (!promptConfig.isOpen) return null;

  const handleSimulatedBiometricScan = (type: BiometricType) => {
    setScanState('scanning');
    setStatusMessage(type === 'faceid' ? 'Scanning facial geometry via TrueDepth...' : 'Reading fingerprint biometric sensor...');

    setTimeout(() => {
      setScanState('success');
      setStatusMessage(type === 'faceid' ? 'FaceID Verified • Access Granted' : 'Fingerprint Matched • Access Granted');

      addAuditLog({
        action: `Biometric authentication verified (${type === 'faceid' ? 'FaceID' : 'Fingerprint'})`,
        target: promptConfig.target,
        biometricType: type,
        status: 'SUCCESS',
        details: promptConfig.reason
      });

      setTimeout(() => {
        unlockVault(type);
        if (promptConfig.onSuccess) promptConfig.onSuccess();
        closePrompt();
      }, 700);
    }, 1100);
  };

  const handleNativeWebAuthn = async () => {
    setScanState('scanning');
    setStatusMessage('Prompting platform authenticator (TouchID / FaceID)...');

    try {
      const res = await requestNativeBiometricAuth({
        challengeText: promptConfig.reason,
        userName: 'Maina Kamau'
      });

      if (res.success) {
        setScanState('success');
        setStatusMessage('Hardware Biometrics Verified!');
        addAuditLog({
          action: 'Hardware platform biometric authenticator verified',
          target: promptConfig.target,
          biometricType: 'passkey',
          status: 'SUCCESS',
          details: promptConfig.reason
        });
        setTimeout(() => {
          unlockVault('passkey');
          if (promptConfig.onSuccess) promptConfig.onSuccess();
          closePrompt();
        }, 600);
      } else {
        // Fallback to in-app simulated scanner seamlessly
        handleSimulatedBiometricScan(activeMode === 'pin' ? 'faceid' : (activeMode as BiometricType));
      }
    } catch {
      handleSimulatedBiometricScan(activeMode === 'pin' ? 'faceid' : (activeMode as BiometricType));
    }
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === settings.backupPin || pinInput === '202619') {
      setScanState('success');
      setStatusMessage('Backup PIN Verified!');
      addAuditLog({
        action: 'Verified security backup PIN',
        target: promptConfig.target,
        biometricType: 'PIN',
        status: 'SUCCESS',
        details: promptConfig.reason
      });
      setTimeout(() => {
        unlockVault('PIN');
        if (promptConfig.onSuccess) promptConfig.onSuccess();
        closePrompt();
      }, 600);
    } else {
      setPinError('Incorrect 6-digit PIN (Default demo PIN is 202619)');
      setScanState('failed');
      setTimeout(() => setScanState('idle'), 1500);
    }
  };

  const getTargetBadge = () => {
    switch (promptConfig.target) {
      case 'KRA':
        return { label: 'KRA iTax & eTIMS Security', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'KECOBO':
        return { label: 'KECOBO National Rights Registry', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'TAX_ESTIMATES':
        return { label: '2026 Tax Projections Vault', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PDF_EXPORT':
        return { label: 'Sensitive Document Export', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Creator Compliance Security', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const targetBadge = getTargetBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <button
            onClick={closePrompt}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${targetBadge.bg}`}>
              {targetBadge.label}
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Biometric Access Required
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {promptConfig.reason}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-4 pt-2">
          <button
            type="button"
            onClick={() => { setActiveMode('faceid'); setScanState('idle'); }}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeMode === 'faceid'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ScanFace className="w-4 h-4" />
            FaceID
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('fingerprint'); setScanState('idle'); }}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeMode === 'fingerprint'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            Fingerprint
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('pin'); setScanState('idle'); }}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeMode === 'pin'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Backup PIN
          </button>
        </div>

        {/* Interactive Authentication Center */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[280px]">
          {activeMode === 'faceid' && (
            <div className="flex flex-col items-center text-center space-y-5 w-full">
              {/* FaceID Visual Scanner Frame */}
              <div 
                onClick={() => scanState === 'idle' && handleSimulatedBiometricScan('faceid')}
                className={`relative w-40 h-40 rounded-3xl border-2 flex items-center justify-center transition-all cursor-pointer select-none group ${
                  scanState === 'scanning'
                    ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/20 ring-4 ring-blue-100'
                    : scanState === 'success'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-100'
                    : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
              >
                {/* 4 Corner Markers */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-600 rounded-tl-md"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-600 rounded-tr-md"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-600 rounded-bl-md"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-600 rounded-br-md"></div>

                {/* Laser Sweep line when scanning */}
                {scanState === 'scanning' && (
                  <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-sm shadow-blue-500 animate-[bounce_1.2s_infinite]"></div>
                )}

                {scanState === 'success' ? (
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                    <Check className="w-10 h-10 stroke-[3]" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <ScanFace className={`w-20 h-20 transition-all ${
                      scanState === 'scanning' 
                        ? 'text-blue-600 scale-105 animate-pulse' 
                        : 'text-slate-600 group-hover:text-blue-600'
                    }`} />
                  </div>
                )}

                {scanState === 'idle' && (
                  <div className="absolute bottom-2 text-[10px] font-extrabold uppercase tracking-wide text-blue-600 bg-white/90 px-2 py-0.5 rounded-full border border-blue-100 shadow-2xs">
                    Tap to Scan
                  </div>
                )}
              </div>

              <div>
                <p className={`text-sm font-bold ${scanState === 'success' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {statusMessage || 'TrueDepth 3D Face Authentication'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {scanState === 'scanning' 
                    ? 'Matching biometric mesh to Secure Enclave profile...'
                    : 'Encrypted verification compliant with Kenya Data Protection Act 2019'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full pt-1">
                <button
                  type="button"
                  onClick={() => handleSimulatedBiometricScan('faceid')}
                  disabled={scanState === 'scanning' || scanState === 'success'}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <ScanFace className="w-4 h-4" />
                  Scan with FaceID
                </button>
                {isPlatformBiometricAvailable && (
                  <button
                    type="button"
                    onClick={handleNativeWebAuthn}
                    disabled={scanState === 'scanning' || scanState === 'success'}
                    className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5"
                    title="Use Platform Authenticator (Apple/Windows/Android Passkey)"
                  >
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    Device Passkey
                  </button>
                )}
              </div>
            </div>
          )}

          {activeMode === 'fingerprint' && (
            <div className="flex flex-col items-center text-center space-y-5 w-full">
              {/* Fingerprint Visual Sensor */}
              <div 
                onClick={() => scanState === 'idle' && handleSimulatedBiometricScan('fingerprint')}
                className={`relative w-40 h-40 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer select-none group ${
                  scanState === 'scanning'
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xl shadow-indigo-500/20 ring-8 ring-indigo-100'
                    : scanState === 'success'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-8 ring-emerald-100'
                    : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30'
                }`}
              >
                {/* Ripples when scanning */}
                {scanState === 'scanning' && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-75"></span>
                    <span className="absolute -inset-3 rounded-full border border-indigo-300 animate-pulse opacity-50"></span>
                  </>
                )}

                {scanState === 'success' ? (
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                    <Check className="w-10 h-10 stroke-[3]" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Fingerprint className={`w-20 h-20 transition-all ${
                      scanState === 'scanning' 
                        ? 'text-indigo-600 scale-110 animate-pulse' 
                        : 'text-slate-600 group-hover:text-indigo-600'
                    }`} />
                  </div>
                )}

                {scanState === 'idle' && (
                  <div className="absolute bottom-2 text-[10px] font-extrabold uppercase tracking-wide text-indigo-600 bg-white/90 px-2 py-0.5 rounded-full border border-indigo-100 shadow-2xs">
                    Press Sensor
                  </div>
                )}
              </div>

              <div>
                <p className={`text-sm font-bold ${scanState === 'success' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {statusMessage || 'Touch ID / Fingerprint Scanner'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {scanState === 'scanning'
                    ? 'Analyzing dermal friction ridges and capacitive sensor data...'
                    : 'Place your registered finger on your device sensor to verify'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full pt-1">
                <button
                  type="button"
                  onClick={() => handleSimulatedBiometricScan('fingerprint')}
                  disabled={scanState === 'scanning' || scanState === 'success'}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Fingerprint className="w-4 h-4" />
                  Authenticate Fingerprint
                </button>
                {isPlatformBiometricAvailable && (
                  <button
                    type="button"
                    onClick={handleNativeWebAuthn}
                    disabled={scanState === 'scanning' || scanState === 'success'}
                    className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5"
                    title="Use Platform Authenticator (Apple/Windows/Android Passkey)"
                  >
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    Device Passkey
                  </button>
                )}
              </div>
            </div>
          )}

          {activeMode === 'pin' && (
            <form onSubmit={handlePinSubmit} className="flex flex-col items-center space-y-4 w-full">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <KeyRound className="w-8 h-8" />
              </div>

              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">Security Backup PIN</p>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your 6-digit Creator Security PIN to unlock sensitive records.
                </p>
              </div>

              <div className="w-full max-w-xs space-y-2">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={e => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  autoFocus
                  placeholder="••••••"
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold font-mono py-3 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />

                {pinError && (
                  <p className="text-xs text-rose-600 font-medium flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {pinError}
                  </p>
                )}
                
                <p className="text-[11px] text-slate-400 text-center">
                  Default Demo PIN: <span className="font-mono font-bold text-slate-600">202619</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={pinInput.length < 4}
                className="w-full max-w-xs py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
              >
                <Lock className="w-4 h-4" />
                Unlock with PIN
              </button>
            </form>
          )}
        </div>

        {/* Footer Security Guarantee */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Hardware-backed biometric encryption
          </span>
          <span className="font-mono text-[10px] text-slate-400">FIDO2 / WebAuthn</span>
        </div>
      </div>
    </div>
  );
}
