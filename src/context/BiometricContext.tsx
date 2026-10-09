import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { BiometricCredential, BiometricAuditLog, BiometricSettings, BiometricType } from '../types/biometrics';
import { checkPlatformAuthenticatorAvailable } from '../utils/webauthn';

interface BiometricPromptConfig {
  isOpen: boolean;
  reason: string;
  target: 'KRA' | 'KECOBO' | 'TAX_ESTIMATES' | 'PDF_EXPORT' | 'SYSTEM';
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface BiometricContextValue {
  isUnlocked: boolean;
  isBiometricsEnabled: boolean;
  settings: BiometricSettings;
  credentials: BiometricCredential[];
  auditLogs: BiometricAuditLog[];
  isPlatformBiometricAvailable: boolean;
  promptConfig: BiometricPromptConfig;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  lockVault: () => void;
  unlockVault: (method: BiometricType | 'PIN') => void;
  triggerBiometricAuth: (options: {
    reason: string;
    target: 'KRA' | 'KECOBO' | 'TAX_ESTIMATES' | 'PDF_EXPORT' | 'SYSTEM';
  }) => Promise<boolean>;
  closePrompt: () => void;
  updateSettings: (newSettings: Partial<BiometricSettings>) => void;
  registerCredential: (name: string, type: BiometricType) => void;
  deleteCredential: (id: string) => void;
  maskKraPin: (pin: string) => string;
  maskIdNumber: (id: string) => string;
  maskCurrency: (amount: number | string) => string;
  addAuditLog: (log: Omit<BiometricAuditLog, 'id' | 'timestamp'>) => void;
}

const DEFAULT_SETTINGS: BiometricSettings = {
  isEnabled: true,
  primaryBiometric: 'faceid',
  autoLockMinutes: 5,
  lockOnVisibilityChange: false,
  maskKraPin: true,
  maskIdNumber: true,
  maskFinancials: false, // subtle privacy toggle
  requireAuthForPdfExport: true,
  requireAuthForEtimsTransmission: true,
  requireAuthForIpSubmission: true,
  backupPin: '202619',
};

const INITIAL_CREDENTIALS: BiometricCredential[] = [
  {
    id: 'cred-primary',
    name: 'Secure Enclave Biometrics (FaceID / Touch ID)',
    type: 'faceid',
    created: '2026-02-14T09:12:00.000Z',
    lastUsed: '2026-10-09T03:30:00.000Z',
    authenticatorAttachment: 'platform'
  },
  {
    id: 'cred-touch',
    name: 'Integrated Fingerprint Scanner',
    type: 'fingerprint',
    created: '2026-02-14T09:15:00.000Z',
    lastUsed: '2026-10-08T18:45:00.000Z',
    authenticatorAttachment: 'platform'
  }
];

const INITIAL_LOGS: BiometricAuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-09T02:55:10.000Z',
    action: 'Verified FaceID for KRA PIN disclosure',
    target: 'KRA',
    biometricType: 'faceid',
    status: 'SUCCESS',
    details: 'Unlocked sensitive PIN: P051829471Z'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-08T18:45:22.000Z',
    action: 'Authorized KECOBO NRR Certificate access',
    target: 'KECOBO',
    biometricType: 'fingerprint',
    status: 'SUCCESS',
    details: 'Verified National ID 29384722'
  }
];

const BiometricContext = createContext<BiometricContextValue | null>(null);

