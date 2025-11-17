import { getSupabase, appConfig, BackupCrypto } from '@dumpsack/shared-utils';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type {
  BackupPayloadV1,
  BackupDecryptedBundle,
  CloudBackupDocument,
  BackupValidationResult
} from './backupTypes';
import {
  deriveKeyFromPassphrase,
  computeChecksum,
  validateBackupPayload,
  base64ToUint8Array,
  uint8ArrayToBase64
} from './backupUtils';

const BACKUP_VERSION = 1;

export class BackupService {

  async createLocalBackup(passphrase: string): Promise<BackupPayloadV1> {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    // Get wallet data (this would come from walletService)
    const walletData = await this.getWalletData();
    const publicKey = walletData.publicKey;

    // Derive encryption key from passphrase
    const encryptionKey = await deriveKeyFromPassphrase(passphrase);

    // Serialize wallet data
    const dataString = JSON.stringify(walletData);
    const dataBytes = new TextEncoder().encode(dataString);

    // Generate salt
    const salt = BackupCrypto.generateSalt();

    // Encrypt the data (IV is generated automatically)
    const { encryptedData, iv } = await BackupCrypto.encryptData(encryptionKey, dataBytes);

    // Convert to base64 for storage
    const encryptedDataB64 = uint8ArrayToBase64(encryptedData);
    const saltB64 = uint8ArrayToBase64(salt);
    const ivB64 = uint8ArrayToBase64(iv);

    // Compute checksum
    const checksum = await computeChecksum(encryptedData);

    const payload: BackupPayloadV1 = {
      version: BACKUP_VERSION,
      createdAt: Date.now(),
      publicKey,
      encryptedData: encryptedDataB64,
      salt: saltB64,
      iv: ivB64,
      checksum,
    };

    return payload;
  }

  async importLocalBackup(fileUri: string, passphrase: string): Promise<BackupDecryptedBundle> {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    // Read backup file
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    const payload: BackupPayloadV1 = JSON.parse(fileContent);

    // Validate backup
    const validation = await this.validateBackupIntegrity(payload);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid backup file');
    }

    // Derive decryption key
    const decryptionKey = await deriveKeyFromPassphrase(passphrase);

    // Decrypt the data
    const encryptedData = base64ToUint8Array(payload.encryptedData);
    const iv = base64ToUint8Array(payload.iv);

    const decryptedBytes = await BackupCrypto.decryptData(decryptionKey, encryptedData, iv);
    const decryptedString = new TextDecoder().decode(decryptedBytes);
    const walletData = JSON.parse(decryptedString);

    // Restore wallet (this would call walletService.restoreWallet)
    await this.restoreWalletData(walletData);

