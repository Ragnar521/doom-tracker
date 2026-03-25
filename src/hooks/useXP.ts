import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { doc, setDoc, writeBatch } from 'firebase/firestore';

import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { calculateWeeklyXP } from '../lib/xpFormulas';
import { getRankForXP, getNextRank, checkRankUp, abbreviateRank } from '../lib/ranks';

import type { Rank, LevelUpEvent } from '../types';
import type { WeekRecord } from './useAllWeeks';

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
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effect 1: Calculate XP from full history whenever weeks data is ready.
  // History is the source of truth — Firestore is only for persistence/sharing.
  // NOTE: currentStreak is applied uniformly to all historical weeks (intentional).
  // This means early weeks benefit from a streak earned later — a deliberate design
  // choice that rewards long-term loyalty. Removing a workout can shift the streak
  // multiplier across all weeks, causing total XP to change non-linearly.
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (weeksLoading) return; // Wait for weeks to load

    // Calculate total workout XP from all historical weeks
    let workoutXP = 0;
    weeks.forEach((week) => {
      const weekXP = calculateWeeklyXP(week.workoutCount, currentStreak, week.status);
      workoutXP += weekXP;
    });

    // Calculate achievement XP
    const achXP = unlockedAchievementCount * 100;

    // Total XP
    const newTotalXP = workoutXP + achXP;

    // Update local state
    setTotalXP(newTotalXP);
    setAchievementXP(achXP);
    setLoading(false);

    // Persist to Firestore (silent, no level-up events on load)
    const persistXP = async () => {
      try {
        const rank = getRankForXP(newTotalXP);

        const batch = writeBatch(db);

        const statsRef = doc(db, 'users', user.uid, 'stats', 'current');
        batch.set(
          statsRef,
          {
            totalXP: newTotalXP,
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
      } catch (error) {
        console.error('Error persisting XP to Firestore:', error);
      }
    };

    // Debounce Firestore write to avoid excessive writes during rapid toggling
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      persistXP();
      debounceTimerRef.current = null;
    }, 800);
  }, [user, weeks, weeksLoading, currentStreak, unlockedAchievementCount]);

  // Effect 3: Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer (750ms)
      debounceTimerRef.current = setTimeout(() => {
        writeToFirestore();
        debounceTimerRef.current = null;
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
