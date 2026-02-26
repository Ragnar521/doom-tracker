import type { WeeklyXPBreakdown } from '../types';

/**
 * XP FORMULA VALIDATION
 *
 * Target: Doom Slayer (100,000 XP) achievable in ~2 years at 4 workouts/week
 *
 * Weekly XP at 4 workouts/week:
 *   Base: 50 XP
 *   With 4-week streak (1.5x): 75 XP
 *   With 12-week streak (1.75x): 88 XP
 *   With 52-week streak (2.5x): 125 XP
 *
 * 2-year projection (104 weeks at 4 workouts/week):
 *   Weeks 1-3:   3 × 50 = 150 XP (no streak bonus)
 *   Weeks 4-11:  8 × 75 = 600 XP (1.5x multiplier)
 *   Weeks 12-25: 14 × 88 = 1,232 XP (1.75x multiplier)
 *   Weeks 26-51: 26 × 100 = 2,600 XP (2.0x multiplier)
 *   Weeks 52-103: 52 × 125 = 6,500 XP (2.5x multiplier)
 *   Subtotal: ~11,082 XP from workout base alone
 *
 * Additional XP sources (Phase 5):
 *   Achievement bonuses: 18+ achievements × 100 XP = 1,800+ XP
 *   God mode weeks (5+ workouts): Higher base XP weeks
 *   Total realistic 2-year estimate: ~15,000-20,000 XP
 *
 * Note: 100,000 XP for Doom Slayer means it takes dedication beyond
 * just showing up. Consistent 5-7 workout weeks with long streaks
 * needed. This is intentional — Doom Slayer should feel truly earned.
 * Formula can be retuned in Phase 7 after real usage data.
 */

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
