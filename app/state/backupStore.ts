import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appConfig } from '@dumpsack/shared-utils';
import { backupService } from '../services/backup/backupService';
import { BackupPayloadV1 } from '../services/backup/backupTypes';

interface BackupState {
  cloudEnabled: boolean;
  lastBackupAt?: number;
  error?: string;
  loading: boolean;
}

interface BackupActions {
  createBackup(passphrase: string): Promise<BackupPayloadV1>;
  restoreBackup(fileUri: string, passphrase: string): Promise<void>;
  syncToCloud(): Promise<void>;
  loadCloudBackup(): Promise<BackupPayloadV1 | null>;
  toggleCloud(enabled: boolean): Promise<void>;
  loadSettings(): Promise<void>;
  _setState: (state: Partial<BackupState>) => void;
}

type BackupStore = BackupState & BackupActions;

const STORAGE_KEYS = {
  CLOUD_ENABLED: 'backup_cloud_enabled',
  LAST_BACKUP: 'backup_last_backup_at',
};

export const useBackupStore = create<BackupStore>((set, get) => ({
  // Initial state
  cloudEnabled: false,
  lastBackupAt: undefined,
  error: undefined,
  loading: false,

  createBackup: async (passphrase: string): Promise<BackupPayloadV1> => {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    set({ loading: true, error: undefined });

    try {
      const payload = await backupService.createLocalBackup(passphrase);

      // Update last backup timestamp
      const now = Date.now();
      set({ lastBackupAt: now, loading: false });

      // Persist to storage
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_BACKUP, now.toString());

      // Auto-sync to cloud if enabled
      if (get().cloudEnabled) {
        try {
          await get().syncToCloud();
        } catch (cloudError) {
          console.warn('Cloud sync failed:', cloudError);
          // Don't fail the backup if cloud sync fails
        }
      }

      return payload;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Backup creation failed',
      });
      throw error;
    }
  },

  restoreBackup: async (fileUri: string, passphrase: string): Promise<void> => {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    set({ loading: true, error: undefined });

    try {
      await backupService.importLocalBackup(fileUri, passphrase);
      set({ loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Backup restoration failed',
      });
      throw error;
    }
  },

  syncToCloud: async (): Promise<void> => {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    if (!get().cloudEnabled) {
      throw new Error('Cloud backup is not enabled');
    }

    set({ loading: true, error: undefined });

    try {
      // Get the most recent backup (from local or cloud)
      let payload = await backupService.downloadBackupFromCloud();

      if (!payload && get().lastBackupAt) {
        // Create a new backup from current wallet state
        // This would need the passphrase, so for now we'll skip
        throw new Error('No cloud backup found and passphrase required for new backup');
      }

      if (payload) {
        await backupService.uploadBackupToCloud(payload);
      }

      set({ loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Cloud sync failed',
      });
      throw error;
    }
  },

  loadCloudBackup: async (): Promise<BackupPayloadV1 | null> => {
    if (!appConfig.features.enableBackup) {
      throw new Error('Backup feature is not enabled');
    }

    if (!get().cloudEnabled) {
      return null;
    }

    try {
      return await backupService.downloadBackupFromCloud();
    } catch (error) {
      console.warn('Failed to load cloud backup:', error);
      return null;
    }
  },

  toggleCloud: async (enabled: boolean): Promise<void> => {
    set({ cloudEnabled: enabled, error: undefined });

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CLOUD_ENABLED, enabled.toString());

      if (enabled) {
        // Try to sync immediately
        try {
          await get().syncToCloud();
        } catch (syncError) {
          console.warn('Initial cloud sync failed:', syncError);
        }
      } else {
        // Delete cloud backup
        try {
          await backupService.deleteCloudBackup();
        } catch (deleteError) {
          console.warn('Failed to delete cloud backup:', deleteError);
        }
      }
    } catch (error) {
      set({
        cloudEnabled: !enabled, // Revert on error
        error: error instanceof Error ? error.message : 'Failed to update cloud settings',
      });
      throw error;
    }
  },

  loadSettings: async (): Promise<void> => {
    try {
      const [cloudEnabledStr, lastBackupStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CLOUD_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_BACKUP),
      ]);

      const cloudEnabled = cloudEnabledStr === 'true';
      const lastBackupAt = lastBackupStr ? parseInt(lastBackupStr, 10) : undefined;

      set({ cloudEnabled, lastBackupAt });
    } catch (error) {
      console.warn('Failed to load backup settings:', error);
    }
  },

  _setState: (state) => set(state),
}));