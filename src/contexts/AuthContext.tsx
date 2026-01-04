import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isNewUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'EMAIL ALREADY IN USE';
    case 'auth/invalid-email':
      return 'INVALID EMAIL FORMAT';
    case 'auth/operation-not-allowed':
      return 'OPERATION NOT ALLOWED';
    case 'auth/weak-password':
      return 'PASSWORD TOO WEAK (MIN 6 CHARS)';
    case 'auth/user-disabled':
      return 'ACCOUNT DISABLED';
    case 'auth/user-not-found':
      return 'USER NOT FOUND';
    case 'auth/wrong-password':
      return 'WRONG PASSWORD';
    case 'auth/invalid-credential':
      return 'INVALID CREDENTIALS';
    case 'auth/too-many-requests':
      return 'TOO MANY ATTEMPTS. TRY LATER';
    case 'auth/popup-closed-by-user':
      return 'SIGN IN CANCELLED';
    default:
      return 'AUTHENTICATION FAILED';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      // Check if this is a new user
      const isNew = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      setIsNewUser(isNew);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(getFirebaseErrorMessage(firebaseError.code || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setIsNewUser(false);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(getFirebaseErrorMessage(firebaseError.code || ''));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      setIsNewUser(true);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(getFirebaseErrorMessage(firebaseError.code || ''));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setIsNewUser(false);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(getFirebaseErrorMessage(firebaseError.code || ''));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isNewUser,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
