import { getSupabase } from '@dumpsack/shared-utils';
import { ThroneLink, ThroneLinkPayload } from '@dumpsack/shared-types';

/**
 * Throne Links Module for Chrome Extension
 * Handles creation and management of shareable links for token/NFT transfers
 */
export class ThroneLinksModule {
  async initialize() {
    console.log('Throne links module initialized');
  }

  /**
   * Get throne links created by the current user
   */
  async getUserThroneLinks(userId: string): Promise<ThroneLink[]> {
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('throne_links')
        .select('*')
        .eq('owner_user_id', userId);

      if (error) {
        console.error('Failed to get throne links:', error);
        throw new Error('Failed to fetch throne links');
      }

      return (data || []).map((row) => ({
        id: row.id,
        ownerUserId: row.owner_user_id,
        type: row.type,
        payload: row.payload,
        createdAt: new Date(row.created_at),
        expiresAt: new Date(row.expires_at),
        used: row.used || false,
        usedBy: row.used_by,
        usedAt: row.used_at ? new Date(row.used_at) : undefined,
      }));
    } catch (error) {
      console.error('Failed to get throne links:', error);
      throw new Error('Failed to fetch throne links');
    }
  }

  /**
   * Create a new throne link
   */
  async createThroneLink(
    ownerUserId: string,
    type: 'token' | 'nft' | 'bundle',
    payload: ThroneLinkPayload,
    expiresInHours: number = 24
  ): Promise<string> {
    try {
      const supabase = getSupabase();
      const id = this.generateThroneLinkId();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      const { error } = await supabase
        .from('throne_links')
        .insert({
          id,
          owner_user_id: ownerUserId,
          type,
          payload,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          used: false,
        });

      if (error) {
        console.error('Failed to create throne link:', error);
        throw new Error('Failed to create throne link');
      }

      return id;
    } catch (error) {
      console.error('Failed to create throne link:', error);
      throw new Error('Failed to create throne link');
    }
  }

  /**
   * Get a throne link by ID
   */
  async getThroneLink(id: string): Promise<ThroneLink | null> {
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('throne_links')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Failed to get throne link:', error);
        throw new Error('Failed to fetch throne link');
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        ownerUserId: data.owner_user_id,
        type: data.type,
        payload: data.payload,
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at),
        used: data.used || false,
        usedBy: data.used_by,
        usedAt: data.used_at ? new Date(data.used_at) : undefined,
      };
    } catch (error) {
      console.error('Failed to get throne link:', error);
      throw new Error('Failed to fetch throne link');
    }
  }

  /**
   * Mark a throne link as used
   */
  async markThroneLinkUsed(id: string, userId: string): Promise<void> {
    try {
      const supabase = getSupabase();
      const throneLink = await this.getThroneLink(id);

      if (!throneLink) {
        throw new Error('Throne link not found');
      }

      if (throneLink.used) {
        throw new Error('Throne link already used');
      }

      if (throneLink.expiresAt < new Date()) {
        throw new Error('Throne link expired');
      }

      if (!userId) {
        throw new Error('User ID is required to use a throne link');
      }

      const { error } = await supabase
        .from('throne_links')
        .update({
          used: true,
          used_by: userId,
          used_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Failed to mark throne link as used:', error);
        throw new Error('Failed to use throne link');
      }
    } catch (error) {
      console.error('Failed to mark throne link as used:', error);
      throw new Error('Failed to use throne link');
    }
  }

  /**
   * Generate a unique throne link ID
   */
  private generateThroneLinkId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}