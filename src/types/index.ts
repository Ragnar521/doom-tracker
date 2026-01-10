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
