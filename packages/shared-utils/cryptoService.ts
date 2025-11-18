/**
 * Crypto Service - Encryption/Decryption utilities
 * 
 * Provides PBKDF2 + AES-GCM encryption for wallet data.
 * Works in both browser (Web Crypto API) and React Native (crypto.subtle polyfill).
 */

const PBKDF2_ITERATIONS = 100000;
const AES_KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // 96-bit IV for GCM

/**
 * Hash data using SHA-256
 */
export async function hashSha256(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return new Uint8Array(hashBuffer);
}

/**
 * Generate a random salt
 */
export function generateSalt(): Uint8Array {
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Derive an encryption key from a password using PBKDF2
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-GCM key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(
  key: CryptoKey,
  data: string
): Promise<{ encryptedData: Uint8Array; iv: Uint8Array }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate random IV
  const iv = new Uint8Array(IV_LENGTH);
  crypto.getRandomValues(iv);

  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataBuffer
  );

  return {
    encryptedData: new Uint8Array(encryptedBuffer),
    iv,
  };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(
  key: CryptoKey,
  encryptedData: Uint8Array,
  iv: Uint8Array
): Promise<string> {
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(array: Uint8Array): string {
  const chunks: string[] = [];
  const chunkSize = 1024;

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunks.push(String.fromCharCode(...Array.from(chunk)));
  }

  return btoa(chunks.join(''));
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Encrypted blob format for storage
 */
export interface EncryptedBlob {
  version: number;
  salt: string; // base64
  iv: string; // base64
  data: string; // base64
}

/**
 * Encrypt a mnemonic with a password
 */
export async function encryptMnemonic(
  mnemonic: string,
  password: string
): Promise<EncryptedBlob> {
  const salt = generateSalt();
  const key = await deriveKeyFromPassword(password, salt);
  const { encryptedData, iv } = await encryptData(key, mnemonic);

  return {
    version: 1,
    salt: uint8ArrayToBase64(salt),
    iv: uint8ArrayToBase64(iv),
    data: uint8ArrayToBase64(encryptedData),
  };
}

/**
 * Decrypt a mnemonic with a password
 */
export async function decryptMnemonic(
  blob: EncryptedBlob,
  password: string
): Promise<string> {
  const salt = base64ToUint8Array(blob.salt);
  const iv = base64ToUint8Array(blob.iv);
  const encryptedData = base64ToUint8Array(blob.data);

  const key = await deriveKeyFromPassword(password, salt);
  const mnemonic = await decryptData(key, encryptedData, iv);

  return mnemonic;
}