    return {
      privateKeyBundle: walletData.privateKeyBundle,
      publicKey: payload.publicKey,
      createdAt: payload.createdAt,
    };
  }

  async uploadBackupToCloud(payload: BackupPayloadV1): Promise<void> {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    const userId = await this.getCurrentUserId();
    const supabase = getSupabase();

    // Create the backup document
    const cloudDoc: CloudBackupDocument = {
      payload,
      metadata: {
        version: payload.version,
        createdAt: payload.createdAt,
        publicKey: payload.publicKey,
        checksum: payload.checksum,
      },
      updatedAt: Date.now(),
    };

    // Upload to Supabase Storage bucket 'backups'
    const filePath = `${userId}/backup.json`;
    const jsonString = JSON.stringify(cloudDoc);

    const { error } = await supabase.storage
      .from('backups')
      .upload(filePath, jsonString, {
        upsert: true,
        contentType: 'application/json',
      });

    if (error) {
      console.error('Failed to upload backup to cloud:', error);
      throw new Error('Failed to upload backup to cloud');
    }
  }

  async downloadBackupFromCloud(): Promise<BackupPayloadV1 | null> {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    const userId = await this.getCurrentUserId();
    const supabase = getSupabase();

    const filePath = `${userId}/backup.json`;

    const { data, error } = await supabase.storage
      .from('backups')
      .download(filePath);

    if (error) {
      if (error.message.includes('not found')) {
        return null; // No backup exists
      }
      console.error('Failed to download backup from cloud:', error);
      throw new Error('Failed to download backup from cloud');
    }

    if (!data) {
      return null;
    }

    // Parse the JSON from the blob
    // In React Native, Blob doesn't have .text() method, so we need to convert it
    const reader = new FileReader();
    const jsonString = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(data as Blob);
    });
    const cloudDoc: CloudBackupDocument = JSON.parse(jsonString);

    return cloudDoc.payload;
  }

  async deleteCloudBackup(): Promise<void> {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    const userId = await this.getCurrentUserId();
    const supabase = getSupabase();

    const filePath = `${userId}/backup.json`;

    const { error } = await supabase.storage
      .from('backups')
      .remove([filePath]);

    if (error) {
      console.error('Failed to delete backup from cloud:', error);
      throw new Error('Failed to delete backup from cloud');
    }
  }

  async validateBackupIntegrity(payload: unknown): Promise<BackupValidationResult> {
    if (!validateBackupPayload(payload)) {
      return { isValid: false, error: 'Invalid backup format' };
    }

    // Type guard passed, now we can safely cast
    const validPayload = payload as BackupPayloadV1;

    if (validPayload.version !== BACKUP_VERSION) {
      return {
        isValid: false,
        error: `Unsupported backup version: ${validPayload.version}`,
        version: validPayload.version,
      };
    }

    // Verify checksum
    const encryptedData = base64ToUint8Array(validPayload.encryptedData);
    const computedChecksum = await computeChecksum(encryptedData);

    if (computedChecksum !== validPayload.checksum) {
      return { isValid: false, error: 'Backup checksum verification failed' };
    }

    return { isValid: true, version: validPayload.version };
  }

  async exportBackupToFile(payload: BackupPayloadV1): Promise<string> {
    const filename = `dumpsack-backup-${payload.publicKey.slice(0, 8)}-${new Date(payload.createdAt).toISOString().split('T')[0]}.json`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
    const fileUri = `${docDir}${filename}`;

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));
    return fileUri;
  }

  async shareBackupFile(fileUri: string): Promise<void> {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error('Sharing is not available on this device');
    }
  }

  private async getWalletData(): Promise<{
    publicKey: string;
    privateKeyBundle: string;
    metadata: { createdAt: number; version: string };
  }> {
    // This would integrate with walletService to get the current wallet data
    // For now, return mock data
    return {
      publicKey: '11111111111111111111111111111112',
      privateKeyBundle: 'mock-private-key-data',
      metadata: {
        createdAt: Date.now(),
        version: '1.0.0',
      },
    };
  }

  private async restoreWalletData(walletData: unknown): Promise<void> {
    // This would integrate with walletService to restore the wallet
    // For now, just log
    console.log('Restoring wallet data:', walletData);
  }

  private async getCurrentUserId(): Promise<string> {
    // This would get the current user ID from auth store
    // For now, return a mock ID
    return 'mock-user-id';
  }

  /**
   * Create backup (alias for createLocalBackup + uploadBackupToCloud)
   */
  async createBackup(keyMaterial: unknown): Promise<void> {
    // For now, use a default passphrase derived from key material
    const passphrase = JSON.stringify(keyMaterial);
    const payload = await this.createLocalBackup(passphrase);
    await this.uploadBackupToCloud(payload);
  }

  /**
   * Update backup (alias for createBackup)
   */
  async updateBackup(keyMaterial: unknown): Promise<void> {
    await this.createBackup(keyMaterial);
  }

  /**
   * Check if backup exists
   */
  async hasBackup(): Promise<boolean> {
    const payload = await this.downloadBackupFromCloud();
    return payload !== null;
  }

  /**
   * Restore backup (alias for downloadBackupFromCloud)
   */
  async restoreBackup(): Promise<BackupPayloadV1 | null> {
    const payload = await this.downloadBackupFromCloud();
    if (!payload) {
      throw new Error('No backup found');
    }
    // Return the payload as key material
    return payload;
  }

  /**
   * Delete backup (alias for deleteCloudBackup)
   */
  async deleteBackup(): Promise<void> {
    await this.deleteCloudBackup();
  }
}

// Export singleton instance
export const backupService = new BackupService();