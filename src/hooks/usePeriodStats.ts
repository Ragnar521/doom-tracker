import type { WeekRecord } from './useAllWeeks';
import { getNormalWeeks } from '../lib/timelineUtils';

export interface MonthStats {
  totalWorkouts: number;
  avgPerWeek: number;
  successRate: number;
  bestWeek: { weekId: string; count: number } | null;
}

export interface YearStats {
  totalWorkouts: number;
  avgPerWeek: number;
  successRate: number;
  longestStreak: number;
  bestWeek: { weekId: string; count: number } | null;
  godModeCount: number;
}

/**
 * Calculate month summary statistics.
 * Excludes sick/vacation weeks from averages and success rate.
 *
 * @param weeks - Array of week records for the month
 * @returns MonthStats with 4 summary statistics
 */
export function calculateMonthStats(weeks: WeekRecord[]): MonthStats {
  const normalWeeks = getNormalWeeks(weeks);

  if (normalWeeks.length === 0) {
    return {
      totalWorkouts: 0,
      avgPerWeek: 0,
      successRate: 0,
      bestWeek: null,
    };
  }

  const totalWorkouts = normalWeeks.reduce((sum, w) => sum + w.workoutCount, 0);
  const avgPerWeek = totalWorkouts / normalWeeks.length;
  const successfulWeeks = normalWeeks.filter(w => w.workoutCount >= 3).length;
  const successRate = (successfulWeeks / normalWeeks.length) * 100;

  let bestWeek: { weekId: string; count: number } | null = null;
  normalWeeks.forEach(w => {
    if (!bestWeek || w.workoutCount > bestWeek.count) {
      bestWeek = { weekId: w.weekId, count: w.workoutCount };
    }
  });

  return { totalWorkouts, avgPerWeek, successRate, bestWeek };
}

/**
 * Calculate year summary statistics.
 * Includes longest streak and God Mode count in addition to month stats.
 * Excludes sick/vacation weeks from all calculations.
 *
 * @param weeks - Array of week records for the year
 * @returns YearStats with 6 summary statistics
 */
export function calculateYearStats(weeks: WeekRecord[]): YearStats {
  const monthStats = calculateMonthStats(weeks);
  const normalWeeks = getNormalWeeks(weeks);

  // Calculate longest streak (adapted from useAllWeeks.ts)
  // Sort weeks chronologically for accurate streak calculation
  const sortedWeeks = [...normalWeeks].sort((a, b) => a.weekId.localeCompare(b.weekId));

  let currentStreak = 0;
  let longestStreak = 0;

  sortedWeeks.forEach(week => {
    if (week.workoutCount >= 3) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  // Count God Mode weeks (5+ workouts)
  const godModeCount = normalWeeks.filter(w => w.workoutCount >= 5).length;

  return {
    ...monthStats,
    longestStreak,
    godModeCount,
  };
}
