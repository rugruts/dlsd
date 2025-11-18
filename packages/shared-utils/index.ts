export type Environment = 'development' | 'staging' | 'production';

export interface RpcConfig {
  primary: string;
  fallback?: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
  timeoutMs: number;
  maxRetries: number;
}

export interface SwapConfig {
  aggregatorUrl: string;
  apiKey?: string;
  enabled: boolean;
}

export interface OnRampConfig {
  moonpay: { enabled: boolean; apiKey?: string; baseUrl: string };
  ramp: { enabled: boolean; apiKey?: string; baseUrl: string };
  transak: { enabled: boolean; apiKey?: string; baseUrl: string };
}

export interface FeatureFlags {
  enableThroneLinks: boolean;
  enableRugRadar: boolean;
  enableStaking: boolean;
  enableSwaps: boolean;
  enableOnRamp: boolean;
  enableBackup: boolean;
  enableBiometrics: boolean;
  enableNotifications: boolean;
  enablePanicBunker: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  authRedirect?: string;
  deepLinkScheme?: string;
}

export interface DumpSackConfig {
  env: Environment;
  rpc: RpcConfig;
  swap: SwapConfig;
  onRamp: OnRampConfig;
  features: FeatureFlags;
  authProvider: 'supabase' | 'firebase';
  supabase: SupabaseConfig;
}

function getFromImportMeta(key: string): string | undefined {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
  } catch {}
  return undefined;
}

function getFromProcessEnv(key: string): string | undefined {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch {}
  return undefined;
}

function readEnv(key: string): string | undefined {
  return getFromProcessEnv(key) ?? getFromImportMeta(key);
}

