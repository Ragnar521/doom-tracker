import { useMemo } from 'react';
import { type WeekRecord } from './useAllWeeks';
import { getNormalWeeks } from '../lib/timelineUtils';

export interface GlobalTrendData {
  allTimeAverage: number;
  consistencyRate: number;
  totalNormalWeeks: number;
}

/**
 * Calculate global trend statistics across all historical data.
 *
 * Provides all-time benchmarks for comparison:
 * - All-time average workouts per week (across all normal weeks)
 * - Consistency rate (percentage of weeks with 3+ workouts)
 * - Total normal weeks counted (excludes sick/vacation)
 *
 * Excludes sick/vacation weeks from all calculations to ensure fair comparisons.
 * Memoized to prevent recalculation on every render - only updates when weeks array changes.
 *
 * @param weeks - Array of all week records (from useAllWeeks)
 * @returns GlobalTrendData with all-time benchmarks
 */
export function useTrendData(weeks: WeekRecord[]): GlobalTrendData {

  return useMemo(() => {
    const normalWeeks = getNormalWeeks(weeks);

    if (normalWeeks.length === 0) {
      return {
        allTimeAverage: 0,
        consistencyRate: 0,
        totalNormalWeeks: 0
      };
    }

    // All-time average: total workouts / total normal weeks
    const totalWorkouts = normalWeeks.reduce((sum, w) => sum + w.workoutCount, 0);
    const allTimeAverage = totalWorkouts / normalWeeks.length;

    // Consistency rate: percentage of weeks with 3+ workouts
    const successfulWeeks = normalWeeks.filter(w => w.workoutCount >= 3).length;
    const consistencyRate = (successfulWeeks / normalWeeks.length) * 100;

    return {
      allTimeAverage,
      consistencyRate,
      totalNormalWeeks: normalWeeks.length
    };
  }, [weeks]);
}
