// ========== CODE FIREBASE (COMMENTÉ) ==========
// import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
// import { getStorage, FirebaseStorage } from 'firebase/storage';
// 
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };
//
// let app: FirebaseApp;
// let storage: FirebaseStorage;
//
// if (typeof window !== 'undefined') {
//   // Initialiser Firebase seulement côté client
//   if (!getApps().length) {
//     app = initializeApp(firebaseConfig);
//   } else {
//     app = getApps()[0];
//   }
//   storage = getStorage(app);
// }
//
// export { storage };
// export default app;

// ========== CODE SUPABASE ==========
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables d\'environnement Supabase manquantes');
  console.warn('Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre .env.local');
}

let supabaseClient: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Supabase:', error);
  }
}

export const supabase = supabaseClient;
export default supabase;

