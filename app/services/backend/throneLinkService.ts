import { getSupabase } from '../../../packages/shared-utils';
import { ThroneLink, ThroneLinkPayload } from '../../../packages/shared-types';

export class ThroneLinkService {
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
   * Get throne link by ID
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
   * Mark throne link as used
   * Validates that the user is authorized to use this link
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

      // Authorization: Only the owner can mark their own link as used
      // OR any user can use a link that was created for them
      // For now, we allow any user to use a link (it's a public share)
      // but we track who used it for audit purposes
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
   * Get throne links for a user (created by them)
   */
  async getUserThroneLinks(userId: string): Promise<ThroneLink[]> {
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('throne_links')
        .select('*')
        .eq('owner_user_id', userId);

      if (error) {
        console.error('Failed to get user throne links:', error);
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
      console.error('Failed to get user throne links:', error);
      throw new Error('Failed to fetch throne links');
    }
  }

  /**
   * Delete expired throne links (cleanup function)
   */
  async cleanupExpiredLinks(): Promise<number> {
    try {
      const supabase = getSupabase();
      const now = new Date().toISOString();

      // Supabase supports direct delete queries
      const { data, error } = await supabase
        .from('throne_links')
        .delete()
        .lt('expires_at', now)
        .select('id');

      if (error) {
        console.error('Failed to cleanup expired links:', error);
        throw new Error('Failed to cleanup links');
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Failed to cleanup expired links:', error);
      throw new Error('Failed to cleanup links');
    }
  }

  /**
   * Validate throne link payload
   */
  validateThroneLinkPayload(type: string, payload: ThroneLinkPayload): boolean {
    try {
      switch (type) {
        case 'token':
          return !!(payload.tokenMint && payload.amount);
        case 'nft':
          return !!payload.nftMint;
        case 'bundle':
          return !!(payload.bundleItems && payload.bundleItems.length > 0);
        default:
          return false;
      }
    } catch {
      return false;
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

  /**
   * Get throne link statistics for a user
   */
  async getThroneLinkStats(userId: string): Promise<{
    total: number;
    active: number;
    used: number;
    expired: number;
  }> {
    try {
      const throneLinks = await this.getUserThroneLinks(userId);
      const now = new Date();

      let active = 0;
      let used = 0;
      let expired = 0;

      throneLinks.forEach(link => {
        if (link.used) {
          used++;
        } else if (link.expiresAt < now) {
          expired++;
        } else {
          active++;
        }
      });

      return {
        total: throneLinks.length,
        active,
        used,
        expired,
      };

    } catch (error) {
      console.error('Failed to get throne link stats:', error);
      return { total: 0, active: 0, used: 0, expired: 0 };
    }
  }
}

// Export singleton instance
export const throneLinkService = new ThroneLinkService();