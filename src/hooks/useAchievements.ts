import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useAllWeeks } from './useAllWeeks';
import {
  ACHIEVEMENTS,
  checkNewAchievements,
  type Achievement,
  type UnlockedAchievement,
} from '../lib/achievements';

const STORAGE_KEY = 'doom-tracker-achievements';

export function useAchievements() {
  const { user } = useAuth();
  const { stats, weeks, loading: weeksLoading } = useAllWeeks();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [unlockedAchievements, setUnlockedAchievements] = useState<Map<string, UnlockedAchievement>>(new Map());
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Load unlocked achievements
  useEffect(() => {
    const loadAchievements = async () => {
      setLoading(true);

      if (user) {
        try {
          const achievementsRef = collection(db, 'users', user.uid, 'achievements');
          const snapshot = await getDocs(achievementsRef);

          const unlocked = new Map<string, UnlockedAchievement>();
          const ids = new Set<string>();

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            ids.add(docSnap.id);
            unlocked.set(docSnap.id, {
              id: docSnap.id,
              unlockedAt: data.unlockedAt?.toDate() || new Date(),
            });
          });

          setUnlockedIds(ids);
          setUnlockedAchievements(unlocked);
        } catch (error) {
          console.error('Error loading achievements:', error);
        }
      } else {
        // Load from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Record<string, string>;
            const unlocked = new Map<string, UnlockedAchievement>();
            const ids = new Set<string>();

            Object.entries(parsed).forEach(([id, dateStr]) => {
              ids.add(id);
              unlocked.set(id, {
                id,
                unlockedAt: new Date(dateStr),
              });
            });

            setUnlockedIds(ids);
            setUnlockedAchievements(unlocked);
          } catch {
            // Invalid data
          }
        }
      }

      setLoading(false);
    };

    loadAchievements();
  }, [user]);

  // Check for new achievements when stats/weeks change
  useEffect(() => {
    if (weeksLoading || loading) return;
    if (weeks.length === 0) return;

    const newAchievements = checkNewAchievements(stats, weeks, Array.from(unlockedIds));

    if (newAchievements.length > 0) {
      // Use functional update to avoid direct setState in effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewlyUnlocked((prev) => {
        // Only update if there are actually new achievements
        if (prev.length === 0 || prev[0]?.id !== newAchievements[0]?.id) {
          return newAchievements;
        }
        return prev;
      });
    }
  }, [stats, weeks, unlockedIds, weeksLoading, loading]);

  // Unlock achievement
  const unlockAchievement = useCallback(async (achievement: Achievement) => {
    const now = new Date();

    // Update local state
    setUnlockedIds(prev => new Set([...prev, achievement.id]));
    setUnlockedAchievements(prev => {
      const newMap = new Map(prev);
      newMap.set(achievement.id, { id: achievement.id, unlockedAt: now });
      return newMap;
    });

    // Save to Firestore or localStorage
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'achievements', achievement.id);
        await setDoc(docRef, { unlockedAt: now });
      } catch (error) {
        console.error('Error saving achievement:', error);
      }
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      const data = saved ? JSON.parse(saved) : {};
      data[achievement.id] = now.toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [user]);

  // Confirm new achievements (call after showing notification)
  const confirmNewAchievements = useCallback(async () => {
    for (const achievement of newlyUnlocked) {
      await unlockAchievement(achievement);
    }
    setNewlyUnlocked([]);
  }, [newlyUnlocked, unlockAchievement]);

  // Dismiss single achievement notification
  const dismissAchievement = useCallback(async (achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement) {
      await unlockAchievement(achievement);
    }
    setNewlyUnlocked(prev => prev.filter(a => a.id !== achievementId));
  }, [unlockAchievement]);

  // Get all achievements with unlock status
  const getAllAchievements = useCallback(() => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      isUnlocked: unlockedIds.has(achievement.id),
      unlockedAt: unlockedAchievements.get(achievement.id)?.unlockedAt,
      progressData: achievement.progress ? achievement.progress(stats, weeks) : undefined,
    }));
  }, [unlockedIds, unlockedAchievements, stats, weeks]);

  return {
    achievements: getAllAchievements(),
    unlockedCount: unlockedIds.size,
    totalCount: ACHIEVEMENTS.length,
    newlyUnlocked,
    loading: loading || weeksLoading,
    confirmNewAchievements,
    dismissAchievement,
  };
}
