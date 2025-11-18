import { SupabaseAuth, appConfig, CryptoService } from '@dumpsack/shared-utils';
import { Keypair } from '@solana/web3.js';
import { Alert } from 'react-native';

import type { AuthProvider } from './authStore';
import { SecureStorage } from './secureStorage';

// Get zkLogin salt from environment
const ZKLOGIN_SALT = process.env.EXPO_PUBLIC_ZKLOGIN_SALT || 'default_salt_change_in_production';

export class AuthService {
  static async signInWithProvider(providerType: AuthProvider): Promise<{ userId: string; keypair: Keypair }> {
    let redirectTo: string | undefined;

    // Get redirect URL from config
    if (appConfig.supabase.authRedirect) {
      redirectTo = appConfig.supabase.authRedirect;
    }

    switch (providerType) {
      case 'google':
        await SupabaseAuth.signInWithGoogle(redirectTo);
        break;
      case 'apple':
        // Apple OAuth - Coming Soon
        Alert.alert(
          'Coming Soon',
          'Apple sign-in will be available in a future update.'
        );
        throw new Error('Apple sign-in not yet implemented');
      case 'x':
        // Twitter/X OAuth - Coming Soon
        Alert.alert(
          'Coming Soon',
          'X (Twitter) sign-in will be available in a future update.'
        );
        throw new Error('X sign-in not yet implemented');
      default:
        throw new Error('Unsupported provider');
    }

    // Wait for auth state to be established
    const session = await SupabaseAuth.getSession();
    if (!session) {
      throw new Error('Failed to establish session after sign-in');
    }

    const userId = session.user.id;

    // Generate zkLogin wallet keypair
    const keypair = await this.generateZkLoginKeypair(userId);

    // Store encrypted private key
    await SecureStorage.storeSecureItem(`wallet-${userId}`, keypair.secretKey.toString());

    return { userId, keypair };
  }

  /**
   * Send email OTP for login
   */
  static async signInWithEmail(email: string): Promise<void> {
    const redirectTo = appConfig.supabase.authRedirect || '';
    await SupabaseAuth.signInWithEmailMagicLink(email, redirectTo);
  }

  /**
   * Get current user ID
   */
  static async getCurrentUserId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.id || null;
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    await this.signOutUser();
  }

  /**
   * Generate deterministic seedless wallet keypair from user ID
   *
   * Uses SHA-256(userId + salt) to create a deterministic 32-byte seed.
   * This allows the same wallet to be recovered on any device after login.
   */
  static async generateZkLoginKeypair(userId: string): Promise<Keypair> {
    // Deterministic seed derivation: SHA-256(userId + salt)
    const seedInput = userId + ZKLOGIN_SALT;
    const seedHash = await CryptoService.hashSha256(seedInput);

    // Use first 32 bytes as seed for keypair
    const seed = seedHash.slice(0, 32);

    return Keypair.fromSeed(seed);
  }

  static async signOutUser(): Promise<void> {
    await SupabaseAuth.signOut();
  }

  static async getCurrentUser() {
    return await SupabaseAuth.currentUser();
  }

  static async getSession() {
    return await SupabaseAuth.getSession();
  }

  static onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return SupabaseAuth.onAuthStateChange(callback);
  }

  static async getStoredKeypair(userId: string): Promise<Keypair | null> {
    const secretKeyStr = await SecureStorage.getSecureItem(`wallet-${userId}`);
    if (!secretKeyStr) return null;
    const secretKey = new Uint8Array(secretKeyStr.split(',').map(Number));
    return Keypair.fromSecretKey(secretKey);
  }
}