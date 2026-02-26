import type { Rank, LevelUpEvent } from '../types';

/**
 * All 15 DOOM military ranks with exponential XP thresholds
 * Balanced for ~2 years to reach Doom Slayer at 4 workouts/week
 */
export const RANKS: Rank[] = [
  {
    id: 1,
    name: 'Private',
    xpThreshold: 0,
    color: 'text-gray-400',
    tagline: 'Fresh meat',
  },
  {
    id: 2,
    name: 'Corporal',
    xpThreshold: 100,
    color: 'text-gray-300',
    tagline: 'Learning the ropes',
  },
  {
    id: 3,
    name: 'Sergeant',
    xpThreshold: 300,
    color: 'text-green-400',
    tagline: 'Getting stronger',
  },
  {
    id: 4,
    name: 'Lieutenant',
    xpThreshold: 650,
    color: 'text-green-300',
    tagline: 'Leading by example',
  },
  {
    id: 5,
    name: 'Captain',
    xpThreshold: 1200,
    color: 'text-blue-400',
    tagline: 'Combat veteran',
  },
  {
    id: 6,
    name: 'Major',
    xpThreshold: 2000,
    color: 'text-blue-300',
    tagline: 'Proven warrior',
  },
  {
    id: 7,
    name: 'Colonel',
    xpThreshold: 3200,
    color: 'text-purple-400',
    tagline: 'Elite marine',
  },
  {
    id: 8,
    name: 'Commander',
    xpThreshold: 5000,
    color: 'text-purple-300',
    tagline: 'Squad leader',
  },
  {
    id: 9,
    name: 'Knight',
    xpThreshold: 7500,
    color: 'text-yellow-400',
    tagline: 'Night Sentinel initiate',
  },
  {
    id: 10,
    name: 'Sentinel',
    xpThreshold: 11000,
    color: 'text-yellow-300',
    tagline: 'Argent warrior',
  },
  {
    id: 11,
    name: 'Paladin',
    xpThreshold: 16000,
    color: 'text-orange-400',
    tagline: 'Holy crusader',
  },
  {
    id: 12,
    name: 'Warlord',
    xpThreshold: 23000,
    color: 'text-orange-300',
    tagline: 'Demon hunter',
  },
  {
    id: 13,
    name: 'Hellwalker',
    xpThreshold: 33000,
    color: 'text-red-400',
    tagline: 'Unchained predator',
  },
  {
    id: 14,
    name: 'Slayer',
    xpThreshold: 50000,
    color: 'text-red-300',
    tagline: 'The only thing they fear',
  },
  {
    id: 15,
    name: 'Doom Slayer',
    xpThreshold: 100000,
    color: 'text-doom-gold',
    tagline: 'Rip and tear, until it is done',
  },
];

/**
 * Get rank for given XP amount
 * Returns highest rank where totalXP >= xpThreshold
 */
export function getRankForXP(totalXP: number): Rank {
  // Iterate in reverse to find highest qualifying rank
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= RANKS[i].xpThreshold) {
      return RANKS[i];
    }
  }
  // Default to Private if no match (should never happen)
  return RANKS[0];
}

/**
 * Get next rank after current rank
 * Returns null if already at max rank
 */
export function getNextRank(currentRankId: number): Rank | null {
  const nextRank = RANKS.find(r => r.id === currentRankId + 1);
  return nextRank || null;
}

/**
 * Calculate XP needed to reach next rank
 * Returns 0 if already at max rank
 */
export function getXPToNextRank(totalXP: number, currentRank: Rank): number {
  const nextRank = getNextRank(currentRank.id);
  if (!nextRank) return 0;

  return Math.max(0, nextRank.xpThreshold - totalXP);
}

/**
 * Check if XP increase resulted in a rank-up
 * Returns LevelUpEvent if rank changed, null otherwise
 */
export function checkRankUp(previousXP: number, newXP: number): LevelUpEvent | null {
  const previousRank = getRankForXP(previousXP);
  const newRank = getRankForXP(newXP);

  // Rank-up occurred if new rank ID is higher
  if (newRank.id > previousRank.id) {
    return {
      previousRank,
      newRank,
      totalXP: newXP,
      timestamp: new Date(),
    };
  }

  return null;
}
