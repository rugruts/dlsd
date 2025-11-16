import * as SecureStore from 'expo-secure-store';

const WALLET_KEY = 'dumpsack_wallet_key';
const USER_ID_KEY = 'dumpsack_user_id';

/**
 * Securely store encrypted private key material
 */
export async function savePrivateKey(encryptedKeyMaterial: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(WALLET_KEY, encryptedKeyMaterial, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } catch (error) {
    console.error('Failed to save private key:', error);
    throw new Error('Failed to securely store wallet key');
  }
}

/**
 * Load encrypted private key material
 */
export async function loadPrivateKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(WALLET_KEY);
  } catch (error) {
    console.error('Failed to load private key:', error);
    return null;
  }
}

/**
 * Clear stored private key material
 */
export async function clearPrivateKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(WALLET_KEY);
  } catch (error) {
    console.error('Failed to clear private key:', error);
    // Don't throw here as it's cleanup
  }
}

/**
 * Save user ID for session restoration
 */
export async function saveUserId(userId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_ID_KEY, userId, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } catch (error) {
    console.error('Failed to save user ID:', error);
    throw new Error('Failed to store user session');
  }
}

/**
 * Load user ID for session restoration
 */
export async function loadUserId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(USER_ID_KEY);
  } catch (error) {
    console.error('Failed to load user ID:', error);
    return null;
  }
}

/**
 * Clear stored user ID
 */
export async function clearUserId(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_ID_KEY);
  } catch (error) {
    console.error('Failed to clear user ID:', error);
    // Don't throw here as it's cleanup
  }
}

/**
 * Clear all secure storage
 */
export async function clearAllSecureData(): Promise<void> {
  await Promise.all([
    clearPrivateKey(),
    clearUserId(),
  ]);
}