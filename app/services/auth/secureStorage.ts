import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY = 'dumpsack-encryption-key'; // TODO: Derive from device keychain

export class SecureStorage {
  static async encryptData(data: string): Promise<string> {
    // Simple encryption using a derived key
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      ENCRYPTION_KEY
    );
    // For simplicity, using base64 encoding; in production, use proper AES encryption
    return btoa(data); // TODO: Implement proper encryption
  }

  static async decryptData(encryptedData: string): Promise<string> {
    // TODO: Implement proper decryption
    return atob(encryptedData);
  }

  static async storeSecureItem(key: string, value: string): Promise<void> {
    const encryptedValue = await this.encryptData(value);
    await SecureStore.setItemAsync(key, encryptedValue);
  }

  static async getSecureItem(key: string): Promise<string | null> {
    const encryptedValue = await SecureStore.getItemAsync(key);
    if (!encryptedValue) return null;
    return this.decryptData(encryptedValue);
  }

  static async deleteSecureItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}