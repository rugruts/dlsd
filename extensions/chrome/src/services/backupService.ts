import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { BackupCrypto } from '../../../../packages/shared-utils';
import { WalletBackup, BackupKeyMaterial, FirestoreBackupDocument } from '../../../../packages/shared-types';

// TODO: Initialize Firebase app - this should be done once in the extension
// const firebaseConfig = { ... };
// const app = initializeApp(firebaseConfig);
const db = getFirestore(); // Assume initialized elsewhere

export class ExtensionBackupService {
  private userId: string;
  private userSecret: string;

  constructor(userId: string) {
    this.userId = userId;
    this.userSecret = BackupCrypto.generateUserSecret(userId);
  }

  /**
   * Check if backup exists for restoration
   */
  async hasBackup(): Promise<boolean> {
    try {
      const encryptedBackup = await this.fetchBackup();
      return encryptedBackup !== null;
    } catch {
      return false;
    }
  }

  /**
   * Fetch encrypted backup from Firestore
   */
  private async fetchBackup(): Promise<string | null> {
    try {
      const docRef = doc(db, 'userWalletBackups', this.userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreBackupDocument;
        return data.encryptedBackup;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch backup:', error);
      throw new Error('Backup fetch failed');
    }
  }

  /**
   * Decrypt and restore backup for extension initialization
   */
  async restoreBackup(): Promise<BackupKeyMaterial> {
    try {
      const encryptedBackup = await this.fetchBackup();
      if (!encryptedBackup) {
        throw new Error('No backup found');
      }

      // Decode from base64
      const combinedData = BackupCrypto.base64ToUint8Array(encryptedBackup);

      // Extract salt, iv, and encrypted data
      const salt = combinedData.slice(0, 16); // 16 bytes salt
      const iv = combinedData.slice(16, 28); // 12 bytes IV
      const encryptedData = combinedData.slice(28);

      // Derive decryption key
      const decryptionKey = await BackupCrypto.deriveBackupKey(this.userSecret, salt);

      // Decrypt the data
      const decryptedBytes = await BackupCrypto.decryptData(decryptionKey, encryptedData, iv);

      // Parse JSON
      const keyDataString = new TextDecoder().decode(decryptedBytes);
      const keyMaterial: BackupKeyMaterial = JSON.parse(keyDataString);

      return keyMaterial;

    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw new Error('Backup restoration failed');
    }
  }

  /**
   * Upload backup from extension (sync changes back to cloud)
   * This is typically called when extension wallet state changes
   */
  async syncBackup(keyMaterial: BackupKeyMaterial): Promise<void> {
    try {
      // Serialize key material to JSON
      const keyData = JSON.stringify(keyMaterial);
      const dataBytes = new TextEncoder().encode(keyData);

      // Generate salt for this backup
      const salt = BackupCrypto.generateSalt();

      // Derive encryption key
      const encryptionKey = await BackupCrypto.deriveBackupKey(this.userSecret, salt);

      // Encrypt the data
      const { encryptedData, iv } = await BackupCrypto.encryptData(encryptionKey, dataBytes);

      // Combine salt + iv + encrypted data
      const combinedData = new Uint8Array(salt.length + iv.length + encryptedData.length);
      combinedData.set(salt, 0);
      combinedData.set(iv, salt.length);
      combinedData.set(encryptedData, salt.length + iv.length);

      // Convert to base64 for storage
      const encryptedBackup = BackupCrypto.uint8ArrayToBase64(combinedData);

      // Update backup document
      const backupDoc: Omit<FirestoreBackupDocument, 'userId'> = {
        encryptedBackup,
        updatedAt: new Date(),
        version: 1,
      };

      // Upload to Firestore
      const docRef = doc(db, 'userWalletBackups', this.userId);
      await setDoc(docRef, backupDoc);

    } catch (error) {
      console.error('Failed to sync backup:', error);
      throw new Error('Backup sync failed');
    }
  }

  /**
   * Get backup metadata without decrypting
   */
  async getBackupMetadata(): Promise<{ exists: boolean; updatedAt?: Date; version?: number }> {
    try {
      const docRef = doc(db, 'userWalletBackups', this.userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreBackupDocument;
        return {
          exists: true,
          updatedAt: data.updatedAt,
          version: data.version,
        };
      }

      return { exists: false };
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