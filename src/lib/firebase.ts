import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to Firebase Emulators in test mode
// SECURITY: Uses build-time environment variable, not runtime localStorage
// This ensures production users cannot accidentally enable emulator mode
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  try {
    // Connect to Auth Emulator (port 9099)
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

    // Connect to Firestore Emulator (port 8080)
    connectFirestoreEmulator(db, 'localhost', 8080);

    console.log('🔧 Connected to Firebase Emulators');
  } catch (error) {
    // Emulators might already be connected, ignore error
    console.warn('Emulator connection warning:', error);
  }
}
