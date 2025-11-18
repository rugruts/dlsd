import { Alert } from 'react-native';

import { BackupKeyMaterial } from '@dumpsack/shared-types';
import { getSupabase } from '@dumpsack/shared-utils';

import { BackupService } from './backupService';

export class BackupIntegration {
  private backupService: BackupService | null = null;

  constructor() {
    // Initialize with user ID from Supabase auth
    this.initializeFromAuth();
  }

  private async initializeFromAuth() {
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        this.backupService = new BackupService(session.user.id);
      }
    } catch (error) {
      console.error('Failed to initialize backup service:', error);
    }
  }

  /**
   * Prompt user to enable cloud backup after wallet creation
   */
  async promptEnableBackup(keyMaterial: BackupKeyMaterial): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Enable Cloud Backup',
        'Would you like to enable encrypted cloud backup for your wallet? This allows you to restore your wallet on other devices.',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Enable Backup',
            onPress: async () => {
              try {
                await this.enableBackup(keyMaterial);
                Alert.alert('Success', 'Cloud backup enabled successfully!');
                resolve(true);
              } catch (error) {
                Alert.alert('Error', 'Failed to enable cloud backup. You can try again in settings.');
                resolve(false);
              }
            },
          },
        ]
      );
    });
  }

  /**
   * Enable backup for existing wallet
   */
  async enableBackup(keyMaterial: BackupKeyMaterial): Promise<void> {
    if (!this.backupService) {
      throw new Error('Backup service not initialized');
    }

    try {
      await this.backupService.createBackup(keyMaterial);
    } catch (error) {
      console.error('Failed to enable backup:', error);
      throw error;
    }
  }

  /**
   * Update backup when wallet changes
   */
  async updateBackup(keyMaterial: BackupKeyMaterial): Promise<void> {
    if (!this.backupService) {
      throw new Error('Backup service not initialized');
    }

    try {
      await this.backupService.updateBackup(keyMaterial);
    } catch (error) {
      console.error('Failed to update backup:', error);
      throw error;
    }
  }

  /**
   * Restore wallet from backup
   */
  async restoreFromBackup(passphrase: string): Promise<BackupKeyMaterial | null> {
    if (!this.backupService) {
      // Try to initialize again
      await this.initializeFromAuth();
      if (!this.backupService) {
        throw new Error('Backup service not initialized. Please sign in first.');
      }
    }

    try {
      const hasBackup = await this.backupService.hasBackup();
      if (!hasBackup) {
        Alert.alert('No Backup Found', 'No cloud backup found for this account.');
        return null;
      }

      // Restore with user-provided passphrase
      const keyMaterial = await this.backupService.restoreBackup(passphrase);
      Alert.alert('Success', 'Wallet restored from cloud backup!');
      return keyMaterial;

    } catch (error) {
      console.error('Failed to restore backup:', error);
      Alert.alert('Error', 'Failed to restore wallet from backup. Check your passphrase.');
      return null;
    }
  }

  /**
   * Check backup status
   */
  async getBackupStatus(): Promise<{
    hasBackup: boolean;
    lastBackupDate?: Date;
  }> {
    if (!this.backupService) {
      return { hasBackup: false };
    }

    try {
      const metadata = await this.backupService.getBackupMetadata();
      return {
        hasBackup: metadata.exists,
        lastBackupDate: metadata.updatedAt,
      };
    } catch {
      return { hasBackup: false };
    }
  }

  /**
   * Disable backup (delete from cloud)
   */
  async disableBackup(): Promise<void> {
    if (!this.backupService) {
      throw new Error('Backup service not initialized');
    }

    Alert.alert(
      'Disable Cloud Backup',
      'Are you sure you want to disable cloud backup? This will delete your backup from the cloud and you won\'t be able to restore your wallet on other devices.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              await this.backupService.deleteBackup();
              Alert.alert('Success', 'Cloud backup disabled.');
            } catch (error) {
              Alert.alert('Error', 'Failed to disable cloud backup.');
            }
          },
        },
      ]
    );
  }

  /**
   * Initialize backup service with user ID
   */
  initializeForUser(userId: string): void {
    this.backupService = new BackupService(userId);
  }
}

// Singleton instance
export const backupIntegration = new BackupIntegration();