function readBool(keys: string[], defaultValue: boolean, mode: 'truthy' | 'explicitTrue' | 'explicitFalseIsOff' = 'truthy'): boolean {
  for (const k of keys) {
    const v = readEnv(k);
    if (v === undefined) continue;
    if (mode === 'explicitTrue') return v.toLowerCase() === 'true';
    if (mode === 'explicitFalseIsOff') return v.toLowerCase() !== 'false';
    return !!JSON.parse(String(v).toLowerCase().replace(/'/g, '"').replace(/(?!true|false)\b(\d+)\b/g, '"$1"'));
  }
  return defaultValue;
}

function readString(keys: string[], fallback?: string): string | undefined {
  for (const k of keys) {
    const v = readEnv(k);
    if (v !== undefined && v !== '') return v;
  }
  return fallback;
}

class ConfigManager {
  private static instance: ConfigManager;
  private config!: DumpSackConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) ConfigManager.instance = new ConfigManager();
    return ConfigManager.instance;
  }

  private detectEnvironment(): Environment {
    const raw = readEnv('NODE_ENV') ?? readEnv('EXPO_PUBLIC_ENV') ?? readEnv('VITE_ENV') ?? 'development';
    switch (String(raw).toLowerCase()) {
      case 'production':
      case 'prod':
        return 'production';
      case 'staging':
      case 'stage':
        return 'staging';
      default:
        return 'development';
    }
  }

  private loadConfig(): DumpSackConfig {
    const env = this.detectEnvironment();
    const base: DumpSackConfig = {
      env,
      rpc: {
        primary: 'https://rpc.gorbagana.wtf/',
        fallback: undefined,
        commitment: 'confirmed',
        timeoutMs: 30000,
        maxRetries: 3,
      },
      swap: {
        aggregatorUrl: 'https://api.jup.ag',
        enabled: true,
      },
      onRamp: {
        moonpay: { enabled: false, baseUrl: 'https://api.moonpay.com' },
        ramp: { enabled: false, baseUrl: 'https://api.ramp.network' },
        transak: { enabled: false, baseUrl: 'https://api.transak.com' },
      },
      features: {
        enableThroneLinks: true,
        enableRugRadar: false,
        enableStaking: false,
        enableSwaps: true,
        enableOnRamp: false,
        enableBackup: true,
        enableBiometrics: true,
        enableNotifications: true,
        enablePanicBunker: true,
      },
      authProvider: 'supabase',
      supabase: {
        url: '',
        anonKey: '',
        authRedirect: undefined,
        deepLinkScheme: undefined,
      },
    };

    const cfg = { ...base };

    cfg.rpc.primary = readString(['EXPO_PUBLIC_GBA_RPC_PRIMARY', 'VITE_GBA_RPC_PRIMARY'], cfg.rpc.primary) ?? cfg.rpc.primary;
    cfg.rpc.fallback = readString(['EXPO_PUBLIC_GBA_RPC_FALLBACK', 'VITE_GBA_RPC_FALLBACK'], cfg.rpc.fallback);

    cfg.swap.aggregatorUrl = readString(['EXPO_PUBLIC_SWAP_AGGREGATOR_URL', 'VITE_SWAP_AGGREGATOR_URL'], cfg.swap.aggregatorUrl) ?? cfg.swap.aggregatorUrl;
    cfg.swap.apiKey = readString(['EXPO_PUBLIC_SWAP_API_KEY', 'VITE_SWAP_API_KEY']);

    cfg.onRamp.moonpay.enabled = readBool(['EXPO_PUBLIC_MOONPAY_ENABLED', 'VITE_MOONPAY_ENABLED'], cfg.onRamp.moonpay.enabled, 'explicitTrue');
    cfg.onRamp.moonpay.apiKey = readString(['EXPO_PUBLIC_MOONPAY_API_KEY', 'VITE_MOONPAY_API_KEY']);

    cfg.onRamp.ramp.enabled = readBool(['EXPO_PUBLIC_RAMP_ENABLED', 'VITE_RAMP_ENABLED'], cfg.onRamp.ramp.enabled, 'explicitTrue');
    cfg.onRamp.ramp.apiKey = readString(['EXPO_PUBLIC_RAMP_API_KEY', 'VITE_RAMP_API_KEY']);

    cfg.onRamp.transak.enabled = readBool(['EXPO_PUBLIC_TRANSAK_ENABLED', 'VITE_TRANSAK_ENABLED'], cfg.onRamp.transak.enabled, 'explicitTrue');
    cfg.onRamp.transak.apiKey = readString(['EXPO_PUBLIC_TRANSAK_API_KEY', 'VITE_TRANSAK_API_KEY']);

    cfg.features.enableThroneLinks = readBool(['EXPO_PUBLIC_ENABLE_THRONE_LINKS', 'VITE_ENABLE_THRONE_LINKS'], cfg.features.enableThroneLinks, 'explicitFalseIsOff');
    cfg.features.enableRugRadar = readBool(['EXPO_PUBLIC_ENABLE_RUG_RADAR', 'VITE_ENABLE_RUG_RADAR'], cfg.features.enableRugRadar, 'explicitTrue');
    cfg.features.enableStaking = readBool(['EXPO_PUBLIC_ENABLE_STAKING', 'VITE_ENABLE_STAKING'], cfg.features.enableStaking, 'explicitTrue');
    cfg.features.enableSwaps = readBool(['EXPO_PUBLIC_ENABLE_SWAPS', 'VITE_ENABLE_SWAPS'], cfg.features.enableSwaps, 'explicitFalseIsOff');
    cfg.features.enableOnRamp = readBool(['EXPO_PUBLIC_ENABLE_ON_RAMP', 'VITE_ENABLE_ON_RAMP'], cfg.features.enableOnRamp, 'explicitTrue');
    cfg.features.enableBackup = readBool(['EXPO_PUBLIC_ENABLE_BACKUP', 'VITE_ENABLE_BACKUP'], cfg.features.enableBackup, 'explicitFalseIsOff');
    cfg.features.enableBiometrics = readBool(['EXPO_PUBLIC_ENABLE_BIOMETRICS', 'VITE_ENABLE_BIOMETRICS'], cfg.features.enableBiometrics, 'explicitFalseIsOff');
    cfg.features.enableNotifications = readBool(['EXPO_PUBLIC_ENABLE_NOTIFICATIONS', 'VITE_ENABLE_NOTIFICATIONS'], cfg.features.enableNotifications, 'explicitFalseIsOff');

    // Supabase configuration
    const authProvider = readString(['EXPO_PUBLIC_AUTH_PROVIDER', 'VITE_AUTH_PROVIDER'], 'supabase');
    cfg.authProvider = (authProvider === 'firebase' ? 'firebase' : 'supabase') as 'supabase' | 'firebase';

    cfg.supabase.url = readString(['EXPO_PUBLIC_SB_URL', 'VITE_SB_URL'], '') ?? '';
    cfg.supabase.anonKey = readString(['EXPO_PUBLIC_SB_ANON_KEY', 'VITE_SB_ANON_KEY'], '') ?? '';
    cfg.supabase.authRedirect = readString(['EXPO_PUBLIC_AUTH_REDIRECT', 'VITE_AUTH_REDIRECT']);
    cfg.supabase.deepLinkScheme = readString(['EXPO_PUBLIC_DEEP_LINK_SCHEME']);

    return cfg;
  }

  getConfig(): DumpSackConfig { return { ...this.config }; }
  getEnvironment(): Environment { return this.config.env; }
  isDevelopment(): boolean { return this.config.env === 'development'; }
  isStaging(): boolean { return this.config.env === 'staging'; }
  isProduction(): boolean { return this.config.env === 'production'; }

  getRpcConfig(): RpcConfig { return { ...this.config.rpc }; }
  getSwapConfig(): SwapConfig { return { ...this.config.swap }; }
  getOnRampConfig(): OnRampConfig { return { ...this.config.onRamp }; }
  getFeatureFlags(): FeatureFlags { return { ...this.config.features }; }
  getSupabaseConfig(): SupabaseConfig { return { ...this.config.supabase }; }
  getAuthProvider(): 'supabase' | 'firebase' { return this.config.authProvider; }

  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return !!this.config.features[feature];
  }
}

