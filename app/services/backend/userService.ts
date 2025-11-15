import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../../packages/shared-utils';
import { UserProfile, UserPreferences } from '../../../packages/shared-types';

export class UserService {
  private db: any = null;

  private async ensureInitialized() {
    if (!this.db) {
      this.db = await firebaseConfig.getFirestore();
    }
  }

  /**
   * Get user profile by UID
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    await this.ensureInitialized();

    try {
      const docRef = doc(this.db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          uid,
          alias: data.alias,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          preferences: data.preferences || {
            theme: 'system',
            language: 'en',
            biometricsEnabled: false,
            notificationsEnabled: true,
          },
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Create or update user profile
   */
  async upsertUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await this.ensureInitialized();

    try {
      const docRef = doc(this.db, 'users', uid);
      const now = new Date();

      // Check if profile exists
      const existing = await this.getUserProfile(uid);

      const profileData = {
        alias: data.alias || existing?.alias,
        preferences: {
          ...existing?.preferences,
          ...data.preferences,
        },
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      await setDoc(docRef, profileData);
    } catch (error) {
      console.error('Failed to upsert user profile:', error);
      throw new Error('Failed to save user profile');
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(uid: string, preferences: Partial<UserPreferences>): Promise<void> {
    await this.ensureInitialized();

    try {
      const docRef = doc(this.db, 'users', uid);
      const existing = await this.getUserProfile(uid);

      if (!existing) {
        throw new Error('User profile not found');
      }

      const updatedPreferences = {
        ...existing.preferences,
        ...preferences,
      };

      await updateDoc(docRef, {
        preferences: updatedPreferences,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Set user alias
   */
  async setUserAlias(uid: string, alias: string): Promise<void> {
    await this.ensureInitialized();

    try {
      const docRef = doc(this.db, 'users', uid);
      await updateDoc(docRef, {
        alias,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to set user alias:', error);
      throw new Error('Failed to set alias');
    }
  }

  /**
   * Check if alias is available
   */
  async isAliasAvailable(alias: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      // Check if alias exists in aliases collection
      const aliasDocRef = doc(this.db, 'aliases', alias);
      const aliasDoc = await getDoc(aliasDocRef);

      return !aliasDoc.exists();
    } catch (error) {
      console.error('Failed to check alias availability:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userService = new UserService();