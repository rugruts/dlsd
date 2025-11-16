export interface BackupPayloadV1 {
  version: 1;
  createdAt: number;
  publicKey: string;
  encryptedData: string; // base64 encoded AES-GCM ciphertext
  salt: string; // base64 encoded salt
  iv: string; // base64 encoded initialization vector
  checksum: string; // sha256 hash of encryptedData
}

export interface BackupMetadata {
  version: number;
  createdAt: number;
  publicKey: string;
  checksum: string;
}

export interface BackupDecryptedBundle {
  privateKeyBundle: any; // The decrypted wallet private keys
  publicKey: string;
  createdAt: number;
}

export interface CloudBackupDocument {
  payload: BackupPayloadV1;
  metadata: BackupMetadata;
  updatedAt: number;
}

export interface BackupValidationResult {
  isValid: boolean;
  error?: string;
  version?: number;
}

export interface PassphraseValidationResult {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
}