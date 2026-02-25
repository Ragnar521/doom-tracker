import { useMemo } from 'react';
import { useAllWeeks, type WeekRecord } from './useAllWeeks';
import { getCurrentWeekId } from '../lib/weekUtils';
import { groupWeeksByYearAndMonth } from '../lib/timelineUtils';

/**
 * Timeline data structure for lazy access to historical workout data.
 *
 * Provides year/month grouped week data with efficient client-side grouping.
 * Lazy loading architecture: data is grouped in memory only when accessed.
 */
export interface TimelineData {
  /** Current week ID (e.g., "2026-W08") */
  currentWeekId: string;

  /** Available years sorted newest first (e.g., [2026, 2025, 2024]) */
  availableYears: number[];

  /** Get all weeks for a specific year */
  getYearWeeks: (year: number) => WeekRecord[];

  /** Get all weeks for a specific month within a year */
  getMonthWeeks: (year: number, month: number) => WeekRecord[];

  /** Year/month hierarchy for direct access to grouped data */
  yearMonthGroups: Map<number, Map<number, WeekRecord[]>>;
}

/**
 * Hook for lazy timeline data access with year/month grouping.
 *
 * Data flow:
 * 1. useAllWeeks() fetches all week records (already lazy loads from Firebase)
 * 2. useMemo groups weeks client-side (instant for <1000 weeks)
 * 3. Provides getter functions for year/month filtered data
 * 4. Auto-recalculates when week data changes
 *
 * Performance:
 * - Client-side grouping is instant (<10ms for 100 weeks)
 * - useMemo caches result until weeks array changes
 * - No additional Firebase queries needed
 *
 * @returns TimelineData with current week, available years, and getter functions
 */
export function useTimelineData(): TimelineData {
  const { weeks } = useAllWeeks();
  const currentWeekId = getCurrentWeekId();

  // Group weeks by year and month (cached until weeks changes)
  const yearMonthGroups = useMemo(
    () => groupWeeksByYearAndMonth(weeks),
    [weeks]
  );

  // Extract available years, sorted newest first
  const availableYears = useMemo(
    () => Array.from(yearMonthGroups.keys()).sort((a, b) => b - a),
    [yearMonthGroups]
  );

  // Get all weeks for a specific year (flattens all months)
  const getYearWeeks = useMemo(
    () => (year: number): WeekRecord[] => {
      const monthMap = yearMonthGroups.get(year);
      if (!monthMap) return [];
      return Array.from(monthMap.values()).flat();
    },
    [yearMonthGroups]
  );

  // Get all weeks for a specific month within a year
  const getMonthWeeks = useMemo(
    () => (year: number, month: number): WeekRecord[] => {
      return yearMonthGroups.get(year)?.get(month) || [];
    },
    [yearMonthGroups]
  );

  return {
    currentWeekId,
    availableYears,
    getYearWeeks,
    getMonthWeeks,
    yearMonthGroups,
  };
}
