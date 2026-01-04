import type { WeekRecord, DashboardStats } from '../hooks/useAllWeeks';

// Import achievement icons
import firstBlood from '../assets/achievements/first_blood.png';
import weekWarrior from '../assets/achievements/week_warrior.png';
import consistency from '../assets/achievements/consistency.png';
import monthOfPain from '../assets/achievements/month_of_pain.png';
import quarterBeast from '../assets/achievements/quarter_beast.png';
import halfYearHero from '../assets/achievements/half_year_hero.png';
import yearOfBeast from '../assets/achievements/year_of_beast.png';
import godMode from '../assets/achievements/god_mode.png';
import overachiever from '../assets/achievements/overachiever.png';
import unstoppable from '../assets/achievements/unstoppable.png';
import centuryClub from '../assets/achievements/century_club.png';
import beastMilestone from '../assets/achievements/beast_milestone.png';
import gymRat from '../assets/achievements/gym_rat.png';
import legend from '../assets/achievements/legend.png';
import speedDemon from '../assets/achievements/speed_demon.png';
import mondayMotivation from '../assets/achievements/monday_motivation.png';
import weekendWarrior from '../assets/achievements/weekend_warrior.png';
import comebackKid from '../assets/achievements/comeback_kid.png';

export type AchievementCategory = 'streak' | 'performance' | 'special' | 'hidden';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconSrc: string;
  category: AchievementCategory;
  condition: (stats: DashboardStats, weeks: WeekRecord[]) => boolean;
  progress?: (stats: DashboardStats, weeks: WeekRecord[]) => { current: number; target: number };
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: Date;
}

// Helper functions
const countGodModeWeeks = (weeks: WeekRecord[]): number => {
  return weeks.filter(w => w.status === 'normal' && w.workoutCount >= 5).length;
};

const countConsecutiveGodModeWeeks = (weeks: WeekRecord[]): number => {
  let max = 0;
  let current = 0;

  // Sort by weekId descending
  const sorted = [...weeks].sort((a, b) => b.weekId.localeCompare(a.weekId));

  for (const week of sorted) {
    if (week.status === 'normal' && week.workoutCount >= 5) {
      current++;
      max = Math.max(max, current);
    } else if (week.status === 'normal') {
      current = 0;
    }
    // Skip sick/vacation weeks
  }

  return max;
};

const hasEarlyWeekWorkouts = (weeks: WeekRecord[]): boolean => {
  // Check if any week has 3 workouts by Wednesday (Mon, Tue, Wed = indices 0, 1, 2)
  return weeks.some(w => {
    const earlyWorkouts = w.workouts.slice(0, 3).filter(Boolean).length;
    return earlyWorkouts >= 3;
  });
};

const countMondayWorkouts = (weeks: WeekRecord[]): number => {
  return weeks.filter(w => w.workouts[0]).length;
};

const countWeekendWorkouts = (weeks: WeekRecord[]): number => {
  return weeks.reduce((count, w) => {
    const satSun = (w.workouts[5] ? 1 : 0) + (w.workouts[6] ? 1 : 0);
    return count + satSun;
  }, 0);
};

const hasComeback = (weeks: WeekRecord[]): boolean => {
  const sorted = [...weeks].sort((a, b) => a.weekId.localeCompare(b.weekId));

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if ((prev.status === 'sick' || prev.status === 'vacation') &&
        curr.status === 'normal' && curr.workoutCount >= 3) {
      return true;
    }
  }

  return false;
};

