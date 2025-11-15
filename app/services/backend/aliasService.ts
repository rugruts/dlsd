import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../../../packages/shared-utils';
import { AliasDocument } from '../../../packages/shared-types';

export class AliasService {
  private db: any = null;

  private async ensureInitialized() {
    if (!this.db) {
      this.db = await firebaseConfig.getFirestore();
    }
  }

  /**
   * Register a new alias for a user
   */
  async registerAlias(alias: string, address: string, userId: string): Promise<void> {
    await this.ensureInitialized();

    try {
      // Check if alias is already taken
      const existingAlias = await this.resolveAlias(alias);
      if (existingAlias) {
        throw new Error('Alias already exists');
      }

      // Check if user already has an alias
      const userAliases = await this.getUserAliases(userId);
      if (userAliases.length > 0) {
        throw new Error('User already has an alias');
      }

      // Create alias document
      const aliasDoc: Omit<AliasDocument, 'alias'> = {
        userId,
        resolvedAddress: address,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = doc(this.db, 'aliases', alias);
      await setDoc(docRef, aliasDoc);

    } catch (error) {
      console.error('Failed to register alias:', error);
      throw new Error('Failed to register alias');
    }
  }

  /**
   * Resolve an alias to an address
   */
  async resolveAlias(alias: string): Promise<string | null> {
    await this.ensureInitialized();

    try {
      const cleanAlias = alias.startsWith('@') ? alias.slice(1) : alias;
      const docRef = doc(this.db, 'aliases', cleanAlias);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as AliasDocument;
        return data.resolvedAddress;
      }

      return null;
    } catch (error) {
      console.error('Failed to resolve alias:', error);
      throw new Error('Failed to resolve alias');
    }
  }

  /**
   * Get all aliases for a user
   */
  async getUserAliases(userId: string): Promise<AliasDocument[]> {
    await this.ensureInitialized();

    try {
      const q = query(
        collection(this.db, 'aliases'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const aliases: AliasDocument[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<AliasDocument, 'alias'>;
        aliases.push({
          alias: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });

      return aliases;
    } catch (error) {
      console.error('Failed to get user aliases:', error);
      throw new Error('Failed to fetch user aliases');
    }
  }

  /**
   * Update alias address (for when user changes wallet)
   */
  async updateAliasAddress(alias: string, newAddress: string, userId: string): Promise<void> {
    await this.ensureInitialized();

    try {
      const docRef = doc(this.db, 'aliases', alias);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Alias not found');
      }

      const data = docSnap.data() as AliasDocument;
      if (data.userId !== userId) {
        throw new Error('Alias does not belong to user');
      }

      await setDoc(docRef, {
        ...data,
        resolvedAddress: newAddress,
        updatedAt: new Date(),
      });

    } catch (error) {
      console.error('Failed to update alias address:', error);
      throw new Error('Failed to update alias');
    }
  }

  /**
   * Delete an alias
   */
  async deleteAlias(alias: string, userId: string): Promise<void> {
    await this.ensureInitialized();

    try {
      const docRef = doc(this.db, 'aliases', alias);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Alias not found');
      }

      const data = docSnap.data() as AliasDocument;
      if (data.userId !== userId) {
        throw new Error('Alias does not belong to user');
      }

      // Note: In Firestore, we can't directly delete - this is a soft delete
      // In production, you might want to implement actual deletion or archiving
      await setDoc(docRef, {
        ...data,
        resolvedAddress: '', // Clear the address
        updatedAt: new Date(),
      });

    } catch (error) {
      console.error('Failed to delete alias:', error);
      throw new Error('Failed to delete alias');
    }
  }

  /**
   * Check if alias is available
   */
  async isAliasAvailable(alias: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const cleanAlias = alias.startsWith('@') ? alias.slice(1) : alias;
      const docRef = doc(this.db, 'aliases', cleanAlias);
      const docSnap = await getDoc(docRef);

      return !docSnap.exists();
    } catch (error) {
      console.error('Failed to check alias availability:', error);
      return false;
    }
  }

  /**
   * Search aliases (for autocomplete, etc.)
   */
  async searchAliases(searchTerm: string, limit: number = 10): Promise<string[]> {
    await this.ensureInitialized();

    try {
      // Note: Firestore doesn't support prefix search natively
      // This is a simplified implementation - in production, consider Algolia or similar
      const aliasesRef = collection(this.db, 'aliases');
      const q = query(aliasesRef); // In production, add proper search indexing

      const querySnapshot = await getDocs(q);
      const matchingAliases: string[] = [];

      querySnapshot.forEach((doc) => {
        const alias = doc.id;
        if (alias.toLowerCase().includes(searchTerm.toLowerCase()) && matchingAliases.length < limit) {
          matchingAliases.push(alias);
        }
      });

      return matchingAliases;
    } catch (error) {
      console.error('Failed to search aliases:', error);
      return [];
    }
  }
}

// Export singleton instance
export const aliasService = new AliasService();