// Note: This is a legacy stub file. Use app/services/auth/aliasService.ts instead.
// That file uses Supabase Postgres for alias lookups.

export class AliasService {
  async fetchAddressByAlias(alias: string): Promise<string | null> {
    try {
      // Remove @ if present
      const cleanAlias = alias.startsWith('@') ? alias.slice(1) : alias;

      // This is a stub - use app/services/auth/aliasService.ts for actual implementation
      console.warn('Using legacy aliasService stub. Use app/services/auth/aliasService.ts instead.');
      return null; // No alias found
    } catch (error) {
      console.error('Error fetching alias:', error);
      return null;
    }
  }
}

// Singleton
export const aliasService = new AliasService();