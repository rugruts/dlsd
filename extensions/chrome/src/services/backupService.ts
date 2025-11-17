import type { BackupKeyMaterial } from '../../../../packages/shared-types';
import { BackupCrypto, getSupabase } from '../../../../packages/shared-utils';

/**
 * Extension Backup Service
 *
 * SECURITY: This service requires a user passphrase for all backup operations.
 * No UID-derived secrets are used. The passphrase must be provided by the user
 * for both backup creation and restoration.
 */
export class ExtensionBackupService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Check if backup exists for restoration
   */
  async hasBackup(): Promise<boolean> {
    try {
      const backupPayload = await this.fetchBackup();
      return backupPayload !== null;
    } catch {
      return false;
    }
  }

  /**
   * Fetch encrypted backup payload from Supabase Storage
   * Returns the full backup payload with salt, IV, and encrypted data
   */
  private async fetchBackup(): Promise<{
    version: number;
    createdAt: number;
    publicKey: string;
    encryptedData: string;
    salt: string;
    iv: string;
    checksum: string;
  } | null> {
    try {
      const supabase = getSupabase();
      const filePath = `${this.userId}/backup.json`;

      const { data, error } = await supabase.storage
        .from('backups')
        .download(filePath);

      if (error) {
        if (error.message.includes('not found')) {
          return null; // No backup exists
        }
        console.error('Failed to fetch backup:', error);
        throw new Error('Backup fetch failed');
      }

      if (!data) {
        return null;
      }

      // Parse the JSON from the blob
      const jsonString = await data.text();
      const backupDoc = JSON.parse(jsonString);

      // Return the full payload (includes salt, iv, encryptedData, checksum)
      return backupDoc.payload || null;
    } catch (error) {
      console.error('Failed to fetch backup:', error);
      throw new Error('Backup fetch failed');
    }
  }

  /**
   * Decrypt and restore backup for extension initialization
   *
   * @param passphrase - User passphrase for decryption (REQUIRED)
   * @returns Decrypted backup key material
   * @throws Error if passphrase is wrong or backup is corrupted
   */
  async restoreBackup(passphrase: string): Promise<BackupKeyMaterial> {
    if (!passphrase) {
      throw new Error('Passphrase is required for backup restoration');
    }

    try {
      const backupPayload = await this.fetchBackup();
      if (!backupPayload) {
        throw new Error('No backup found');
      }

      // Extract components from payload
      const salt = BackupCrypto.base64ToUint8Array(backupPayload.salt);
      const iv = BackupCrypto.base64ToUint8Array(backupPayload.iv);
      const encryptedData = BackupCrypto.base64ToUint8Array(backupPayload.encryptedData);

      // Derive decryption key from user passphrase
      const decryptionKey = await BackupCrypto.deriveBackupKey(passphrase, salt);

      // Decrypt the data
      const decryptedBytes = await BackupCrypto.decryptData(decryptionKey, encryptedData, iv);

      // Verify checksum if present
      if (backupPayload.checksum) {
        const computedChecksum = await this.computeChecksum(encryptedData);
        if (computedChecksum !== backupPayload.checksum) {
          throw new Error('Backup integrity check failed - data may be corrupted');
        }
      }

      // Parse JSON
      const keyDataString = new TextDecoder().decode(decryptedBytes);
      const keyMaterial: BackupKeyMaterial = JSON.parse(keyDataString);

      return keyMaterial;

    } catch (error) {
      if (error instanceof Error && error.message.includes('OperationError')) {
        throw new Error('Wrong passphrase - decryption failed');
      }
      console.error('Failed to restore backup:', error);
      throw new Error('Backup restoration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Upload backup from extension (sync changes back to cloud)
   *
   * @param keyMaterial - Wallet key material to backup
   * @param passphrase - User passphrase for encryption (REQUIRED)
   * @throws Error if passphrase is empty or upload fails
   */
  async syncBackup(keyMaterial: BackupKeyMaterial, passphrase: string): Promise<void> {
    if (!passphrase) {
      throw new Error('Passphrase is required for backup creation');
    }

    try {
      // Serialize key material to JSON
      const keyData = JSON.stringify(keyMaterial);
      const dataBytes = new TextEncoder().encode(keyData);

      // Generate salt for this backup
      const salt = BackupCrypto.generateSalt();

      // Derive encryption key from user passphrase
      const encryptionKey = await BackupCrypto.deriveBackupKey(passphrase, salt);

      // Encrypt the data (IV is generated automatically)
      const { encryptedData, iv } = await BackupCrypto.encryptData(encryptionKey, dataBytes);

      // Compute checksum
      const checksum = await this.computeChecksum(encryptedData);

      // Create backup payload
      const payload = {
        version: 1,
        createdAt: Date.now(),
        publicKey: keyMaterial.publicKey,
        encryptedData: BackupCrypto.uint8ArrayToBase64(encryptedData),
        salt: BackupCrypto.uint8ArrayToBase64(salt),
        iv: BackupCrypto.uint8ArrayToBase64(iv),
        checksum,
      };

      // Create backup document
      const backupDoc = {
        payload,
        metadata: {
          version: payload.version,
          createdAt: payload.createdAt,
          publicKey: payload.publicKey,
          checksum: payload.checksum,
        },
        updatedAt: Date.now(),
      };

      // Upload to Supabase Storage
      const supabase = getSupabase();
      const filePath = `${this.userId}/backup.json`;
      const jsonString = JSON.stringify(backupDoc);

      const { error } = await supabase.storage
        .from('backups')
        .upload(filePath, jsonString, {
          upsert: true,
          contentType: 'application/json',
        });

      if (error) {
        console.error('Failed to sync backup:', error);
        throw new Error('Backup sync failed');
      }
    } catch (error) {
      console.error('Failed to sync backup:', error);
      throw new Error('Backup sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Compute SHA-256 checksum of data
   */
  private async computeChecksum(data: Uint8Array): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hashBuffer = await crypto.subtle.digest('SHA-256', data as any);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get backup metadata without decrypting
   */
  async getBackupMetadata(): Promise<{ exists: boolean; updatedAt?: Date; version?: number }> {
    try {
      const supabase = getSupabase();
      const filePath = `${this.userId}/backup.json`;

      const { data, error } = await supabase.storage
        .from('backups')
        .download(filePath);

      if (error) {
        if (error.message.includes('not found')) {
          return { exists: false };
        }
        console.error('Failed to get backup metadata:', error);
        return { exists: false };
      }

      if (!data) {
        return { exists: false };
      }

      // Parse the JSON from the blob
      const jsonString = await data.text();
      const backupDoc = JSON.parse(jsonString);

      return {
        exists: true,
        updatedAt: backupDoc.updatedAt ? new Date(backupDoc.updatedAt) : undefined,
        version: backupDoc.version,
      };
    } catch (error) {
      console.error('Failed to get backup metadata:', error);
      return { exists: false };
    }
  }
}

// Factory function to create backup service for extension
export function createExtensionBackupService(userId: string): ExtensionBackupService {
  return new ExtensionBackupService(userId);
}