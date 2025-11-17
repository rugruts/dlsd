import { getSupabase } from '../../../packages/shared-utils';
import { AliasDocument } from '../../../packages/shared-types';

export class AliasService {
  /**
   * Check if alias is available
   */
  async isAliasAvailable(alias: string): Promise<boolean> {
    try {
      const cleanAlias = alias.startsWith('@') ? alias.slice(1) : alias;
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('aliases')
        .select('alias')
        .eq('alias', cleanAlias)
        .maybeSingle();

      if (error) {
        console.error('Failed to check alias availability:', error);
        return false;
      }

      return !data; // Available if no data found
    } catch (error) {
      console.error('Failed to check alias availability:', error);
      return false;
    }
  }

  /**
   * Register a new alias for a user
   */
  async registerAlias(alias: string, address: string, userId: string): Promise<void> {
    try {
      const cleanAlias = alias.startsWith('@') ? alias.slice(1) : alias;

      // Check if alias is already taken
      const isAvailable = await this.isAliasAvailable(cleanAlias);
      if (!isAvailable) {
        throw new Error('Alias already exists');
      }

      // Check if user already has an alias
      const userAliases = await this.getUserAliases(userId);
      if (userAliases.length > 0) {
        throw new Error('User already has an alias');
      }

      const supabase = getSupabase();

      const { error } = await supabase
        .from('aliases')
        .insert({
          alias: cleanAlias,
          address,
          owner_uid: userId,
        });

      if (error) {
        console.error('Failed to register alias:', error);
        throw new Error('Failed to register alias');
      }
    } catch (error) {
      console.error('Failed to register alias:', error);
      throw error instanceof Error ? error : new Error('Failed to register alias');
    }
  }

  /**
   * Resolve an alias to an address
   */
  async resolveAlias(alias: string): Promise<string | null> {
    try {
      const cleanAlias = alias.startsWith('@') ? alias.slice(1) : alias;
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('aliases')
        .select('address')
        .eq('alias', cleanAlias)
        .maybeSingle();

      if (error) {
        console.error('Failed to resolve alias:', error);
        return null;
      }

      return data?.address || null;
    } catch (error) {
      console.error('Failed to resolve alias:', error);
      return null;
    }
  }

  /**
   * Get all aliases for a user
   */
  async getUserAliases(userId: string): Promise<AliasDocument[]> {
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('aliases')
        .select('*')
        .eq('owner_uid', userId);

      if (error) {
        console.error('Failed to get user aliases:', error);
        throw new Error('Failed to fetch user aliases');
      }

      return (data || []).map((row) => ({
        alias: row.alias,
        userId: row.owner_uid,
        resolvedAddress: row.address,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.created_at), // Supabase doesn't have updated_at in the schema
      }));
    } catch (error) {
      console.error('Failed to get user aliases:', error);
      throw new Error('Failed to fetch user aliases');
    }
  }

  /**
   * Update alias address (for when user changes wallet)
   */
  async updateAliasAddress(alias: string, newAddress: string, userId: string): Promise<void> {
    try {
      const cleanAlias = alias.startsWith('@') ? alias.slice(1) : alias;
      const supabase = getSupabase();

      // Verify ownership
      const { data: existing, error: fetchError } = await supabase
        .from('aliases')
        .select('owner_uid')
        .eq('alias', cleanAlias)
        .maybeSingle();

      if (fetchError || !existing) {
        throw new Error('Alias not found');
      }

      if (existing.owner_uid !== userId) {
        throw new Error('Alias does not belong to user');
      }

      const { error } = await supabase
        .from('aliases')
        .update({ address: newAddress })
        .eq('alias', cleanAlias)
        .eq('owner_uid', userId);

      if (error) {
        console.error('Failed to update alias address:', error);
        throw new Error('Failed to update alias');
      }
    } catch (error) {
      console.error('Failed to update alias address:', error);
      throw error instanceof Error ? error : new Error('Failed to update alias');
    }
  }

  /**
   * Delete an alias
   */
  async deleteAlias(alias: string, userId: string): Promise<void> {
    try {
      const cleanAlias = alias.startsWith('@') ? alias.slice(1) : alias;
      const supabase = getSupabase();

      // Verify ownership
      const { data: existing, error: fetchError } = await supabase
        .from('aliases')
        .select('owner_uid')
        .eq('alias', cleanAlias)
        .maybeSingle();

      if (fetchError || !existing) {
        throw new Error('Alias not found');
      }

      if (existing.owner_uid !== userId) {
        throw new Error('Alias does not belong to user');
      }

      const { error } = await supabase
        .from('aliases')
        .delete()
        .eq('alias', cleanAlias)
        .eq('owner_uid', userId);

      if (error) {
        console.error('Failed to delete alias:', error);
        throw new Error('Failed to delete alias');
      }
    } catch (error) {
      console.error('Failed to delete alias:', error);
      throw error instanceof Error ? error : new Error('Failed to delete alias');
    }
  }

  /**
   * Search aliases (for autocomplete, etc.)
   */
  async searchAliases(searchTerm: string, limit: number = 10): Promise<string[]> {
    try {
      const supabase = getSupabase();

      // Use Postgres ILIKE for case-insensitive search
      const { data, error } = await supabase
        .from('aliases')
        .select('alias')
        .ilike('alias', `%${searchTerm}%`)
        .limit(limit);

      if (error) {
        console.error('Failed to search aliases:', error);
        return [];
      }

      return (data || []).map((row) => row.alias);
    } catch (error) {
      console.error('Failed to search aliases:', error);
      return [];
    }
  }
}

// Export singleton instance
export const aliasService = new AliasService();