/**
 * WebAuthn (Passkey / Platform Biometrics) Utility
 * Supports FaceID, Touch ID, Windows Hello, and Android Biometrics
 */

export async function checkPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  ) {
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  return false;
}

export async function requestNativeBiometricAuth(options?: {
  challengeText?: string;
  rpName?: string;
  userName?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn not supported by this browser.' };
  }

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Attempt navigator.credentials.get with a generic assertion
    // Note: If no prior credential registered, we create or query
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname
      }
    });

    if (credential) {
      return { success: true };
    }
    return { success: false, error: 'Biometric verification cancelled.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Biometric verification unavailable' };
  }
}

export async function registerNativeBiometricCredential(userName: string = 'Creator Kenya'): Promise<{ success: boolean; credentialId?: string; error?: string }> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn not supported.' };
  }

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'CreatorCompliance Kenya',
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: userName,
          displayName: userName
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      }
    });

    if (credential && 'id' in credential) {
      return { success: true, credentialId: credential.id };
    }
    return { success: false, error: 'Registration cancelled.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Enrollment failed.' };
  }
}
