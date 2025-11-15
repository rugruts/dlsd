import { createExtensionBackupService } from './backupService';
import { BackupKeyMaterial } from '../../../../packages/shared-types';

export class ExtensionBackupIntegration {
  private backupService: ReturnType<typeof createExtensionBackupService> | null = null;

  constructor() {
    // TODO: Initialize with actual user ID from auth
    // const userId = getCurrentUserId();
    // if (userId) {
    //   this.backupService = createExtensionBackupService(userId);
    // }
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
   * Prompt user to restore from backup during onboarding
   */
  async promptRestoreBackup(): Promise<BackupKeyMaterial | null> {
    if (!this.backupService) {
      throw new Error('Backup service not initialized');
    }

    const hasBackup = await this.checkForBackup();
    if (!hasBackup) {
      return null;
    }

    // TODO: Show UI prompt to user
    // For now, automatically attempt restoration
    try {
      const keyMaterial = await this.backupService.restoreBackup();
      console.log('Successfully restored wallet from backup');
      return keyMaterial;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return null;
    }
  }

  /**
   * Sync local wallet changes back to cloud backup
   */
  async syncToBackup(keyMaterial: BackupKeyMaterial): Promise<void> {
    if (!this.backupService) {
      throw new Error('Backup service not initialized');
    }

    try {
      await this.backupService.syncBackup(keyMaterial);
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
   */
  async handleFirstTimeSetup(): Promise<{
    restoredFromBackup: boolean;
    keyMaterial?: BackupKeyMaterial;
  }> {
    const hasBackup = await this.checkForBackup();

    if (hasBackup) {
      // TODO: Show UI to ask user if they want to restore
      // For now, attempt automatic restoration
      try {
        const keyMaterial = await this.promptRestoreBackup();
        return {
          restoredFromBackup: true,
          keyMaterial: keyMaterial || undefined,
        };
      } catch {
        return { restoredFromBackup: false };
      }
    }

    return { restoredFromBackup: false };
  }
}

// Singleton instance
export const extensionBackupIntegration = new ExtensionBackupIntegration();