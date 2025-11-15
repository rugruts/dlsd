import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut } from 'firebase/auth';
import { Keypair } from '@solana/web3.js';
import { SecureStorage } from './secureStorage';
import { AuthProvider } from './authStore';

// TODO: Add Firebase config from env
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export class AuthService {
  static async signInWithProvider(providerType: AuthProvider): Promise<{ userId: string; keypair: Keypair }> {
    let provider;
    switch (providerType) {
      case 'google':
        provider = new GoogleAuthProvider();
        break;
      case 'apple':
        provider = new OAuthProvider('apple.com');
        break;
      case 'x':
        provider = new OAuthProvider('twitter.com');
        break;
      default:
        throw new Error('Unsupported provider');
    }

    const result = await signInWithPopup(auth, provider);
    const userId = result.user.uid;

    // Generate zkLogin wallet keypair
    const keypair = await this.generateZkLoginKeypair(userId);

    // Store encrypted private key
    await SecureStorage.storeSecureItem(`wallet-${userId}`, keypair.secretKey.toString());

    return { userId, keypair };
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
    await signOut(auth);
  }

  static async getStoredKeypair(userId: string): Promise<Keypair | null> {
    const secretKeyStr = await SecureStorage.getSecureItem(`wallet-${userId}`);
    if (!secretKeyStr) return null;
    const secretKey = new Uint8Array(secretKeyStr.split(',').map(Number));
    return Keypair.fromSecretKey(secretKey);
  }
}