import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let storage: FirebaseStorage | undefined;

if (typeof window !== 'undefined') {
  // Initialiser Firebase seulement côté client
  try {
    // Vérifier que les variables d'environnement sont définies
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.storageBucket) {
      console.warn('⚠️ Firebase n\'est pas configuré. Vérifiez vos variables d\'environnement NEXT_PUBLIC_FIREBASE_*');
    } else {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      storage = getStorage(app);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Firebase:', error);
  }
}

export { storage };
export default app;

