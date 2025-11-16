import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { appConfig } from '@dumpsack/shared-utils';
import { PanicState, EmergencySweepParams, EmergencySweepResult, PanicUnlockResult, PanicLockResult } from '../types/panicBunker';
import { buildTransferTx, sendSignedTx } from './blockchain/transactionService';

const STORAGE_KEYS = {
  PANIC_STATE: 'panic_bunker_state',
  SAFE_ADDRESS: 'panic_safe_address',
  AUTO_LOCK: 'panic_auto_lock_enabled',
};

export class PanicService {
  private static instance: PanicService;
  private panicState: PanicState = {
    locked: false,
    safeAddress: undefined,
    lockedAt: undefined,
    autoLockEnabled: true,
    lastUnlockedAt: undefined,
  };

  private constructor() {}

  static getInstance(): PanicService {
    if (!PanicService.instance) {
      PanicService.instance = new PanicService();
    }
    return PanicService.instance;
  }

  async loadPanicState(): Promise<PanicState> {
    if (!appConfig.features.enablePanicBunker) {
      return this.panicState;
    }

    try {
      const [stateStr, safeAddress, autoLockStr] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.PANIC_STATE),
        SecureStore.getItemAsync(STORAGE_KEYS.SAFE_ADDRESS),
        SecureStore.getItemAsync(STORAGE_KEYS.AUTO_LOCK),
      ]);

      if (stateStr) {
        const savedState = JSON.parse(stateStr);
        this.panicState = {
          ...this.panicState,
          ...savedState,
          safeAddress: safeAddress || undefined,
          autoLockEnabled: autoLockStr === 'true',
        };
      } else {
        this.panicState.safeAddress = safeAddress || undefined;
        this.panicState.autoLockEnabled = autoLockStr !== 'false'; // default true
      }
    } catch (error) {
      console.warn('Failed to load panic state:', error);
    }

    return this.panicState;
  }

  async savePanicState(): Promise<void> {
    if (!appConfig.features.enablePanicBunker) return;

    try {
      const stateToSave = {
        locked: this.panicState.locked,
        lockedAt: this.panicState.lockedAt,
        lastUnlockedAt: this.panicState.lastUnlockedAt,
      };

      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.PANIC_STATE, JSON.stringify(stateToSave)),
        this.panicState.safeAddress
          ? SecureStore.setItemAsync(STORAGE_KEYS.SAFE_ADDRESS, this.panicState.safeAddress)
          : SecureStore.deleteItemAsync(STORAGE_KEYS.SAFE_ADDRESS),
        SecureStore.setItemAsync(STORAGE_KEYS.AUTO_LOCK, this.panicState.autoLockEnabled.toString()),
      ]);
    } catch (error) {
      console.error('Failed to save panic state:', error);
      throw error;
    }
  }

  async lockWallet(): Promise<PanicLockResult> {
    if (!appConfig.features.enablePanicBunker) {
      throw new Error('Panic Bunker feature is not enabled');
    }

    this.panicState.locked = true;
    this.panicState.lockedAt = Date.now();

    try {
      await this.savePanicState();
      return {
        success: true,
        lockedAt: this.panicState.lockedAt,
      };
    } catch (error) {
      this.panicState.locked = false;
      this.panicState.lockedAt = undefined;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to lock wallet',
      };
    }
  }

  async unlockWalletWithBiometrics(): Promise<PanicUnlockResult> {
    if (!appConfig.features.enablePanicBunker) {
      throw new Error('Panic Bunker feature is not enabled');
    }

    try {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Wallet',
        fallbackLabel: 'Use Passphrase',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        this.panicState.locked = false;
        this.panicState.lastUnlockedAt = Date.now();
        await this.savePanicState();

        return {
          success: true,
          method: 'biometric',
        };
      } else {
        return {
          success: false,
          method: 'biometric',
          error: 'Biometric authentication failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        method: 'biometric',
        error: error instanceof Error ? error.message : 'Biometric authentication error',
      };
    }
  }

  async unlockWalletWithPassphrase(passphrase: string): Promise<PanicUnlockResult> {
    if (!appConfig.features.enablePanicBunker) {
      throw new Error('Panic Bunker feature is not enabled');
    }

    // For now, use a simple passphrase check
    // In production, this should verify against a stored hash
    const storedPassphrase = await SecureStore.getItemAsync('panic_passphrase');
    if (!storedPassphrase || passphrase !== storedPassphrase) {
      return {
        success: false,
        method: 'passphrase',
        error: 'Invalid passphrase',
      };
    }

    this.panicState.locked = false;
    this.panicState.lastUnlockedAt = Date.now();
    await this.savePanicState();

    return {
      success: true,
      method: 'passphrase',
    };
  }

  async setSafeAddress(address: string): Promise<void> {
    if (!appConfig.features.enablePanicBunker) return;

    // Basic validation - should be a valid Solana address
    if (!address || address.length !== 44) {
      throw new Error('Invalid safe address');
    }

    this.panicState.safeAddress = address;
    await this.savePanicState();
  }

  async setAutoLockEnabled(enabled: boolean): Promise<void> {
    if (!appConfig.features.enablePanicBunker) return;

    this.panicState.autoLockEnabled = enabled;
    await this.savePanicState();
  }

  async triggerEmergencySweep(params: EmergencySweepParams): Promise<EmergencySweepResult> {
    if (!appConfig.features.enablePanicBunker) {
      throw new Error('Panic Bunker feature is not enabled');
    }

    if (!params.safeAddress) {
      throw new Error('Safe address not configured');
    }

    // This would integrate with walletService to get current balance and keys
    // For now, return a mock result
    const mockResult: EmergencySweepResult = {
      signature: 'mock-signature',
      sweptAmount: 1000000, // 1 GOR in lamports
      fee: 5000, // 0.000005 GOR
      tokenSweeps: params.includeTokens ? [
        {
          mint: 'mock-token-mint',
          amount: 1000,
          signature: 'mock-token-sig',
        },
      ] : undefined,
    };

    return mockResult;
  }

  isLocked(): boolean {
    return this.panicState.locked;
  }

  getPanicState(): PanicState {
    return { ...this.panicState };
  }

  async setPassphrase(passphrase: string): Promise<void> {
    if (!appConfig.features.enablePanicBunker) return;

    // In production, this should hash the passphrase
    await SecureStore.setItemAsync('panic_passphrase', passphrase);
  }
}

// Export singleton instance
export const panicService = PanicService.getInstance();