export const configManager = ConfigManager.getInstance();
export const appConfig = configManager.getConfig();
export const isDevelopment = () => configManager.isDevelopment();
export const isStaging = () => configManager.isStaging();
export const isProduction = () => configManager.isProduction();
export const isFeatureEnabled = (feature: keyof FeatureFlags) => configManager.isFeatureEnabled(feature);

// Export Supabase utilities
export { getSupabase, resetSupabase, type Database } from './supabase';
export * as SupabaseAuth from './authSupabase';

// Export OTP and Password authentication
export {
  requestEmailOtp,
  verifyEmailOtp,
  verifyEmailOtpSignIn,
  signInWithPassword,
  setNewPassword,
  signOut,
} from './authOtp';
export type {
  OtpRequestResult,
  OtpVerifyResult,
  PasswordSignInResult,
  PasswordUpdateResult,
} from './authOtp';

// Export Auth State Machine
export {
  AuthStateMachine,
  AuthState,
  AuthEvent,
  getAuthStateMachine,
  resetAuthStateMachine,
} from './authStateMachine';
export type { AuthContext, AuthStateTransition } from './authStateMachine';

// Export Solana BIP39/BIP44 derivation utilities
export * as SolanaDerive from './solanaDerive';

// Export Gorbagana Program IDs (single source of truth)
export * from './config/gorbaganaPrograms';

// Export Swap/AMM configuration
export * from './config/swapConfig';

// Export Crypto Service (PBKDF2 + AES-GCM encryption)
export * as CryptoService from './cryptoService';

// Export Swap Module (provider-based swap architecture)
export * from './swap';

// Export Multi-Wallet utilities
export * from './multiWallet';

// Export Secure Mnemonic utilities
export * from './secureMnemonic';

// Export QR code utilities
export * from './qr';

// Export wallet avatar utilities
export * from './walletAvatar';

// Export i18n utilities (NOTE: i18next must be installed in consuming package)
// export { initI18n } from './i18n';
// export { default as i18n } from './i18n';

// Export Solana utilities
export * from './solana';

// Export Health utilities
export * from './health';

// Error classes and utilities
export {
  PanicBunkerLockedError,
  WalletLockedError,
  InsufficientFundsError,
  NetworkError,
  InvalidTransactionError,
  ErrorUtils,
  type UserError
} from './errors';

// Backup encryption utilities
export class BackupCrypto {
  private static readonly PBKDF2_ITERATIONS = 100000;
  private static readonly AES_KEY_LENGTH = 256;
  private static readonly AES_MODE = 'AES-GCM';

  /**
   * Generate a user-specific secret from user ID
   */
  static generateUserSecret(userId: string): string {
    // In production, this should use a more secure method
    // For now, create a deterministic secret from user ID
    const encoder = new TextEncoder();
    const data = encoder.encode(userId + '_backup_secret_salt');
    return this.uint8ArrayToBase64(data);
  }

  /**
   * Generate a random salt for key derivation
   */
  static generateSalt(): Uint8Array {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    return salt;
  }

  /**
   * Derive a backup encryption key from user secret and salt
   */
  static async deriveBackupKey(userSecret: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(userSecret),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.AES_MODE, length: this.AES_KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data with AES-GCM
   */
  static async encryptData(key: CryptoKey, data: Uint8Array): Promise<{ encryptedData: Uint8Array; iv: Uint8Array }> {
    const iv = new Uint8Array(12); // 96-bit IV for GCM
    crypto.getRandomValues(iv);

    const encryptedData = await crypto.subtle.encrypt(
      { name: this.AES_MODE, iv: iv },
      key,
      data
    );

    return {
      encryptedData: new Uint8Array(encryptedData),
      iv
    };
  }

  /**
   * Decrypt data with AES-GCM
   */
  static async decryptData(key: CryptoKey, encryptedData: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    const decryptedData = await crypto.subtle.decrypt(
      { name: this.AES_MODE, iv: iv },
      key,
      encryptedData
    );

    return new Uint8Array(decryptedData);
  }

  /**
   * Convert Uint8Array to base64 string
   */
  static uint8ArrayToBase64(array: Uint8Array): string {
    const chunks = [];
    const chunkSize = 1024;

    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
    }

    return btoa(chunks.join(''));
  }

  /**
   * Convert base64 string to Uint8Array
   */
  static base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  }
}