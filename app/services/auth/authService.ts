import { SupabaseAuth, appConfig } from '@dumpsack/shared-utils';
import { Keypair } from '@solana/web3.js';

import type { AuthProvider } from './authStore';
import { SecureStorage } from './secureStorage';

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
        // TODO: Implement Apple OAuth with Supabase
        throw new Error('Apple sign-in not yet implemented with Supabase');
      case 'x':
        // TODO: Implement Twitter/X OAuth with Supabase
        throw new Error('X sign-in not yet implemented with Supabase');
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

  static async signInWithEmail(email: string): Promise<void> {
    const redirectTo = appConfig.supabase.authRedirect || '';

    await SupabaseAuth.signInWithEmailMagicLink(email, redirectTo);
  }

  static async generateZkLoginKeypair(userId: string): Promise<Keypair> {
    // TODO: Implement proper zkLogin derivation
    // For now, generate a random keypair seeded by userId
    const seed = new TextEncoder().encode(userId);
    // Simple hash for demo; use proper zkLogin in production
    const hash = await crypto.subtle.digest('SHA-256', seed);
    const hashArray = new Uint8Array(hash);
    return Keypair.fromSeed(hashArray.slice(0, 32));
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