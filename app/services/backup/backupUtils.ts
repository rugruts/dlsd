import { BackupPayloadV1, PassphraseValidationResult } from './backupTypes';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256; // 256 bits for AES-GCM

export async function deriveKeyFromPassphrase(passphrase: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  // Import passphrase as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Fixed salt for deterministic derivation
  const salt = encoder.encode('DumpSackBackupSalt');

  // Derive key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

export async function computeChecksum(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function validatePassphraseStrength(passphrase: string): PassphraseValidationResult {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (passphrase.length < 8) {
    errors.push('Passphrase must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(passphrase)) {
    errors.push('Passphrase must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(passphrase)) {
    errors.push('Passphrase must contain at least one lowercase letter');
  }

  if (!/\d/.test(passphrase)) {
    errors.push('Passphrase must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passphrase)) {
    errors.push('Passphrase must contain at least one special character');
  }

  if (errors.length === 0) {
    if (passphrase.length >= 16 && /\d/.test(passphrase) && /[A-Z]/.test(passphrase) && /[a-z]/.test(passphrase)) {
      strength = 'strong';
    } else if (passphrase.length >= 12) {
      strength = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
}

export function sanitizeBackupFilename(publicKey: string, timestamp: number): string {
  const shortKey = publicKey.slice(0, 8);
  const date = new Date(timestamp).toISOString().split('T')[0];
  return `dumpsack-backup-${shortKey}-${date}.json`;
}

export function validateBackupPayload(payload: any): payload is BackupPayloadV1 {
  if (!payload || typeof payload !== 'object') return false;

  return (
    payload.version === 1 &&
    typeof payload.createdAt === 'number' &&
    typeof payload.publicKey === 'string' &&
    typeof payload.encryptedData === 'string' &&
    typeof payload.salt === 'string' &&
    typeof payload.iv === 'string' &&
    typeof payload.checksum === 'string'
  );
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}