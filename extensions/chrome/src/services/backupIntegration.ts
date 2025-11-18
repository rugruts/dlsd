import { ExtensionBackupService } from './backupService';
import { getSupabase } from '@dumpsack/shared-utils';
import { useWalletStore } from '../popupApp/stores/walletStoreV2';

export class ExtensionBackupIntegration {
  private backupService: ExtensionBackupService | null = null;

  constructor() {
    // Initialize with user ID from Supabase auth
    this.initializeFromAuth();
  }

  private async initializeFromAuth() {
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        this.backupService = new ExtensionBackupService(session.user.id);
      }
    } catch (error) {
      console.error('Failed to initialize backup service:', error);
    }
  }

  /**
   * Check if user has a backup available for restoration
   */
  async checkForBackup(): Promise<boolean> {
    if (!this.backupService) {
      return false;
    }

    try {
      return await this.backupService.hasBackup();
    } catch {
      return false;
    }
  }

  /**
   * Create a backup with user-provided passphrase
   */
  async createBackup(passphrase: string): Promise<void> {
    if (!this.backupService) {
      // Try to initialize again
      await this.initializeFromAuth();
      if (!this.backupService) {
        throw new Error('Backup service not initialized. Please sign in first.');
      }
    }

    // Get encrypted mnemonic from wallet store
    const { getMnemonic } = useWalletStore.getState();
    const mnemonic = await getMnemonic();

    // Create backup using the backup service
    await this.backupService.createBackup(mnemonic, passphrase);
  }

  /**
   * Restore backup with user-provided passphrase
   */
  async restoreBackup(passphrase: string): Promise<boolean> {
    if (!this.backupService) {
      // Try to initialize again
      await this.initializeFromAuth();
      if (!this.backupService) {
        throw new Error('Backup service not initialized. Please sign in first.');
      }
    }

    try {
      const keyMaterial = await this.backupService.restoreBackup(passphrase);

      if (keyMaterial && keyMaterial.mnemonic) {
        // Import the restored mnemonic into wallet store
        const { importFromMnemonic } = useWalletStore.getState();
        await importFromMnemonic(keyMaterial.mnemonic, 0);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }

  /**
   * Sync local wallet changes back to cloud backup
   */
  async syncToBackup(passphrase: string): Promise<void> {
    if (!this.backupService) {
      throw new Error('Backup service not initialized');
    }

    try {
      // Get current mnemonic and update backup
      const { getMnemonic } = useWalletStore.getState();
      const mnemonic = await getMnemonic();
      await this.backupService.updateBackup(mnemonic, passphrase);
      console.log('Wallet synced to cloud backup');
    } catch (error) {
      console.error('Failed to sync backup:', error);
      throw error;
    }
  }

  /**
   * Get backup metadata for UI display
   */
  async getBackupInfo(): Promise<{
    hasBackup: boolean;
    lastSync?: Date;
    version?: number;
  }> {
    if (!this.backupService) {
      return { hasBackup: false };
    }

    try {
      const metadata = await this.backupService.getBackupMetadata();
      return {
        hasBackup: metadata.exists,
        lastSync: metadata.updatedAt,
        version: metadata.version,
      };
    } catch {
      return { hasBackup: false };
    }
  }

  /**
   * Initialize backup service with user ID
   */
  initializeForUser(userId: string): void {
    this.backupService = createExtensionBackupService(userId);
  }

  /**
   * Handle first-time extension setup with backup restoration
   * Returns true if a backup is available for restoration
   */
  async handleFirstTimeSetup(): Promise<{
    hasBackupAvailable: boolean;
  }> {
    const hasBackup = await this.checkForBackup();

    if (hasBackup) {
      // User should be prompted in the UI to restore
      // The actual restoration happens when they provide the passphrase
      console.log('Backup available for restoration');
      return { hasBackupAvailable: true };
    }

    return { hasBackupAvailable: false };
  }
}

// Singleton instance
export const backupIntegration = new ExtensionBackupIntegration();