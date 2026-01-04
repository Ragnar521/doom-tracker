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
