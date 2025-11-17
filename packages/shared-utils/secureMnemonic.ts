/**
 * Secure Mnemonic Storage
 * 
 * Encrypts mnemonic phrases with user-provided passphrase using PBKDF2 + AES-GCM.
 * Never stores mnemonics in plaintext.
 * 
 * Format: { version: 1, salt: base64, iv: base64, ciphertext: base64 }
 */

export interface EncryptedMnemonic {
  version: 1;
  salt: string; // base64
  iv: string; // base64
  ciphertext: string; // base64
}

const PBKDF2_ITERATIONS = 100000;
const AES_KEY_LENGTH = 256;
const AES_MODE = 'AES-GCM';

/**
 * Encrypt a mnemonic with a user passphrase
 */
export async function encryptMnemonic(
  mnemonic: string,
  passphrase: string
): Promise<EncryptedMnemonic> {
  const encoder = new TextEncoder();

  // Generate random salt
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  // Derive key from passphrase
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: AES_MODE, length: AES_KEY_LENGTH },
    false,
    ['encrypt']
  );

  // Generate random IV
  const iv = new Uint8Array(12); // 96-bit IV for GCM
  crypto.getRandomValues(iv);

  // Encrypt mnemonic
  const encryptedData = await crypto.subtle.encrypt(
    { name: AES_MODE, iv: iv },
    key,
    encoder.encode(mnemonic)
  );

  return {
    version: 1,
    salt: uint8ArrayToBase64(salt),
    iv: uint8ArrayToBase64(iv),
    ciphertext: uint8ArrayToBase64(new Uint8Array(encryptedData)),
  };
}

/**
 * Decrypt a mnemonic with a user passphrase
 */
export async function decryptMnemonic(
  encrypted: EncryptedMnemonic,
  passphrase: string
): Promise<string> {
  if (encrypted.version !== 1) {
    throw new Error('Unsupported encrypted mnemonic version');
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Parse encrypted data
  const salt = base64ToUint8Array(encrypted.salt);
  const iv = base64ToUint8Array(encrypted.iv);
  const ciphertext = base64ToUint8Array(encrypted.ciphertext);

  // Derive key from passphrase
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: AES_MODE, length: AES_KEY_LENGTH },
    false,
    ['decrypt']
  );

  // Decrypt mnemonic
  try {
    const decryptedData = await crypto.subtle.decrypt(
      { name: AES_MODE, iv: iv },
      key,
      ciphertext
    );

    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error('Incorrect passphrase or corrupted data');
  }
}

/**
 * Verify if a passphrase is correct by attempting decryption
 */
export async function verifyPassphrase(
  encrypted: EncryptedMnemonic,
  passphrase: string
): Promise<boolean> {
  try {
    await decryptMnemonic(encrypted, passphrase);
    return true;
  } catch {
    return false;
  }
}

// Helper functions
function uint8ArrayToBase64(array: Uint8Array): string {
  const chunks = [];
  const chunkSize = 1024;

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
  }

  return btoa(chunks.join(''));
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

