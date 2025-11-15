// Note: Requires Firebase SDK integration
// Install: npm install firebase
// Add Firebase config to env variables

export class AliasService {
  async fetchAddressByAlias(alias: string): Promise<string | null> {
    try {
      // Remove @ if present
      const cleanAlias = alias.startsWith('@') ? alias.slice(1) : alias;

      // TODO: Integrate with Firestore
      // const docRef = doc(db, 'aliases', cleanAlias);
      // const docSnap = await getDoc(docRef);
      // if (docSnap.exists()) {
      //   const data = docSnap.data();
      //   return data.address || null;
      // }

      // Stub implementation - replace with actual Firestore query
      // For now, return null or mock data
      return null; // No alias found
    } catch (error) {
      console.error('Error fetching alias:', error);
      return null;
    }
  }
}

// Singleton
export const aliasService = new AliasService();