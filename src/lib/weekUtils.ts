// ISO Week utilities

/**
 * Get ISO week ID from a date (e.g., "2025-W01")
 */
export function getWeekId(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));

  // Get first day of year
  const yearStart = new Date(d.getFullYear(), 0, 1);

  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Get the Monday (start) of a given ISO week
 */
export function getWeekStart(weekId: string): Date {
  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  // January 4th is always in week 1
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // Make Sunday = 7

  // Get Monday of week 1
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - dayOfWeek + 1);

  // Add weeks
  const targetMonday = new Date(week1Monday);
  targetMonday.setDate(week1Monday.getDate() + (week - 1) * 7);

  return targetMonday;
}

/**
 * Get current week ID
 */
export function getCurrentWeekId(): string {
  return getWeekId(new Date());
}

/**
 * Get week number from week ID
 */
export function getWeekNumber(weekId: string): number {
  const [, weekStr] = weekId.split('-W');
  return parseInt(weekStr, 10);
}

/**
 * Get year from week ID
 */
export function getYearFromWeekId(weekId: string): number {
  const [yearStr] = weekId.split('-W');
  return parseInt(yearStr, 10);
}

/**
 * Get previous week ID
 */
export function getPreviousWeekId(weekId: string): string {
  const weekStart = getWeekStart(weekId);
  weekStart.setDate(weekStart.getDate() - 7);
  return getWeekId(weekStart);
}

/**
 * Get next week ID
 */
export function getNextWeekId(weekId: string): string {
  const weekStart = getWeekStart(weekId);
  weekStart.setDate(weekStart.getDate() + 7);
  return getWeekId(weekStart);
}

/**
 * Format week start date as ISO string (YYYY-MM-DD)
 */
export function formatWeekStartDate(weekId: string): string {
  const start = getWeekStart(weekId);
  return start.toISOString().split('T')[0];
}

/**
 * Get week date range (Monday to Sunday)
 */
export function getWeekDateRange(weekId: string): { start: Date; end: Date } {
  const start = getWeekStart(weekId);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

/**
 * Format date as "6 Jan"
 */
function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return `${day} ${month}`;
}

/**
 * Format week for display
 */
export function formatWeekDisplay(weekId: string): {
  week: number;
  year: number;
  dateRange: string;
} {
  const week = getWeekNumber(weekId);
  const year = getYearFromWeekId(weekId);
  const { start, end } = getWeekDateRange(weekId);
  const dateRange = `${formatShortDate(start)} - ${formatShortDate(end)}`;

  return { week, year, dateRange };
}

/**
 * Check if week ID is the current week
 */
export function isCurrentWeek(weekId: string): boolean {
  return weekId === getCurrentWeekId();
}

/**
 * Check if week ID is in the future
 */
export function isFutureWeek(weekId: string): boolean {
  const currentWeekStart = getWeekStart(getCurrentWeekId());
  const targetWeekStart = getWeekStart(weekId);
  return targetWeekStart > currentWeekStart;
}
