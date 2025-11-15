import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../../packages/shared-utils';
import { ThroneLink, ThroneLinkPayload } from '../../../packages/shared-types';

export class ThroneLinkService {
  private db: any = null;

  private async ensureInitialized() {
    if (!this.db) {
      this.db = await firebaseConfig.getFirestore();
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
    await this.ensureInitialized();

    try {
      const id = this.generateThroneLinkId();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      const throneLink: Omit<ThroneLink, 'id'> = {
        ownerUserId,
        type,
        payload,
        createdAt: new Date(),
        expiresAt,
        used: false,
      };

      const docRef = doc(this.db, 'throneLinks', id);
      await setDoc(docRef, throneLink);

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
    await this.ensureInitialized();

    try {
      const docRef = doc(this.db, 'throneLinks', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id,
          ownerUserId: data.ownerUserId,
          type: data.type,
          payload: data.payload,
          createdAt: data.createdAt.toDate(),
          expiresAt: data.expiresAt.toDate(),
          used: data.used || false,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get throne link:', error);
      throw new Error('Failed to fetch throne link');
    }
  }

  /**
   * Mark throne link as used
   */
  async markThroneLinkUsed(id: string, userId: string): Promise<void> {
    await this.ensureInitialized();

    try {
      const docRef = doc(this.db, 'throneLinks', id);
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

      // TODO: Add validation that userId is authorized to use this link
      // This might involve checking if the user is the intended recipient

      await updateDoc(docRef, {
        used: true,
        usedBy: userId,
        usedAt: new Date(),
      });

    } catch (error) {
      console.error('Failed to mark throne link as used:', error);
      throw new Error('Failed to use throne link');
    }
  }

  /**
   * Get throne links for a user (created by them)
   */
  async getUserThroneLinks(userId: string): Promise<ThroneLink[]> {
    await this.ensureInitialized();

    try {
      const q = query(
        collection(this.db, 'throneLinks'),
        where('ownerUserId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const throneLinks: ThroneLink[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        throneLinks.push({
          id: doc.id,
          ownerUserId: data.ownerUserId,
          type: data.type,
          payload: data.payload,
          createdAt: data.createdAt.toDate(),
          expiresAt: data.expiresAt.toDate(),
          used: data.used || false,
        });
      });

      return throneLinks;
    } catch (error) {
      console.error('Failed to get user throne links:', error);
      throw new Error('Failed to fetch throne links');
    }
  }

  /**
   * Delete expired throne links (cleanup function)
   */
  async cleanupExpiredLinks(): Promise<number> {
    await this.ensureInitialized();

    try {
      const now = new Date();
      const q = query(
        collection(this.db, 'throneLinks'),
        where('expiresAt', '<', now)
      );

      const querySnapshot = await getDocs(q);
      let deletedCount = 0;

      // Note: Firestore doesn't support delete queries directly
      // In production, you might want to use Cloud Functions for this
      const deletePromises = querySnapshot.docs.map(async (document) => {
        await updateDoc(document.ref, {
          deleted: true,
          deletedAt: new Date(),
        });
        deletedCount++;
      });

      await Promise.all(deletePromises);
      return deletedCount;

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
    await this.ensureInitialized();

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