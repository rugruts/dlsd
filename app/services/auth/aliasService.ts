import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// TODO: Reuse Firebase app from authService
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class AliasService {
  static async checkAliasAvailability(alias: string): Promise<boolean> {
    const docRef = doc(db, 'aliases', alias);
    const docSnap = await getDoc(docRef);
    return !docSnap.exists();
  }

  static async createAlias(alias: string, userId: string): Promise<void> {
    const isAvailable = await this.checkAliasAvailability(alias);
    if (!isAvailable) {
      throw new Error('Alias already taken');
    }

    await setDoc(doc(db, 'aliases', alias), {
      userId,
      createdAt: new Date(),
    });
  }

  static async getUserByAlias(alias: string): Promise<string | null> {
    const docRef = doc(db, 'aliases', alias);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().userId;
    }
    return null;
  }
}