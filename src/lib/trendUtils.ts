/**
 * Trend calculation utilities for comparing performance across periods.
 *
 * Provides percentage change calculations with comprehensive edge case handling
 * for comparing workout statistics between different time periods.
 */

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number | 'infinity';
  display: string;
}

/**
 * Calculate percentage change between two values with full edge case handling.
 *
 * Handles:
 * - Division by zero → infinity symbol (↑ ∞)
 * - Both values zero → stable trend (→ 0%)
 * - Negative changes → down arrow with negative percentage
 * - Missing previous → null (no trend available)
 *
 * Percentage formula: ((current - previous) / previous) * 100
 * Rounded to whole numbers using Math.round() for clean UI display.
 *
 * @param current - Current period value (e.g., avgPerWeek)
 * @param previous - Previous period value for comparison
 * @returns TrendData with direction, percentage, and formatted display string, or null if no previous data
 */
export function calculateTrend(
  current: number,
  previous: number | null | undefined
): TrendData | null {
  // No previous period available
  if (previous === null || previous === undefined) {
    return null;
  }

  // Division by zero case
  if (previous === 0) {
    if (current === 0) {
      // Both zero = no change
      return { direction: 'stable', percentage: 0, display: '→ 0%' };
    }
    // Coming from zero = infinity increase
    return { direction: 'up', percentage: 'infinity', display: '↑ ∞' };
  }

  // Standard percentage change
  const percentChange = ((current - previous) / previous) * 100;
  const rounded = Math.round(percentChange);

  // Determine direction and arrow
  let direction: 'up' | 'down' | 'stable';
  let arrow: string;

  if (rounded > 0) {
    direction = 'up';
    arrow = '↑'; // U+2191
  } else if (rounded < 0) {
    direction = 'down';
    arrow = '↓'; // U+2193
  } else {
    direction = 'stable';
    arrow = '→'; // U+2192
  }

  // Format with sign (+ for positive, - automatic for negative)
  const sign = rounded > 0 ? '+' : '';
  const display = `${arrow} ${sign}${rounded}%`;

  return { direction, percentage: rounded, display };
}
