import { useState, useCallback } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDisplayName = useCallback(
    async (newDisplayName: string): Promise<{ success: boolean; message: string }> => {
      if (!user) {
        return { success: false, message: 'SIGN IN REQUIRED' };
      }

      const trimmedName = newDisplayName.trim();
      if (!trimmedName) {
        return { success: false, message: 'NAME CANNOT BE EMPTY' };
      }

      if (trimmedName.length > 30) {
        return { success: false, message: 'NAME TOO LONG (MAX 30)' };
      }

      setLoading(true);
      setError(null);

      try {
        // Update Firebase Auth profile
        await updateProfile(user, {
          displayName: trimmedName,
        });

        // Update Firestore profile (for Squad system)
        const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
        await updateDoc(profileRef, {
          displayName: trimmedName,
          updatedAt: serverTimestamp(),
        });

        return { success: true, message: 'NAME UPDATED' };
      } catch (err) {
        console.error('Error updating display name:', err);
        setError('FAILED TO UPDATE NAME');
        return { success: false, message: 'FAILED TO UPDATE NAME' };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const uploadAvatar = useCallback(
    async (file: File): Promise<{ success: boolean; message: string }> => {
      if (!user) {
        return { success: false, message: 'SIGN IN REQUIRED' };
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { success: false, message: 'FILE MUST BE AN IMAGE' };
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        return { success: false, message: 'IMAGE TOO LARGE (MAX 2MB)' };
      }

      setLoading(true);
      setError(null);

      try {
        // Upload to Firebase Storage
        const avatarRef = ref(storage, `avatars/${user.uid}/profile.jpg`);
        await uploadBytes(avatarRef, file);

        // Get download URL
        const photoURL = await getDownloadURL(avatarRef);

        // Update Firebase Auth profile
        await updateProfile(user, {
          photoURL,
        });

        // Update Firestore profile (for Squad system)
        const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
        await updateDoc(profileRef, {
          photoURL,
          updatedAt: serverTimestamp(),
        });

        return { success: true, message: 'AVATAR UPDATED' };
      } catch (err) {
        console.error('Error uploading avatar:', err);
        setError('FAILED TO UPLOAD AVATAR');
        return { success: false, message: 'FAILED TO UPLOAD AVATAR' };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const removeAvatar = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'SIGN IN REQUIRED' };
    }

    setLoading(true);
    setError(null);

    try {
      // Delete from Firebase Storage if exists
      const avatarRef = ref(storage, `avatars/${user.uid}/profile.jpg`);
      try {
        await deleteObject(avatarRef);
      } catch (err) {
        // Ignore error if file doesn't exist
        console.log('No avatar to delete:', err);
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        photoURL: null,
      });

      // Update Firestore profile (for Squad system)
      const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
      await updateDoc(profileRef, {
        photoURL: null,
        updatedAt: serverTimestamp(),
      });

      return { success: true, message: 'AVATAR REMOVED' };
    } catch (err) {
      console.error('Error removing avatar:', err);
      setError('FAILED TO REMOVE AVATAR');
      return { success: false, message: 'FAILED TO REMOVE AVATAR' };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    updateDisplayName,
    uploadAvatar,
    removeAvatar,
  };
}
