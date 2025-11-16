import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '@dumpsack/shared-utils';
import { BackupCrypto } from '@dumpsack/shared-utils';
import { loadPrivateKey } from '../auth/secureStorage';

export interface BackupData {
  encryptedPrivateKey: string;
  publicKey: string;
  userId: string;
  alias?: string;
}

const BACKUP_COLLECTION = 'userBackups';

/**
 * Create encrypted backup of wallet data
 */
export async function createBackup(userId: string, publicKey: string, alias?: string): Promise<void> {
  try {
    const encryptedPrivateKey = await loadPrivateKey();
    if (!encryptedPrivateKey) {
      throw new Error('No wallet data to backup');
    }

    const backupData: BackupData = {
      encryptedPrivateKey,
      publicKey,
      userId,
      alias,
    };

    // Serialize and encrypt the backup data
    const dataString = JSON.stringify(backupData);
    const dataBytes = new TextEncoder().encode(dataString);

    // Generate salt for this backup
    const salt = BackupCrypto.generateSalt();

    // Derive encryption key from user ID (deterministic)
    const userSecret = BackupCrypto.generateUserSecret(userId);
    const encryptionKey = await BackupCrypto.deriveBackupKey(userSecret, salt);

    // Encrypt the data
    const { encryptedData, iv } = await BackupCrypto.encryptData(encryptionKey, dataBytes);

    // Combine salt + iv + encrypted data
    const combinedData = new Uint8Array(salt.length + iv.length + encryptedData.length);
    combinedData.set(salt, 0);
    combinedData.set(iv, salt.length);
    combinedData.set(encryptedData, salt.length + iv.length);

    // Convert to base64 for storage
    const encryptedBackup = BackupCrypto.uint8ArrayToBase64(combinedData);

    const db = await firebaseConfig.getFirestore();
    const backupDoc = {
      encryptedBackup,
      userId,
      createdAt: new Date(),
      version: 1,
    };

    await setDoc(doc(db, BACKUP_COLLECTION, userId), backupDoc);
  } catch (error) {
    console.error('Failed to create backup:', error);
    throw new Error('Backup creation failed');
  }
}

/**
 * Restore wallet data from backup
 */
export async function restoreBackup(userId: string): Promise<BackupData> {
  try {
    const db = await firebaseConfig.getFirestore();
    const docRef = doc(db, BACKUP_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('No backup found');
    }

    const data = docSnap.data();
    const encryptedBackup = data.encryptedBackup as string;

    // Decode from base64
    const combinedData = BackupCrypto.base64ToUint8Array(encryptedBackup);

    // Extract salt, iv, and encrypted data
    const salt = combinedData.slice(0, 16);
    const iv = combinedData.slice(16, 28);
    const encryptedData = combinedData.slice(28);

    // Derive decryption key
    const userSecret = BackupCrypto.generateUserSecret(userId);
    const decryptionKey = await BackupCrypto.deriveBackupKey(userSecret, salt);

    // Decrypt the data
    const decryptedBytes = await BackupCrypto.decryptData(decryptionKey, encryptedData, iv);

    // Parse JSON
    const dataString = new TextDecoder().decode(decryptedBytes);
    const backupData: BackupData = JSON.parse(dataString);

    return backupData;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    throw new Error('Backup restoration failed');
  }
}

/**
 * Check if backup exists
 */
export async function hasBackup(userId: string): Promise<boolean> {
  try {
    const db = await firebaseConfig.getFirestore();
    const docRef = doc(db, BACKUP_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Failed to check backup:', error);
    return false;
  }
}