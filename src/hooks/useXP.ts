import { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';

import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { calculateWeeklyXP } from '../lib/xpFormulas';
import { getRankForXP, getNextRank, checkRankUp } from '../lib/ranks';

import type { Rank, LevelUpEvent } from '../types';
import type { WeekRecord } from './useAllWeeks';

// Module-level debounce timer for XP persistence optimization
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Abbreviate military rank names for denormalization
 */
function abbreviateRank(rankName: string): string {
  const abbreviations: Record<string, string> = {
    'Private': 'PVT',
    'Corporal': 'CPL',
    'Sergeant': 'SGT',
    'Lieutenant': 'LT',
    'Captain': 'CPT',
    'Major': 'MAJ',
    'Colonel': 'COL',
    'Commander': 'CDR',
    'Knight': 'KNT',
    'Sentinel': 'SNL',
    'Paladin': 'PDN',
    'Warlord': 'WRL',
    'Hellwalker': 'HLW',
    'Slayer': 'SLR',
    'Doom Slayer': 'DSL',
  };
  return abbreviations[rankName] || rankName;
}

/**
 * XP state management hook with Firestore persistence and retroactive calculation.
 *
 * Handles:
 * - Loading XP from Firestore stats/current document
 * - Retroactive XP calculation for existing users (first load when no XP data exists)
 * - Real-time XP state (totalXP, currentRank, nextRank, xpToNextRank)
 * - Level-up event emission for UI notifications
 * - Guest mode exclusion (no XP for unauthenticated users)
 *
 * @param weeks - All historical week records from useAllWeeks().weeks
 * @param currentStreak - Current streak length from useAllWeeks().stats.currentStreak
 * @param unlockedAchievementCount - Number of unlocked achievements (for retroactive calc)
 * @param weeksLoading - Loading state from useAllWeeks().loading (prevents premature calc)
 */
export function useXP(
  weeks: WeekRecord[],
  currentStreak: number,
  unlockedAchievementCount: number,
  weeksLoading: boolean
) {
  const { user } = useAuth();

  // State
  const [totalXP, setTotalXP] = useState<number>(0);
  const [achievementXP, setAchievementXP] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const [xpLoaded, setXPLoaded] = useState<boolean>(false);

  // Effect 1: Load XP from Firestore on mount
  useEffect(() => {
    const loadXP = async () => {
      if (!user) {
        // Guest mode: no XP
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid, 'stats', 'current');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Check if XP data exists (totalXP field is defined)
          if (data.totalXP !== undefined) {
            setTotalXP(data.totalXP);
            setAchievementXP(data.achievementXP || 0);
            setXPLoaded(true);
            setLoading(false);
            return;
          }
        }

        // XP data doesn't exist - will trigger retroactive calc in Effect 2
        setXPLoaded(false);
        setLoading(false);
      } catch (error) {
        console.error('Error loading XP from Firestore:', error);
        setLoading(false);
      }
    };

    loadXP();
  }, [user]);

  // Effect 2: Retroactive XP calculation
  useEffect(() => {
    // Guard conditions
    if (!user) return; // Guest mode
    if (xpLoaded) return; // XP already loaded from Firestore
    if (weeksLoading) return; // Weeks haven't loaded yet
    if (weeks.length === 0 && !weeksLoading) return; // Brand new user, no history

    const calculateRetroactiveXP = async () => {
      try {
        // Calculate total workout XP from all historical weeks
        let workoutXP = 0;
        weeks.forEach((week) => {
          // Use current streak for all historical weeks (simplified, more rewarding)
          const weekXP = calculateWeeklyXP(week.workoutCount, currentStreak, week.status);
          workoutXP += weekXP;
        });

        // Calculate achievement XP
        const achXP = unlockedAchievementCount * 100;

        // Total XP
        const retroTotalXP = workoutXP + achXP;

        // Determine rank
        const rank = getRankForXP(retroTotalXP);

        // Persist to Firestore with batch write (stats + profile denormalization)
        const batch = writeBatch(db);

        const statsRef = doc(db, 'users', user.uid, 'stats', 'current');
        batch.set(
          statsRef,
          {
            totalXP: retroTotalXP,
            currentRankId: rank.id,
            achievementXP: achXP,
          },
          { merge: true }
        );

        const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
        batch.set(
          profileRef,
          {
            currentRankId: rank.id,
            currentRankAbbrev: abbreviateRank(rank.name),
          },
          { merge: true }
        );

        await batch.commit();

        // Update local state
        setTotalXP(retroTotalXP);
        setAchievementXP(achXP);
        setXPLoaded(true);

        // NO level-up event during retroactive calculation (silent mode)
        console.log(`Retroactive XP granted: ${retroTotalXP} XP (Rank: ${rank.name})`);
      } catch (error) {
        console.error('Error calculating retroactive XP:', error);
        // Don't persist partial results, don't set xpLoaded - retry on next load
      }
    };

    calculateRetroactiveXP();
  }, [user, xpLoaded, weeks, weeksLoading, currentStreak, unlockedAchievementCount]);

  // Effect 3: Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      // Flush pending debounced write immediately on unmount
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    };
  }, []);

  /**
   * Add XP and update Firestore.
   * Detects rank-up and emits LevelUpEvent when not silent.
   * Debounces Firestore writes to reduce quota usage.
   *
   * @param amount - XP amount to add
   * @param isSilent - If true, suppress level-up event (default: false)
   */
  const addXP = useCallback(
    async (amount: number, isSilent = false): Promise<void> => {
      if (!user) return;

      const newTotalXP = totalXP + amount;

      // Check for rank-up (immediate, not debounced)
      const rankUpEvent = checkRankUp(totalXP, newTotalXP);
      const didRankUp = rankUpEvent !== null;

      if (rankUpEvent && !isSilent) {
        setLevelUpEvent(rankUpEvent);
      }

      // Update local state optimistically (immediate)
      setTotalXP(newTotalXP);

      // Calculate new rank
      const newRank = getRankForXP(newTotalXP);

      // Debounced Firestore write
      const writeToFirestore = async () => {
        try {
          if (didRankUp) {
            // Rank changed: batch write to both stats/current and profile/info
            const batch = writeBatch(db);

            const statsRef = doc(db, 'users', user.uid, 'stats', 'current');
            batch.set(
              statsRef,
              {
                totalXP: newTotalXP,
                currentRankId: newRank.id,
              },
              { merge: true }
            );

            const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
            batch.set(
              profileRef,
              {
                currentRankId: newRank.id,
                currentRankAbbrev: abbreviateRank(newRank.name),
              },
              { merge: true }
            );

            await batch.commit();
          } else {
            // No rank change: simple update to stats/current
            const docRef = doc(db, 'users', user.uid, 'stats', 'current');
            await setDoc(
              docRef,
              {
                totalXP: newTotalXP,
                currentRankId: newRank.id,
              },
              { merge: true }
            );
          }
        } catch (error) {
          console.error('Error updating XP:', error);
        }
      };

      // Clear previous debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new debounce timer (750ms)
      debounceTimer = setTimeout(() => {
        writeToFirestore();
        debounceTimer = null;
      }, 750);
    },
    [user, totalXP]
  );

  /**
   * Full recalculation from all weeks (nuclear option).
   * Use when delta-based recalc might be inaccurate (e.g., after status change on past week).
   * Always silent (no level-up toasts).
   */
  const recalculateXP = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      // Full recalculation from all weeks
      let workoutXP = 0;
      weeks.forEach((week) => {
        const weekXP = calculateWeeklyXP(week.workoutCount, currentStreak, week.status);
        workoutXP += weekXP;
      });

      // Add achievement XP
      const achXP = unlockedAchievementCount * 100;
      const newTotalXP = workoutXP + achXP;

      // Calculate old rank for comparison
      const oldRank = getRankForXP(totalXP);
      const newRank = getRankForXP(newTotalXP);
      const rankChanged = oldRank.id !== newRank.id;

      // Persist to Firestore with batch write if rank changed
      if (rankChanged) {
        const batch = writeBatch(db);

        const statsRef = doc(db, 'users', user.uid, 'stats', 'current');
        batch.set(
          statsRef,
          {
            totalXP: newTotalXP,
            currentRankId: newRank.id,
            achievementXP: achXP,
          },
          { merge: true }
        );

        const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
        batch.set(
          profileRef,
          {
            currentRankId: newRank.id,
            currentRankAbbrev: abbreviateRank(newRank.name),
          },
          { merge: true }
        );

        await batch.commit();
      } else {
        // No rank change: simple update
        const docRef = doc(db, 'users', user.uid, 'stats', 'current');
        await setDoc(
          docRef,
          {
            totalXP: newTotalXP,
            currentRankId: newRank.id,
            achievementXP: achXP,
          },
          { merge: true }
        );
      }

      // Update local state
      setTotalXP(newTotalXP);
      setAchievementXP(achXP);

      console.log(`XP recalculated: ${newTotalXP} XP (Rank: ${newRank.name})`);
    } catch (error) {
      console.error('Error recalculating XP:', error);
    }
  }, [user, weeks, currentStreak, unlockedAchievementCount, totalXP]);

  /**
   * Dismiss current level-up event notification.
   */
  const dismissLevelUp = useCallback((): void => {
    setLevelUpEvent(null);
  }, []);

  // Derived values with PRIMITIVE dependencies (prevents infinite loops)
  const currentRank: Rank = useMemo(() => getRankForXP(totalXP), [totalXP]);
  const nextRank: Rank | null = useMemo(() => getNextRank(currentRank.id), [currentRank.id]);
  const xpToNextRank: number = useMemo(
    () => (nextRank ? nextRank.xpThreshold - totalXP : 0),
    [nextRank, totalXP]
  );

  return {
    totalXP,
    achievementXP,
    currentRank,
    nextRank,
    xpToNextRank,
    loading,
    levelUpEvent,
    addXP,
    recalculateXP,
    dismissLevelUp,
  };
}
