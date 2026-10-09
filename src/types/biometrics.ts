export type BiometricType = 'faceid' | 'fingerprint' | 'passkey';

export interface BiometricCredential {
  id: string;
  name: string;
  type: BiometricType;
  created: string;
  lastUsed?: string;
  authenticatorAttachment: 'platform' | 'cross-platform';
}

export interface BiometricAuditLog {
  id: string;
  timestamp: string;
  action: string;
  target: 'KRA' | 'KECOBO' | 'TAX_ESTIMATES' | 'PDF_EXPORT' | 'SYSTEM';
  biometricType: BiometricType | 'PIN';
  status: 'SUCCESS' | 'FAILED';
  details?: string;
}

export interface BiometricSettings {
  isEnabled: boolean;
  primaryBiometric: BiometricType;
  autoLockMinutes: number; // 0 = immediate on tab switch, 2, 5, 15
  lockOnVisibilityChange: boolean;
  maskKraPin: boolean;
  maskIdNumber: boolean;
  maskFinancials: boolean;
  requireAuthForPdfExport: boolean;
  requireAuthForEtimsTransmission: boolean;
  requireAuthForIpSubmission: boolean;
  backupPin: string;
}
