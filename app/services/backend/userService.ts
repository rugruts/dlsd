import { getSupabase } from '../../../packages/shared-utils';
import { UserProfile, UserPreferences } from '../../../packages/shared-types';

export class UserService {
  /**
   * Get user profile by UID
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();

      if (error) {
        console.error('Failed to get user profile:', error);
        throw new Error('Failed to fetch user profile');
      }

      if (!data) {
        return null;
      }

      return {
        uid: data.uid,
        alias: data.alias,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        preferences: data.preferences || {
          theme: 'system',
          language: 'en',
          biometricsEnabled: false,
          notificationsEnabled: true,
        },
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Create or update user profile
   */
  async upsertUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const supabase = getSupabase();
      const now = new Date().toISOString();

      // Check if profile exists
      const existing = await this.getUserProfile(uid);

      const profileData = {
        uid,
        alias: data.alias || existing?.alias,
        preferences: {
          ...existing?.preferences,
          ...data.preferences,
        },
        created_at: existing?.createdAt.toISOString() || now,
        updated_at: now,
      };

      const { error } = await supabase
        .from('users')
        .upsert(profileData, { onConflict: 'uid' });

      if (error) {
        console.error('Failed to upsert user profile:', error);
        throw new Error('Failed to save user profile');
      }
    } catch (error) {
      console.error('Failed to upsert user profile:', error);
      throw new Error('Failed to save user profile');
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(uid: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const supabase = getSupabase();
      const existing = await this.getUserProfile(uid);

      if (!existing) {
        throw new Error('User profile not found');
      }

      const updatedPreferences = {
        ...existing.preferences,
        ...preferences,
      };

      const { error } = await supabase
        .from('users')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('uid', uid);

      if (error) {
        console.error('Failed to update user preferences:', error);
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Set user alias
   */
  async setUserAlias(uid: string, alias: string): Promise<void> {
    try {
      const supabase = getSupabase();

      const { error } = await supabase
        .from('users')
        .update({
          alias,
          updated_at: new Date().toISOString(),
        })
        .eq('uid', uid);

      if (error) {
        console.error('Failed to set user alias:', error);
        throw new Error('Failed to set alias');
      }
    } catch (error) {
      console.error('Failed to set user alias:', error);
      throw new Error('Failed to set alias');
    }
  }

  /**
   * Check if alias is available
   */
  async isAliasAvailable(alias: string): Promise<boolean> {
    try {
      const supabase = getSupabase();

      // Check if alias exists in aliases table
      const { data, error } = await supabase
        .from('aliases')
        .select('alias')
        .eq('alias', alias)
        .maybeSingle();

      if (error) {
        console.error('Failed to check alias availability:', error);
        return false;
      }

      return !data;
    } catch (error) {
      console.error('Failed to check alias availability:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userService = new UserService();