export const BiometricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('cc_bio_unlocked');
    return saved !== null ? saved === 'true' : false; // starts locked for security
  });

  const [settings, setSettings] = useState<BiometricSettings>(() => {
    const saved = localStorage.getItem('cc_bio_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [credentials, setCredentials] = useState<BiometricCredential[]>(() => {
    const saved = localStorage.getItem('cc_bio_credentials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CREDENTIALS;
      }
    }
    return INITIAL_CREDENTIALS;
  });

  const [auditLogs, setAuditLogs] = useState<BiometricAuditLog[]>(() => {
    const saved = localStorage.getItem('cc_bio_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_LOGS;
      }
    }
    return INITIAL_LOGS;
  });

  const [isPlatformBiometricAvailable, setIsPlatformBiometricAvailable] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [promptConfig, setPromptConfig] = useState<BiometricPromptConfig>({
    isOpen: false,
    reason: 'Authenticate to access sensitive KRA / KECOBO records',
    target: 'SYSTEM',
  });

  // Reference for promise resolution in triggerBiometricAuth
  const authPromiseResolver = useRef<((value: boolean) => void) | null>(null);
  const autoLockTimer = useRef<any>(null);

  useEffect(() => {
    checkPlatformAuthenticatorAvailable().then(avail => {
      setIsPlatformBiometricAvailable(avail);
    });
  }, []);

  // Save changes
  useEffect(() => {
    localStorage.setItem('cc_bio_unlocked', String(isUnlocked));
  }, [isUnlocked]);

  useEffect(() => {
    localStorage.setItem('cc_bio_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('cc_bio_credentials', JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem('cc_bio_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = useCallback((log: Omit<BiometricAuditLog, 'id' | 'timestamp'>) => {
    const newLog: BiometricAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]); // keep last 50
  }, []);

  const lockVault = useCallback(() => {
    setIsUnlocked(false);
    if (autoLockTimer.current) {
      clearTimeout(autoLockTimer.current);
    }
  }, []);

  const resetAutoLockTimer = useCallback(() => {
    if (autoLockTimer.current) {
      clearTimeout(autoLockTimer.current);
    }
    if (settings.isEnabled && settings.autoLockMinutes > 0 && isUnlocked) {
      autoLockTimer.current = setTimeout(() => {
        setIsUnlocked(false);
        addAuditLog({
          action: 'Auto-locked vault due to session inactivity',
          target: 'SYSTEM',
          biometricType: 'PIN',
          status: 'SUCCESS',
          details: `Inactivity timeout reached (${settings.autoLockMinutes} mins)`
        });
      }, settings.autoLockMinutes * 60 * 1000);
    }
  }, [settings.isEnabled, settings.autoLockMinutes, isUnlocked, addAuditLog]);

  // Activity listeners to reset auto-lock
  useEffect(() => {
    if (!isUnlocked || !settings.isEnabled || settings.autoLockMinutes <= 0) return;

    resetAutoLockTimer();
    const handleActivity = () => resetAutoLockTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    };
  }, [isUnlocked, settings.isEnabled, settings.autoLockMinutes, resetAutoLockTimer]);

  // Lock on tab visibility change if enabled
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && settings.lockOnVisibilityChange && isUnlocked) {
        lockVault();
        addAuditLog({
          action: 'Vault locked on background switch',
          target: 'SYSTEM',
          biometricType: 'PIN',
          status: 'SUCCESS'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings.lockOnVisibilityChange, isUnlocked, lockVault, addAuditLog]);

  const unlockVault = useCallback((method: BiometricType | 'PIN') => {
    setIsUnlocked(true);
    resetAutoLockTimer();
  }, [resetAutoLockTimer]);

  const triggerBiometricAuth = useCallback((options: {
    reason: string;
    target: 'KRA' | 'KECOBO' | 'TAX_ESTIMATES' | 'PDF_EXPORT' | 'SYSTEM';
  }): Promise<boolean> => {
    if (!settings.isEnabled) {
      return Promise.resolve(true);
    }

    // If already unlocked and target is not high-priority submission requiring re-confirmation
    if (isUnlocked && options.target !== 'PDF_EXPORT' && options.target !== 'KRA' && options.target !== 'KECOBO') {
      return Promise.resolve(true);
    }

    return new Promise<boolean>((resolve) => {
      authPromiseResolver.current = resolve;
      setPromptConfig({
        isOpen: true,
        reason: options.reason,
        target: options.target,
      });
    });
  }, [settings.isEnabled, isUnlocked]);

  const closePrompt = useCallback(() => {
    setPromptConfig(prev => ({ ...prev, isOpen: false }));
    if (authPromiseResolver.current) {
      authPromiseResolver.current(false);
      authPromiseResolver.current = null;
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<BiometricSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const registerCredential = useCallback((name: string, type: BiometricType) => {
    const newCred: BiometricCredential = {
      id: `cred-${Date.now()}`,
      name,
      type,
      created: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      authenticatorAttachment: 'platform'
    };
    setCredentials(prev => [newCred, ...prev]);
    addAuditLog({
      action: `Enrolled new biometric authenticator: ${name}`,
      target: 'SYSTEM',
      biometricType: type,
      status: 'SUCCESS'
    });
  }, [addAuditLog]);

  const deleteCredential = useCallback((id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
    addAuditLog({
      action: `Revoked biometric authenticator credential`,
      target: 'SYSTEM',
      biometricType: 'PIN',
      status: 'SUCCESS'
    });
  }, [addAuditLog]);

  // Masking helpers
  const maskKraPin = useCallback((pin: string): string => {
    if (!settings.isEnabled || !settings.maskKraPin || isUnlocked) {
      return pin || 'P051829471Z';
    }
    if (!pin) return 'P051••••••72Z';
    if (pin.length <= 4) return '••••••';
    return `${pin.slice(0, 4)}••••••${pin.slice(-3)}`;
  }, [settings.isEnabled, settings.maskKraPin, isUnlocked]);

  const maskIdNumber = useCallback((id: string): string => {
    if (!settings.isEnabled || !settings.maskIdNumber || isUnlocked) {
      return id || '29384722';
    }
    if (!id) return '••••••••';
    if (id.length <= 3) return '••••••';
    return `${id.slice(0, 2)}••••${id.slice(-2)}`;
  }, [settings.isEnabled, settings.maskIdNumber, isUnlocked]);

  const maskCurrency = useCallback((amount: number | string): string => {
    if (!settings.isEnabled || !settings.maskFinancials || isUnlocked) {
      if (typeof amount === 'number') {
        return `KES ${amount.toLocaleString()}`;
      }
      return String(amount);
    }
    return 'KES ••••••';
  }, [settings.isEnabled, settings.maskFinancials, isUnlocked]);

  return (
    <BiometricContext.Provider
      value={{
        isUnlocked,
        isBiometricsEnabled: settings.isEnabled,
        settings,
        credentials,
        auditLogs,
        isPlatformBiometricAvailable,
        promptConfig,
        isSettingsOpen,
        setIsSettingsOpen,
        lockVault,
        unlockVault,
        triggerBiometricAuth,
        closePrompt,
        updateSettings,
        registerCredential,
        deleteCredential,
        maskKraPin,
        maskIdNumber,
        maskCurrency,
        addAuditLog,
      }}
    >
      {children}
    </BiometricContext.Provider>
  );
};

export function useBiometrics(): BiometricContextValue {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometrics must be used within a BiometricProvider');
  }
  return context;
}
