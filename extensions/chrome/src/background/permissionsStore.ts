import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Permission } from './types';

interface PermissionsState {
  permissions: Record<string, Permission>;
  approve: (origin: string) => void;
  reject: (origin: string) => void;
  isAllowed: (origin: string) => boolean;
  clearExpired: () => void;
}

const PERMISSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      permissions: {},

      approve: (origin: string) => {
        set((state) => ({
          permissions: {
            ...state.permissions,
            [origin]: {
              allowed: true,
              lastApproved: Date.now(),
            },
          },
        }));
      },

      reject: (origin: string) => {
        set((state) => ({
          permissions: {
            ...state.permissions,
            [origin]: {
              allowed: false,
              lastApproved: Date.now(),
            },
          },
        }));
      },

      isAllowed: (origin: string) => {
        const permission = get().permissions[origin];
        if (!permission) return false;

        // Check if permission has expired
        if (Date.now() - permission.lastApproved > PERMISSION_EXPIRY) {
          // Auto-reject expired permissions
          get().reject(origin);
          return false;
        }

        return permission.allowed;
      },

      clearExpired: () => {
        const now = Date.now();
        set((state) => {
          const updated = { ...state.permissions };
          Object.keys(updated).forEach((origin) => {
            if (now - updated[origin].lastApproved > PERMISSION_EXPIRY) {
              delete updated[origin];
            }
          });
          return { permissions: updated };
        });
      },
    }),
    {
      name: 'dumpsack-permissions',
      storage: createJSONStorage(() => chrome.storage.local),
    }
  )
);

// Export singleton instance
export const permissionsStore = {
  approve: usePermissionsStore.getState().approve,
  reject: usePermissionsStore.getState().reject,
  isAllowed: usePermissionsStore.getState().isAllowed,
  clearExpired: usePermissionsStore.getState().clearExpired,
};