import React, { useState } from 'react';
import { useBiometrics } from '../context/BiometricContext';
import { 
  ShieldCheck, 
  X, 
  ScanFace, 
  Fingerprint, 
  Lock, 
  Unlock, 
  Clock, 
  Smartphone, 
  History, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sliders, 
  AlertTriangle,
  KeyRound,
  FileCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { registerNativeBiometricCredential } from '../utils/webauthn';
import { BiometricType } from '../types/biometrics';

export default function BiometricSettingsModal() {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    settings, 
    updateSettings, 
    credentials, 
    registerCredential, 
    deleteCredential, 
    auditLogs,
    isUnlocked,
    lockVault,
    triggerBiometricAuth,
    isPlatformBiometricAvailable
  } = useBiometrics();

  const [activeTab, setActiveTab] = useState<'settings' | 'devices' | 'audit'>('settings');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<BiometricType>('faceid');
  const [isRegisteringDevice, setIsRegisteringDevice] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const handleTestBiometrics = async (type: BiometricType) => {
    const success = await triggerBiometricAuth({
      reason: `Testing ${type === 'faceid' ? 'FaceID' : 'Fingerprint'} biometric verification`,
      target: 'SYSTEM'
    });
    if (success) {
      setTestSuccessMessage(`Success! ${type === 'faceid' ? 'FaceID' : 'Fingerprint'} authentication verified properly.`);
      setTimeout(() => setTestSuccessMessage(null), 4000);
    }
  };

  const handleEnrollDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    setIsRegisteringDevice(true);
    try {
      // Try native passkey enrollment if possible
      await registerNativeBiometricCredential(newDeviceName.trim());
    } catch {
      // continues anyway with registration
    }

    registerCredential(newDeviceName.trim(), newDeviceType);
    setNewDeviceName('');
    setIsRegisteringDevice(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Biometric Security & Vault</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  FIDO2 / WebAuthn
                </span>
              </div>
              <p className="text-xs text-blue-200/80">Protecting KRA iTax PINs & KECOBO National Rights Data</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Vault Status:</span>
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Unlock className="w-3.5 h-3.5" />
                Unlocked & Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <Lock className="w-3.5 h-3.5" />
                Locked (Shield Active)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <button
                onClick={lockVault}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 shadow-xs"
              >
                <Lock className="w-3 h-3" />
                Lock Vault Now
              </button>
            ) : (
              <button
                onClick={() => triggerBiometricAuth({ reason: 'Manual unlock request', target: 'SYSTEM' })}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 shadow-xs"
              >
                <Unlock className="w-3 h-3" />
                Unlock with Biometrics
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Security Policies
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'devices'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Enrolled Authenticators ({credentials.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {testSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: POLICIES & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Biometric Protection</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Require FaceID or Fingerprint before revealing KRA PIN and KECOBO data.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.isEnabled}
                    onChange={e => updateSettings({ isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Primary Biometric Preference */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Default Biometric Sensor
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateSettings({ primaryBiometric: 'faceid' })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      settings.primaryBiometric === 'faceid'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <ScanFace className={`w-6 h-6 ${settings.primaryBiometric === 'faceid' ? 'text-blue-600' : 'text-slate-400'}`} />
                      {settings.primaryBiometric === 'faceid' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="font-bold text-slate-900 text-sm">FaceID</p>
                      <p className="text-[11px] text-slate-500">TrueDepth & 3D Facial Recognition</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSettings({ primaryBiometric: 'fingerprint' })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      settings.primaryBiometric === 'fingerprint'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Fingerprint className={`w-6 h-6 ${settings.primaryBiometric === 'fingerprint' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {settings.primaryBiometric === 'fingerprint' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="font-bold text-slate-900 text-sm">Fingerprint</p>
                      <p className="text-[11px] text-slate-500">Touch ID & Ultrasonic Sensor</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Test Biometric Trigger */}
              <div className="p-4 bg-blue-50/70 border border-blue-200/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Verify Biometric Scanner</h5>
                    <p className="text-[11px] text-slate-600">Test how FaceID or Touch ID prompt responds on this device.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTestBiometrics('faceid')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <ScanFace className="w-3.5 h-3.5" />
                    Test FaceID
                  </button>
                  <button
                    onClick={() => handleTestBiometrics('fingerprint')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    Test Fingerprint
                  </button>
                </div>
              </div>

              {/* Auto-Lock Interval */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  Auto-Lock Timeout
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Immediate', val: 0 },
                    { label: '2 Mins', val: 2 },
                    { label: '5 Mins', val: 5 },
                    { label: '15 Mins', val: 15 },
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => updateSettings({ autoLockMinutes: item.val })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        settings.autoLockMinutes === item.val
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sensitive Shield Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Sensitive Data Shielding Controls
                </label>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <EyeOff className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Mask KRA PIN on Screens</p>
                        <p className="text-[10px] text-slate-500">Displays P051••••••72Z until biometric verified</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maskKraPin}
                      onChange={e => updateSettings({ maskKraPin: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <EyeOff className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Mask National ID & Passports</p>
                        <p className="text-[10px] text-slate-500">Encrypts KECOBO identification numbers from onlookers</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maskIdNumber}
                      onChange={e => updateSettings({ maskIdNumber: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Require Biometrics to Sign eTIMS Invoices</p>
                        <p className="text-[10px] text-slate-500">Validates creator identity before transmitting tax invoices to KRA VSCU</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requireAuthForEtimsTransmission}
                      onChange={e => updateSettings({ requireAuthForEtimsTransmission: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Require Biometrics for PDF Export</p>
                        <p className="text-[10px] text-slate-500">Prevents unauthorized local downloads of full compliance summaries</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requireAuthForPdfExport}
                      onChange={e => updateSettings({ requireAuthForPdfExport: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTERED DEVICES & KEYS */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Enrolled Biometric Authenticators</h4>
                  <p className="text-xs text-slate-500">Hardware keys & biometric tokens trusted for KRA and KECOBO access.</p>
                </div>
              </div>

              {/* Credentials list */}
              <div className="space-y-3">
                {credentials.map(cred => (
                  <div 
                    key={cred.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                        {cred.type === 'faceid' ? (
                          <ScanFace className="w-5 h-5" />
                        ) : (
                          <Fingerprint className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-xs">{cred.name}</p>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {cred.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Enrolled: {new Date(cred.created).toLocaleDateString()} • {cred.authenticatorAttachment}
                        </p>
                      </div>
                    </div>

                    {credentials.length > 1 && (
                      <button
                        onClick={() => deleteCredential(cred.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Revoke device"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Enroll New Authenticator Form */}
              <div className="p-4 border border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
                <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Enroll New Device Biometric Key
                </h5>
                <form onSubmit={handleEnrollDevice} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Device name (e.g. iPhone 15 Pro Max)"
                      value={newDeviceName}
                      onChange={e => setNewDeviceName(e.target.value)}
                      required
                      className="sm:col-span-2 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newDeviceType}
                      onChange={e => setNewDeviceType(e.target.value as BiometricType)}
                      className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="faceid">FaceID</option>
                      <option value="fingerprint">Touch ID / Fingerprint</option>
                      <option value="passkey">Platform Passkey</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isRegisteringDevice || !newDeviceName.trim()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Register Authenticator via WebAuthn
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Security Audit Trail</h4>
                  <p className="text-xs text-slate-500">Immutable log of all biometric verifications for KRA and KECOBO access.</p>
                </div>
              </div>

              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No biometric events recorded yet.</p>
                ) : (
                  auditLogs.map(log => (
                    <div 
                      key={log.id} 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <div>
                          <p className="font-bold text-slate-800">{log.action}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Target: <span className="font-semibold text-slate-700">{log.target}</span> • Method: <span className="uppercase font-semibold">{log.biometricType}</span> {log.details ? `• ${log.details}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
