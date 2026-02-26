import type { WeeklyXPBreakdown } from '../types';

/**
 * Calculate base XP earned for a given number of workouts in a week.
 * Non-linear scaling rewards consistency with inflection at 3 workouts (minimum target).
 *
 * @param workoutCount - Number of workouts completed (0-7)
 * @returns Base XP before streak multiplier
 */
export function calculateWeeklyBaseXP(workoutCount: number): number {
  // Clamp to valid range
  if (workoutCount <= 0) return 0;
  if (workoutCount >= 7) return 100;

  // Non-linear scaling with inflection at 3 workouts
  if (workoutCount === 1) return 5;
  if (workoutCount === 2) return 15;
  if (workoutCount === 3) return 30;  // Minimum target (inflection point)
  if (workoutCount === 4) return 50;  // Ideal target
  if (workoutCount === 5) return 80;
  if (workoutCount === 6) return 100; // God mode reward

  return 0; // Should never reach here
}

/**
 * Calculate streak multiplier based on consecutive successful weeks.
 * Tiered bonuses reward long-term consistency without exponential growth.
 *
 * @param streakWeeks - Number of consecutive weeks with 3+ workouts
 * @returns Multiplier to apply to base XP (1.0x - 2.5x, capped)
 */
export function calculateStreakMultiplier(streakWeeks: number): number {
  // No bonus for negative or zero streaks
  if (streakWeeks <= 0) return 1.0;

  // Descending tier check (highest first)
  if (streakWeeks >= 52) return 2.5;  // 1 year streak (CAPPED)
  if (streakWeeks >= 26) return 2.0;  // 6 month streak
  if (streakWeeks >= 12) return 1.75; // 3 month streak
  if (streakWeeks >= 4) return 1.5;   // 1 month streak

  return 1.0; // 0-3 weeks: no bonus
}

/**
 * Calculate total weekly XP combining base XP and streak multiplier.
 * Sick/vacation weeks earn 0 XP regardless of workout count.
 *
 * @param workoutCount - Number of workouts completed (0-7)
 * @param streakWeeks - Number of consecutive weeks with 3+ workouts
 * @param weekStatus - Week status ('normal' | 'sick' | 'vacation')
 * @returns Total XP earned for the week (rounded to integer)
 */
export function calculateWeeklyXP(
  workoutCount: number,
  streakWeeks: number,
  weekStatus: 'normal' | 'sick' | 'vacation'
): number {
  // Sick/vacation weeks earn 0 XP
  if (weekStatus !== 'normal') return 0;

  // Calculate base XP and apply streak multiplier
  const baseXP = calculateWeeklyBaseXP(workoutCount);
  const multiplier = calculateStreakMultiplier(streakWeeks);

  // Round to prevent floating-point display issues
  return Math.round(baseXP * multiplier);
}

/**
 * Get detailed XP breakdown for UI tooltip display.
 * Returns decomposed values showing base XP, multiplier, and total.
 *
 * @param workoutCount - Number of workouts completed (0-7)
 * @param streakWeeks - Number of consecutive weeks with 3+ workouts
 * @param weekStatus - Week status ('normal' | 'sick' | 'vacation')
 * @returns XP breakdown object for tooltip rendering
 */
export function getWeeklyXPBreakdown(
  workoutCount: number,
  streakWeeks: number,
  weekStatus: 'normal' | 'sick' | 'vacation'
): WeeklyXPBreakdown {
  // Sick/vacation weeks return zero breakdown
  if (weekStatus !== 'normal') {
    return {
      baseXP: 0,
      streakMultiplier: 1.0,
      totalXP: 0,
    };
  }

  // Calculate breakdown components
  const baseXP = calculateWeeklyBaseXP(workoutCount);
  const streakMultiplier = calculateStreakMultiplier(streakWeeks);
  const totalXP = Math.round(baseXP * streakMultiplier);

  return {
    baseXP,
    streakMultiplier,
    totalXP,
    // achievementBonus intentionally omitted (added in Phase 5)
  };
}
