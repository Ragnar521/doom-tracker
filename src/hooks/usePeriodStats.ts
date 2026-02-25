import type { WeekRecord } from './useAllWeeks';
import { getNormalWeeks } from '../lib/timelineUtils';
import { calculateTrend, type TrendData } from '../lib/trendUtils';

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

export interface MonthStatsWithTrends extends MonthStats {
  trendVsPreviousMonth: TrendData | null;
  trendVsYearAgo: TrendData | null;
}

export interface YearStatsWithTrends extends YearStats {
  trendVsPreviousYear: TrendData | null;
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

/**
 * Calculate month statistics with trend comparisons.
 *
 * Compares average workouts per week against:
 * 1. Previous month (e.g., Feb vs Jan)
 * 2. Same month last year (e.g., Feb 2026 vs Feb 2025) - only if data exists
 *
 * Automatically excludes sick/vacation weeks via calculateMonthStats which uses getNormalWeeks.
 *
 * @param currentMonthWeeks - Week records for current month
 * @param previousMonthWeeks - Week records for previous month
 * @param yearAgoMonthWeeks - Week records for same month last year
 * @returns MonthStatsWithTrends including trend comparisons
 */
export function calculateMonthStatsWithTrends(
  currentMonthWeeks: WeekRecord[],
  previousMonthWeeks: WeekRecord[],
  yearAgoMonthWeeks: WeekRecord[]
): MonthStatsWithTrends {
  const currentStats = calculateMonthStats(currentMonthWeeks);
  const previousStats = calculateMonthStats(previousMonthWeeks);
  const yearAgoStats = calculateMonthStats(yearAgoMonthWeeks);

  // Trend vs previous month (only if previous month has data)
  const trendVsPreviousMonth = previousMonthWeeks.length > 0
    ? calculateTrend(currentStats.avgPerWeek, previousStats.avgPerWeek)
    : null;

  // Trend vs year ago (only if year-ago data exists)
  const trendVsYearAgo = yearAgoMonthWeeks.length > 0
    ? calculateTrend(currentStats.avgPerWeek, yearAgoStats.avgPerWeek)
    : null;

  return {
    ...currentStats,
    trendVsPreviousMonth,
    trendVsYearAgo
  };
}

/**
 * Calculate year statistics with trend comparison.
 *
 * Compares average workouts per week against previous year.
 *
 * Automatically excludes sick/vacation weeks via calculateYearStats which uses getNormalWeeks.
 *
 * @param currentYearWeeks - Week records for current year
 * @param previousYearWeeks - Week records for previous year
 * @returns YearStatsWithTrends including trend comparison
 */
export function calculateYearStatsWithTrends(
  currentYearWeeks: WeekRecord[],
  previousYearWeeks: WeekRecord[]
): YearStatsWithTrends {
  const currentStats = calculateYearStats(currentYearWeeks);
  const previousStats = calculateYearStats(previousYearWeeks);

  // Trend vs previous year (only if previous year has data)
  const trendVsPreviousYear = previousYearWeeks.length > 0
    ? calculateTrend(currentStats.avgPerWeek, previousStats.avgPerWeek)
    : null;

  return {
    ...currentStats,
    trendVsPreviousYear
  };
}
