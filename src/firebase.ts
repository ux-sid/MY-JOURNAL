import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Helper to check if Firebase environment variables are provided
export const isFirebaseEnabled = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

const app = isFirebaseEnabled 
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) 
  : null;

export const auth = isFirebaseEnabled && app ? getAuth(app) : null;
export const db = isFirebaseEnabled && app ? getFirestore(app) : null;
export const googleProvider = isFirebaseEnabled ? new GoogleAuthProvider() : null;
