import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getPreviousWeekId, getCurrentWeekId } from '../lib/weekUtils';
import type { WeekStatus } from './useWeek';

export interface WeekRecord {
  weekId: string;
  workouts: boolean[];
  status: WeekStatus;
  workoutCount: number;
}

export interface DashboardStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  averagePerWeek: number;
  successRate: number;
  bestWeek: { weekId: string; count: number } | null;
  totalWeeks: number;
  dayFrequency: number[]; // 7 values for each day of week
  recentWeeks: WeekRecord[]; // Last 12 weeks
}

export function useAllWeeks() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<WeekRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeeks = async () => {
      setLoading(true);

      if (user) {
        try {
          const weeksRef = collection(db, 'users', user.uid, 'weeks');
          const q = query(weeksRef, orderBy('startDate', 'desc'));
          const snapshot = await getDocs(q);

          const loadedWeeks: WeekRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loadedWeeks.push({
              weekId: docSnap.id,
              workouts: data.workouts || [false, false, false, false, false, false, false],
              status: data.status || 'normal',
              workoutCount: (data.workouts || []).filter(Boolean).length,
            });
          });

          setWeeks(loadedWeeks);
        } catch (error) {
          console.error('Error loading weeks:', error);
        }
      } else {
        // Load from localStorage for guest mode
        const allWeeks: WeekRecord[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('doom-tracker-week-')) {
            try {
              const weekId = key.replace('doom-tracker-week-', '');
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              allWeeks.push({
                weekId,
                workouts: data.workouts || [false, false, false, false, false, false, false],
                status: data.status || 'normal',
                workoutCount: (data.workouts || []).filter(Boolean).length,
              });
            } catch {
              // Skip invalid entries
            }
          }
        }
        setWeeks(allWeeks);
      }

      setLoading(false);
    };

    loadWeeks();
  }, [user]);

  const stats = useMemo<DashboardStats>(() => {
    if (weeks.length === 0) {
      return {
        totalWorkouts: 0,
        currentStreak: 0,
        longestStreak: 0,
        averagePerWeek: 0,
        successRate: 0,
        bestWeek: null,
        totalWeeks: 0,
        dayFrequency: [0, 0, 0, 0, 0, 0, 0],
        recentWeeks: [],
      };
    }

    // Build week map
    const weekMap = new Map<string, WeekRecord>();
    weeks.forEach((w) => weekMap.set(w.weekId, w));

    // Total workouts
    const totalWorkouts = weeks.reduce((sum, w) => sum + w.workoutCount, 0);

    // Total weeks (only normal status weeks count)
    const normalWeeks = weeks.filter((w) => w.status === 'normal');
    const totalWeeks = normalWeeks.length;

    // Average per week
    const averagePerWeek = totalWeeks > 0 ? totalWorkouts / totalWeeks : 0;

    // Success rate (weeks with 3+ workouts)
    const successfulWeeks = normalWeeks.filter((w) => w.workoutCount >= 3).length;
    const successRate = totalWeeks > 0 ? (successfulWeeks / totalWeeks) * 100 : 0;

    // Best week
    let bestWeek: { weekId: string; count: number } | null = null;
    weeks.forEach((w) => {
      if (!bestWeek || w.workoutCount > bestWeek.count) {
        bestWeek = { weekId: w.weekId, count: w.workoutCount };
      }
    });

    // Day frequency
    const dayFrequency = [0, 0, 0, 0, 0, 0, 0];
    weeks.forEach((w) => {
      w.workouts.forEach((completed, idx) => {
        if (completed) dayFrequency[idx]++;
      });
    });

    // Streaks
    // Current week only counts if it has >= 3 workouts
    const currentWeekId = getCurrentWeekId();
    const currentWeekData = weekMap.get(currentWeekId);
    const currentWeekComplete = currentWeekData && currentWeekData.workoutCount >= 3 && currentWeekData.status === 'normal';

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let isCurrentStreak = true;

    // Start checking from previous week
    let checkWeekId = getPreviousWeekId(currentWeekId);
    const maxIterations = 200; // Prevent infinite loop
    let iterations = 0;

    while (iterations < maxIterations) {
      const weekData = weekMap.get(checkWeekId);

      if (!weekData) {
        break;
      }

      // Skip sick/vacation weeks
      if (weekData.status === 'sick' || weekData.status === 'vacation') {
        checkWeekId = getPreviousWeekId(checkWeekId);
        iterations++;
        continue;
      }

      if (weekData.workoutCount >= 3) {
        tempStreak++;
        if (isCurrentStreak) {
          currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        isCurrentStreak = false;
        tempStreak = 0;
      }

      checkWeekId = getPreviousWeekId(checkWeekId);
      iterations++;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Add current week to streak if it's complete
    if (currentWeekComplete) {
      currentStreak++;
    }

    // Recent weeks (last 12)
    const recentWeeks: WeekRecord[] = [];
    let recentWeekId = getCurrentWeekId();
    for (let i = 0; i < 12; i++) {
      const weekData = weekMap.get(recentWeekId);
      recentWeeks.push(
        weekData || {
          weekId: recentWeekId,
          workouts: [false, false, false, false, false, false, false],
          status: 'normal',
          workoutCount: 0,
        }
      );
      recentWeekId = getPreviousWeekId(recentWeekId);
    }

    return {
      totalWorkouts,
      currentStreak,
      longestStreak,
      averagePerWeek,
      successRate,
      bestWeek,
      totalWeeks,
      dayFrequency,
      recentWeeks,
    };
  }, [weeks]);

  return {
    weeks,
    stats,
    loading,
  };
}
