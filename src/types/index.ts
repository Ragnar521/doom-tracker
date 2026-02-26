export interface WorkoutDay {
  day: number; // 1-7 (Po-Ne)
  completed: boolean;
}

export interface WorkoutStats {
  currentWeekWorkouts: number;
  streak: number; // počet týdnů za sebou s alespoň 3 workouty
  totalWorkouts: number;
}

export type FaceState =
  | 'critical'    // 0 workouts
  | 'hurt'        // 1 workout
  | 'damaged'     // 2 workouts
  | 'healthy'     // 3 workouts
  | 'strong'      // 4 workouts
  | 'godmode';    // 5-7 workouts

export type FaceDirection = 'center' | 'left' | 'right' | 'ouch';

export interface FriendProfile {
  uid: string;
  friendCode: string;
  displayName: string;
  photoURL: string | null;
  addedAt: Date;
  // Denormalized rank data (synced on rank change)
  currentRankId?: number;
  currentRankAbbrev?: string;
}

export interface FriendStats {
  currentWeekWorkouts: number;
  currentWeekWorkoutDays: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  currentStreak: number;
  totalWorkouts: number;
  faceState: FaceState;
}

export interface Friend extends FriendProfile {
  stats: FriendStats | null;
}

/**
 * Rank definition for DOOM military progression
 */
export interface Rank {
  id: number;
  name: string;
  xpThreshold: number;
  color: string;      // Tailwind color class (e.g., 'text-gray-400')
  tagline: string;    // DOOM-flavored description
}

/**
 * XP data stored in Firestore stats/current document (Phase 5)
 */
export interface XPData {
  totalXP: number;           // Lifetime XP accumulation
  currentRankId: number;     // Current rank (1-15)
  lastRankUpAt?: Date;       // Timestamp of most recent rank-up
}

/**
 * Level-up event for notifications (Phase 6)
 */
export interface LevelUpEvent {
  previousRank: Rank;
  newRank: Rank;
  totalXP: number;
  timestamp: Date;
}

/**
 * Weekly XP breakdown for tooltip display (Phase 6)
 */
export interface WeeklyXPBreakdown {
  baseXP: number;
  streakMultiplier: number;
  totalXP: number;
  achievementBonus?: number;  // Added in Phase 5
}
