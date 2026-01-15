import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getPreviousWeekId, getCurrentWeekId } from '../lib/weekUtils';
import type { WeekStatus } from './useWeek';

export interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
}

interface WeekDoc {
  workouts: boolean[];
  status: WeekStatus;
}

const STORAGE_KEY = 'doom-tracker-stats';

const defaultStats: UserStats = {
  totalWorkouts: 0,
  currentStreak: 0,
  longestStreak: 0,
};

export function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);

      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'stats', 'current');
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setStats(docSnap.data() as UserStats);
          } else {
            setStats(defaultStats);
          }
        } catch (error) {
          console.error('Error loading stats:', error);
        }
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setStats(JSON.parse(saved));
        } else {
          setStats(defaultStats);
        }
      }

      setLoading(false);
    };

    loadStats();
  }, [user]);

  // Recalculate stats from all weeks
  const recalculateStats = useCallback(async () => {
    if (user) {
      try {
        const weeksRef = collection(db, 'users', user.uid, 'weeks');
        const q = query(weeksRef, orderBy('startDate', 'desc'));
        const snapshot = await getDocs(q);

        let totalWorkouts = 0;
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        // Build a map of weeks with status
        const weeks = new Map<string, WeekDoc>();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          weeks.set(docSnap.id, {
            workouts: data.workouts,
            status: data.status || 'normal',
          });
          totalWorkouts += data.workouts.filter(Boolean).length;
        });

        // Calculate streak (consecutive weeks with >= 3 workouts)
        // SICK/VACATION weeks don't break the streak, they just don't count
        // Current week only counts if it has >= 3 workouts
        const currentWeekId = getCurrentWeekId();
        const currentWeekData = weeks.get(currentWeekId);
        const currentWeekWorkouts = currentWeekData?.workouts.filter(Boolean).length || 0;
        const currentWeekComplete = currentWeekWorkouts >= 3 && currentWeekData?.status === 'normal';

        // Start checking from previous week
        let checkWeekId = getPreviousWeekId(currentWeekId);
        let isCurrentStreak = true;

        while (true) {
          const weekData = weeks.get(checkWeekId);
          if (!weekData) break;

          // SICK and VACATION weeks are skipped - they don't break or count towards streak
          if (weekData.status === 'sick' || weekData.status === 'vacation') {
            checkWeekId = getPreviousWeekId(checkWeekId);
            continue;
          }

          const weekWorkouts = weekData.workouts.filter(Boolean).length;
          if (weekWorkouts >= 3) {
            tempStreak++;
            if (isCurrentStreak) {
              currentStreak = tempStreak;
            }
          } else {
            isCurrentStreak = false;
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            tempStreak = 0;
          }

          checkWeekId = getPreviousWeekId(checkWeekId);
        }

        // Add current week to streak if it's complete
        if (currentWeekComplete) {
          currentStreak++;
        }

        // Final check for longest streak
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }

        const newStats = { totalWorkouts, currentStreak, longestStreak };
        setStats(newStats);

        // Save to Firestore
        const docRef = doc(db, 'users', user.uid, 'stats', 'current');
        await setDoc(docRef, newStats);
      } catch (error) {
        console.error('Error recalculating stats:', error);
      }
    }
  }, [user]);

  // Update stats (for guest mode or quick updates)
  const updateStats = useCallback(async (workoutDelta: number) => {
    const newStats = {
      ...stats,
      totalWorkouts: Math.max(0, stats.totalWorkouts + workoutDelta),
    };

    setStats(newStats);

    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'stats', 'current');
        await setDoc(docRef, newStats);
      } catch (error) {
        console.error('Error updating stats:', error);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    }
  }, [user, stats]);

  return {
    stats,
    loading,
    updateStats,
    recalculateStats,
  };
}
