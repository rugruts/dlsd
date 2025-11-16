import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@dumpsack/shared-utils';
import { appConfig } from '@dumpsack/shared-utils';
import { BackupCrypto } from '@dumpsack/shared-utils';
import {
  BackupPayloadV1,
  BackupMetadata,
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
  private db = db;

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

    // Generate salt and IV
    const salt = BackupCrypto.generateSalt();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM

    // Encrypt the data
    const { encryptedData } = await BackupCrypto.encryptData(encryptionKey, dataBytes, iv);

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
    const metadata: BackupMetadata = {
      version: payload.version,
      createdAt: payload.createdAt,
      publicKey: payload.publicKey,
      checksum: payload.checksum,
    };

    const cloudDoc: CloudBackupDocument = {
      payload,
      metadata,
      updatedAt: Date.now(),
    };

    const docRef = doc(this.db, 'backups', userId);
    await setDoc(docRef, cloudDoc);
  }

  async downloadBackupFromCloud(): Promise<BackupPayloadV1 | null> {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    const userId = await this.getCurrentUserId();
    const docRef = doc(this.db, 'backups', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data() as CloudBackupDocument;
    return data.payload;
  }

  async deleteCloudBackup(): Promise<void> {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    const userId = await this.getCurrentUserId();
    const docRef = doc(this.db, 'backups', userId);
    await deleteDoc(docRef);
  }

  async validateBackupIntegrity(payload: any): Promise<BackupValidationResult> {
    if (!validateBackupPayload(payload)) {
      return { isValid: false, error: 'Invalid backup format' };
    }

    if (payload.version !== BACKUP_VERSION) {
      return {
        isValid: false,
        error: `Unsupported backup version: ${payload.version}`,
        version: payload.version,
      };
    }

    // Verify checksum
    const encryptedData = base64ToUint8Array(payload.encryptedData);
    const computedChecksum = await computeChecksum(encryptedData);

    if (computedChecksum !== payload.checksum) {
      return { isValid: false, error: 'Backup checksum verification failed' };
    }

    return { isValid: true, version: payload.version };
  }

  async exportBackupToFile(payload: BackupPayloadV1): Promise<string> {
    const filename = `dumpsack-backup-${payload.publicKey.slice(0, 8)}-${new Date(payload.createdAt).toISOString().split('T')[0]}.json`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

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

  private async getWalletData(): Promise<any> {
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

  private async restoreWalletData(walletData: any): Promise<void> {
    // This would integrate with walletService to restore the wallet
    // For now, just log
    console.log('Restoring wallet data:', walletData);
  }

  private async getCurrentUserId(): Promise<string> {
    // This would get the current user ID from auth store
    // For now, return a mock ID
    return 'mock-user-id';
  }
}

// Export singleton instance
export const backupService = new BackupService();