// All achievements definitions
export const ACHIEVEMENTS: Achievement[] = [
  // STREAK
  {
    id: 'FIRST_BLOOD',
    name: 'FIRST BLOOD',
    description: 'Complete your first workout',
    iconSrc: firstBlood,
    category: 'streak',
    condition: (stats) => stats.totalWorkouts >= 1,
  },
  {
    id: 'WEEK_WARRIOR',
    name: 'WEEK WARRIOR',
    description: 'Complete 3+ workouts in a week',
    iconSrc: weekWarrior,
    category: 'streak',
    condition: (stats) => stats.successRate > 0,
  },
  {
    id: 'CONSISTENCY',
    name: 'CONSISTENCY',
    description: '4 weeks in a row with 3+ workouts',
    iconSrc: consistency,
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 4 || stats.longestStreak >= 4,
    progress: (stats) => ({ current: Math.max(stats.currentStreak, stats.longestStreak), target: 4 }),
  },
  {
    id: 'MONTH_OF_PAIN',
    name: 'MONTH OF PAIN',
    description: '4+ weeks streak',
    iconSrc: monthOfPain,
    category: 'streak',
    condition: (stats) => stats.longestStreak >= 4,
    progress: (stats) => ({ current: stats.longestStreak, target: 4 }),
  },
  {
    id: 'QUARTER_BEAST',
    name: 'QUARTER BEAST',
    description: '12 weeks streak',
    iconSrc: quarterBeast,
    category: 'streak',
    condition: (stats) => stats.longestStreak >= 12,
    progress: (stats) => ({ current: stats.longestStreak, target: 12 }),
  },
  {
    id: 'HALF_YEAR_HERO',
    name: 'HALF YEAR HERO',
    description: '26 weeks streak',
    iconSrc: halfYearHero,
    category: 'streak',
    condition: (stats) => stats.longestStreak >= 26,
    progress: (stats) => ({ current: stats.longestStreak, target: 26 }),
  },
  {
    id: 'YEAR_OF_BEAST',
    name: 'YEAR OF BEAST',
    description: '52 weeks streak - One full year!',
    iconSrc: yearOfBeast,
    category: 'streak',
    condition: (stats) => stats.longestStreak >= 52,
    progress: (stats) => ({ current: stats.longestStreak, target: 52 }),
  },

  // PERFORMANCE
  {
    id: 'GOD_MODE_ACTIVATED',
    name: 'GOD MODE ACTIVATED',
    description: 'Complete 5-6 workouts in a week',
    iconSrc: godMode,
    category: 'performance',
    condition: (_, weeks) => countGodModeWeeks(weeks) >= 1,
  },
  {
    id: 'OVERACHIEVER',
    name: 'OVERACHIEVER',
    description: '5 God Mode weeks total',
    iconSrc: overachiever,
    category: 'performance',
    condition: (_, weeks) => countGodModeWeeks(weeks) >= 5,
    progress: (_, weeks) => ({ current: countGodModeWeeks(weeks), target: 5 }),
  },
  {
    id: 'UNSTOPPABLE',
    name: 'UNSTOPPABLE',
    description: '3 God Mode weeks in a row',
    iconSrc: unstoppable,
    category: 'performance',
    condition: (_, weeks) => countConsecutiveGodModeWeeks(weeks) >= 3,
    progress: (_, weeks) => ({ current: countConsecutiveGodModeWeeks(weeks), target: 3 }),
  },
  {
    id: 'CENTURY_CLUB',
    name: 'CENTURY CLUB',
    description: '100 workouts total',
    iconSrc: centuryClub,
    category: 'performance',
    condition: (stats) => stats.totalWorkouts >= 100,
    progress: (stats) => ({ current: stats.totalWorkouts, target: 100 }),
  },
  {
    id: 'BEAST_MILESTONE',
    name: 'BEAST MILESTONE',
    description: '250 workouts total',
    iconSrc: beastMilestone,
    category: 'performance',
    condition: (stats) => stats.totalWorkouts >= 250,
    progress: (stats) => ({ current: stats.totalWorkouts, target: 250 }),
  },
  {
    id: 'GYM_RAT',
    name: 'GYM RAT',
    description: '500 workouts total',
    iconSrc: gymRat,
    category: 'performance',
    condition: (stats) => stats.totalWorkouts >= 500,
    progress: (stats) => ({ current: stats.totalWorkouts, target: 500 }),
  },
  {
    id: 'LEGEND',
    name: 'LEGEND',
    description: '1000 workouts - True dedication!',
    iconSrc: legend,
    category: 'performance',
    condition: (stats) => stats.totalWorkouts >= 1000,
    progress: (stats) => ({ current: stats.totalWorkouts, target: 1000 }),
  },

  // SPECIAL
  {
    id: 'SPEED_DEMON',
    name: 'SPEED DEMON',
    description: '3 workouts by Wednesday',
    iconSrc: speedDemon,
    category: 'special',
    condition: (_, weeks) => hasEarlyWeekWorkouts(weeks),
  },
  {
    id: 'MONDAY_MOTIVATION',
    name: 'MONDAY MOTIVATION',
    description: '10 Monday workouts',
    iconSrc: mondayMotivation,
    category: 'special',
    condition: (_, weeks) => countMondayWorkouts(weeks) >= 10,
    progress: (_, weeks) => ({ current: countMondayWorkouts(weeks), target: 10 }),
  },
  {
    id: 'WEEKEND_WARRIOR',
    name: 'WEEKEND WARRIOR',
    description: '10 weekend workouts',
    iconSrc: weekendWarrior,
    category: 'special',
    condition: (_, weeks) => countWeekendWorkouts(weeks) >= 10,
    progress: (_, weeks) => ({ current: countWeekendWorkouts(weeks), target: 10 }),
  },
  {
    id: 'COMEBACK_KID',
    name: 'COMEBACK KID',
    description: 'Hit target after sick/vacation week',
    iconSrc: comebackKid,
    category: 'special',
    condition: (_, weeks) => hasComeback(weeks),
  },

  // HIDDEN - uses legend icon as fallback (no dedicated icon)
  {
    id: 'PERFECT_MONTH',
    name: 'PERFECT MONTH',
    description: '4 consecutive weeks with 4+ workouts',
    iconSrc: legend,
    category: 'hidden',
    condition: (_, weeks) => {
      const sorted = [...weeks]
        .filter(w => w.status === 'normal')
        .sort((a, b) => b.weekId.localeCompare(a.weekId));

      let consecutive = 0;
      for (const week of sorted) {
        if (week.workoutCount >= 4) {
          consecutive++;
          if (consecutive >= 4) return true;
        } else {
          consecutive = 0;
        }
      }
      return false;
    },
  },
];

// Get achievement by ID
export const getAchievement = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

// Get achievements by category
export const getAchievementsByCategory = (category: AchievementCategory): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

// Check which achievements are newly unlocked
export const checkNewAchievements = (
  stats: DashboardStats,
  weeks: WeekRecord[],
  alreadyUnlocked: string[]
): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => {
    // Skip if already unlocked
    if (alreadyUnlocked.includes(achievement.id)) return false;

    // Check condition
    return achievement.condition(stats, weeks);
  });
};
