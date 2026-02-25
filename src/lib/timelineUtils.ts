import type { WeekRecord } from '../hooks/useAllWeeks';
import { getWeekStart, getYearFromWeekId } from './weekUtils';

/**
 * Get month (0-11) for a week using ISO Thursday rule.
 *
 * ISO week belongs to the month containing its Thursday (Monday + 3 days).
 * This prevents edge case bugs where Week 1 spans December-January boundary.
 *
 * Example: 2026-W01 spans Dec 29 2025 - Jan 4 2026
 * Thursday = Jan 1 2026 → month = 0 (January)
 *
 * @param weekId - ISO week ID (e.g., "2026-W01")
 * @returns Month index 0-11 (0 = January, 11 = December)
 */
export function getMonthFromWeekId(weekId: string): number {
  const weekStart = getWeekStart(weekId);
  const thursday = new Date(weekStart);
  thursday.setDate(thursday.getDate() + 3); // Mon + 3 = Thu
  return thursday.getMonth(); // 0-11
}

/**
 * Group weeks by year and month for hierarchical timeline navigation.
 *
 * Returns nested Map structure:
 * - Outer Map: year (number) → inner Map
 * - Inner Map: month 0-11 (number) → WeekRecord[]
 *
 * Uses ISO year (from week ID) and ISO Thursday rule for month assignment.
 * This ensures correct grouping across year/month boundaries.
 *
 * @param weeks - Array of week records to group
 * @returns Nested Map structure for year/month hierarchy
 */
export function groupWeeksByYearAndMonth(
  weeks: WeekRecord[]
): Map<number, Map<number, WeekRecord[]>> {
  const groups = new Map<number, Map<number, WeekRecord[]>>();

  weeks.forEach(week => {
    const year = getYearFromWeekId(week.weekId);
    const month = getMonthFromWeekId(week.weekId);

    if (!groups.has(year)) {
      groups.set(year, new Map<number, WeekRecord[]>());
    }
    const yearMap = groups.get(year)!;

    if (!yearMap.has(month)) {
      yearMap.set(month, []);
    }
    yearMap.get(month)!.push(week);
  });

  return groups;
}

/**
 * Filter weeks to only include normal status (exclude sick/vacation).
 *
 * Shared utility for all stat calculations to ensure consistent
 * sick/vacation week handling across the app.
 *
 * @param weeks - Array of week records to filter
 * @returns Array containing only weeks with status === 'normal'
 */
export function getNormalWeeks(weeks: WeekRecord[]): WeekRecord[] {
  return weeks.filter(week => week.status === 'normal');
}
