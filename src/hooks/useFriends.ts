import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentWeekId } from '../lib/weekUtils';
import type { Friend, FriendStats, FaceState } from '../types';

function generateFriendCode(uid: string): string {
  // Generate a friendly code from UID (first 8 chars + random suffix)
  const base = uid.substring(0, 8).toUpperCase();
  const suffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${base}#${suffix}`;
}

function getFaceState(workoutCount: number): FaceState {
  if (workoutCount === 0) return 'critical';
  if (workoutCount === 1) return 'hurt';
  if (workoutCount === 2) return 'damaged';
  if (workoutCount === 3) return 'healthy';
  if (workoutCount === 4) return 'strong';
  return 'godmode';
}

export function useFriends() {
  const { user } = useAuth();
  const [friendCode, setFriendCode] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user's friend code
  useEffect(() => {
    const initializeFriendCode = async () => {
      if (!user) {
        setFriendCode('');
        return;
      }

      try {
        const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setFriendCode(profileSnap.data().friendCode);
        } else {
          // Create friend code for new user
          const newCode = generateFriendCode(user.uid);

          // Create both parent document and profile subcollection
          // This makes the user discoverable in collection queries
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            createdAt: serverTimestamp(),
          });

          await setDoc(profileRef, {
            friendCode: newCode,
            displayName: user.displayName || user.email?.split('@')[0] || 'Marine',
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
          });
          setFriendCode(newCode);
        }
      } catch (err) {
        console.error('Error initializing friend code:', err);
        setError('FAILED TO LOAD FRIEND CODE');
      }
    };

    initializeFriendCode();
  }, [user]);

  // Load friends list
  useEffect(() => {
    const loadFriends = async () => {
      if (!user) {
        setFriends([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const friendsRef = collection(db, 'users', user.uid, 'friends');
        const friendsSnap = await getDocs(friendsRef);

        const friendsData: Friend[] = [];

        for (const friendDoc of friendsSnap.docs) {
          const friendUid = friendDoc.id;
          const friendData = friendDoc.data();

          // Load friend's profile
          const friendProfileRef = doc(db, 'users', friendUid, 'profile', 'info');
          const friendProfileSnap = await getDoc(friendProfileRef);

          if (!friendProfileSnap.exists()) continue;

          const profile = friendProfileSnap.data();

          // Load friend's current week stats
          const currentWeekId = getCurrentWeekId();
          const weekRef = doc(db, 'users', friendUid, 'weeks', currentWeekId);
          const weekSnap = await getDoc(weekRef);

          let stats: FriendStats | null = null;
          if (weekSnap.exists()) {
            const weekData = weekSnap.data();
            const workoutCount = weekData.workouts.filter(Boolean).length;

            // Load streak info (simplified - just current week for now)
            stats = {
              currentWeekWorkouts: workoutCount,
              currentWeekWorkoutDays: weekData.workouts,
              currentStreak: 0, // TODO: Calculate from all weeks
              totalWorkouts: 0, // TODO: Calculate from all weeks
              faceState: getFaceState(workoutCount),
            };
          } else {
            stats = {
              currentWeekWorkouts: 0,
              currentWeekWorkoutDays: [false, false, false, false, false, false, false],
              currentStreak: 0,
              totalWorkouts: 0,
              faceState: 'critical',
            };
          }

          friendsData.push({
            uid: friendUid,
            friendCode: profile.friendCode,
            displayName: profile.displayName,
            photoURL: profile.photoURL,
            addedAt: friendData.addedAt?.toDate() || new Date(),
            stats,
          });
        }

        // Sort by face state (struggling friends first)
        friendsData.sort((a, b) => {
          const stateOrder = { critical: 0, hurt: 1, damaged: 2, healthy: 3, strong: 4, godmode: 5 };
          const aOrder = a.stats ? stateOrder[a.stats.faceState] : 999;
          const bOrder = b.stats ? stateOrder[b.stats.faceState] : 999;
          return aOrder - bOrder;
        });

        setFriends(friendsData);
      } catch (err) {
        console.error('Error loading friends:', err);
        setError('FAILED TO LOAD SQUAD');
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [user]);

  // Add friend by code
  const addFriend = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      if (!user) {
        return { success: false, message: 'SIGN IN REQUIRED' };
      }

      const trimmedCode = code.trim().toUpperCase();
      if (!trimmedCode) {
        return { success: false, message: 'ENTER FRIEND CODE' };
      }

      if (trimmedCode === friendCode) {
        return { success: false, message: "CAN'T ADD YOURSELF" };
      }

      try {
        // Find user by friend code by iterating through all users
        const usersRef = collection(db, 'users');
        const allUsersSnap = await getDocs(usersRef);

        let targetUid: string | null = null;

        for (const userDoc of allUsersSnap.docs) {
          const profileRef = doc(db, 'users', userDoc.id, 'profile', 'info');
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            const data = profileSnap.data();

            if (data.friendCode === trimmedCode) {
              targetUid = userDoc.id;
              break;
            }
          }
        }

        if (!targetUid) {
          return { success: false, message: 'MARINE NOT FOUND' };
        }

        // Check if already friends
        const existingFriendRef = doc(db, 'users', user.uid, 'friends', targetUid);
        const existingFriendSnap = await getDoc(existingFriendRef);

        if (existingFriendSnap.exists()) {
          return { success: false, message: 'ALREADY IN SQUAD' };
        }

        // Add friend (instant follow, both ways)
        await setDoc(doc(db, 'users', user.uid, 'friends', targetUid), {
          addedAt: serverTimestamp(),
        });

        await setDoc(doc(db, 'users', targetUid, 'friends', user.uid), {
          addedAt: serverTimestamp(),
        });

        // Reload friends
        const friendsRef = collection(db, 'users', user.uid, 'friends');
        const friendsSnap = await getDocs(friendsRef);

        const friendsData: Friend[] = [];

        for (const friendDoc of friendsSnap.docs) {
          const friendUid = friendDoc.id;
          const friendData = friendDoc.data();

          const friendProfileRef = doc(db, 'users', friendUid, 'profile', 'info');
          const friendProfileSnap = await getDoc(friendProfileRef);

          if (!friendProfileSnap.exists()) continue;

          const profile = friendProfileSnap.data();

          const currentWeekId = getCurrentWeekId();
          const weekRef = doc(db, 'users', friendUid, 'weeks', currentWeekId);
          const weekSnap = await getDoc(weekRef);

          let stats: FriendStats | null = null;
          if (weekSnap.exists()) {
            const weekData = weekSnap.data();
            const workoutCount = weekData.workouts.filter(Boolean).length;

            stats = {
              currentWeekWorkouts: workoutCount,
              currentWeekWorkoutDays: weekData.workouts,
              currentStreak: 0,
              totalWorkouts: 0,
              faceState: getFaceState(workoutCount),
            };
          } else {
            stats = {
              currentWeekWorkouts: 0,
              currentWeekWorkoutDays: [false, false, false, false, false, false, false],
              currentStreak: 0,
              totalWorkouts: 0,
              faceState: 'critical',
            };
          }

          friendsData.push({
            uid: friendUid,
            friendCode: profile.friendCode,
            displayName: profile.displayName,
            photoURL: profile.photoURL,
            addedAt: friendData.addedAt?.toDate() || new Date(),
            stats,
          });
        }

        friendsData.sort((a, b) => {
          const stateOrder = { critical: 0, hurt: 1, damaged: 2, healthy: 3, strong: 4, godmode: 5 };
          const aOrder = a.stats ? stateOrder[a.stats.faceState] : 999;
          const bOrder = b.stats ? stateOrder[b.stats.faceState] : 999;
          return aOrder - bOrder;
        });

        setFriends(friendsData);

        return { success: true, message: 'MARINE JOINED SQUAD' };
      } catch (err) {
        console.error('Error adding friend:', err);
        return { success: false, message: 'OPERATION FAILED' };
      }
    },
    [user, friendCode]
  );

  // Remove friend
  const removeFriend = useCallback(
    async (friendUid: string): Promise<{ success: boolean; message: string }> => {
      if (!user) {
        return { success: false, message: 'SIGN IN REQUIRED' };
      }

      try {
        // Remove from both sides
        await deleteDoc(doc(db, 'users', user.uid, 'friends', friendUid));
        await deleteDoc(doc(db, 'users', friendUid, 'friends', user.uid));

        // Update local state
        setFriends((prev) => prev.filter((f) => f.uid !== friendUid));

        return { success: true, message: 'MARINE REMOVED' };
      } catch (err) {
        console.error('Error removing friend:', err);
        return { success: false, message: 'OPERATION FAILED' };
      }
    },
    [user]
  );

  return {
    friendCode,
    friends,
    loading,
    error,
    addFriend,
    removeFriend,
  };
}
