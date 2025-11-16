import { doc, setDoc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@dumpsack/shared-utils';

export interface AliasRecord {
  alias: string;
  address: string;
  userId: string;
  createdAt: Date;
}

const ALIASES_COLLECTION = 'userAliases';

/**
 * Check if an alias is available
 */
export async function isAliasAvailable(alias: string): Promise<boolean> {
  try {
    const db = await firebaseConfig.getFirestore();
    const q = query(collection(db, ALIASES_COLLECTION), where('alias', '==', alias));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Failed to check alias availability:', error);
    throw new Error('Failed to check alias availability');
  }
}

/**
 * Register a new alias
 */
export async function registerAlias(alias: string, address: string, userId: string): Promise<void> {
  try {
    // First check if available
    const available = await isAliasAvailable(alias);
    if (!available) {
      throw new Error('Alias is already taken');
    }

    const db = await firebaseConfig.getFirestore();
    const aliasDoc: AliasRecord = {
      alias,
      address,
      userId,
      createdAt: new Date(),
    };

    await setDoc(doc(db, ALIASES_COLLECTION, alias), aliasDoc);
  } catch (error) {
    console.error('Failed to register alias:', error);
    throw error;
  }
}

/**
 * Resolve an alias to an address
 */
export async function resolveAlias(alias: string): Promise<string | null> {
  try {
    const db = await firebaseConfig.getFirestore();
    const docRef = doc(db, ALIASES_COLLECTION, alias);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as AliasRecord;
      return data.address;
    }

    return null;
  } catch (error) {
    console.error('Failed to resolve alias:', error);
    throw new Error('Failed to resolve alias');
  }
}

/**
 * Get alias record by user ID
 */
export async function getAliasByUserId(userId: string): Promise<AliasRecord | null> {
  try {
    const db = await firebaseConfig.getFirestore();
    const q = query(collection(db, ALIASES_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data() as AliasRecord;
    }

    return null;
  } catch (error) {
    console.error('Failed to get alias by user ID:', error);
    throw new Error('Failed to get user alias');
  }
}