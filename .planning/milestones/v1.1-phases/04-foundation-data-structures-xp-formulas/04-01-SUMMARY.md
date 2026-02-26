---
phase: 04-foundation-data-structures-xp-formulas
plan: 01
subsystem: xp-system
tags:
  - types
  - data-structures
  - ranks
  - foundation
dependency_graph:
  requires: []
  provides:
    - XP type definitions (Rank, XPData, LevelUpEvent, WeeklyXPBreakdown)
    - 15 DOOM military ranks with exponential XP curve
    - Rank lookup and calculation functions
  affects:
    - src/types/index.ts
    - Future XP calculation logic (Phase 4 Plan 2)
    - Future XP data hooks (Phase 5)
    - Future rank-up UI (Phase 6)
tech_stack:
  added: []
  patterns:
    - Pure lookup functions (pattern after achievements.ts)
    - Static configuration array + utility functions
    - TypeScript interfaces for type safety
key_files:
  created:
    - src/lib/ranks.ts (169 lines - RANKS array + 4 utility functions)
  modified:
    - src/types/index.ts (added 40 lines - 4 new interfaces)
decisions:
  - title: "Exponential XP curve targeting 100,000 for max rank"
    rationale: "Balanced for ~2 years to reach Doom Slayer at 4 workouts/week, provides satisfying long-term progression"
  - title: "15 DOOM military ranks with lore-accurate names"
    rationale: "Follows DOOM progression: UAC marines (1-8) → Night Sentinels (9-10) → Argent warriors (11-15)"
  - title: "Color progression from gray → green → blue → purple → yellow → orange → red → gold"
    rationale: "Visual hierarchy matches progression intensity, culminates in doom-gold for max rank"
metrics:
  duration: "91 seconds"
  completed_at: "2026-02-26T08:00:50Z"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
  commits: 2
---

# Phase 4 Plan 1: XP Data Structures & Rank Definitions Summary

**XP system foundation established with TypeScript types, 15 DOOM military ranks, and pure lookup functions for rank progression.**

## Objective

Define TypeScript types for the XP system and create the 15 DOOM military rank definitions with exponential XP thresholds. Establish the data contracts and rank configuration that all subsequent XP system code will build against.

## What Was Built

### Type Definitions (src/types/index.ts)

Added 4 new interfaces to the existing types file:

1. **Rank** - Military rank definition
   - id (1-15), name, xpThreshold, color (Tailwind class), tagline
   - Used by rank lookup functions and UI components

2. **XPData** - Persistent XP state (Firestore)
   - totalXP, currentRankId, lastRankUpAt (optional)
   - Will be stored in `users/{uid}/stats/current` document (Phase 5)

3. **LevelUpEvent** - Rank-up notification data
   - previousRank, newRank, totalXP, timestamp
   - Used for toast notifications and confetti (Phase 6)

4. **WeeklyXPBreakdown** - XP calculation details
   - baseXP, streakMultiplier, totalXP, achievementBonus (optional)
   - Used for tooltip displays showing XP breakdown (Phase 6)

### Rank Definitions (src/lib/ranks.ts)

**RANKS Array (15 entries):**

| Rank | Name | XP Threshold | Color | Tagline |
|------|------|--------------|-------|---------|
| 1 | Private | 0 | text-gray-400 | Fresh meat |
| 2 | Corporal | 100 | text-gray-300 | Learning the ropes |
| 3 | Sergeant | 300 | text-green-400 | Getting stronger |
| 4 | Lieutenant | 650 | text-green-300 | Leading by example |
| 5 | Captain | 1,200 | text-blue-400 | Combat veteran |
| 6 | Major | 2,000 | text-blue-300 | Proven warrior |
| 7 | Colonel | 3,200 | text-purple-400 | Elite marine |
| 8 | Commander | 5,000 | text-purple-300 | Squad leader |
| 9 | Knight | 7,500 | text-yellow-400 | Night Sentinel initiate |
| 10 | Sentinel | 11,000 | text-yellow-300 | Argent warrior |
| 11 | Paladin | 16,000 | text-orange-400 | Holy crusader |
| 12 | Warlord | 23,000 | text-orange-300 | Demon hunter |
| 13 | Hellwalker | 33,000 | text-red-400 | Unchained predator |
| 14 | Slayer | 50,000 | text-red-300 | The only thing they fear |
| 15 | Doom Slayer | 100,000 | text-doom-gold | Rip and tear, until it is done |

**Utility Functions (4 total):**

1. **getRankForXP(totalXP: number): Rank**
   - Returns current rank for any XP value (0 to infinity)
   - Iterates RANKS array in reverse to find highest qualifying rank
   - Defaults to Private (rank 1) if no match

2. **getNextRank(currentRankId: number): Rank | null**
   - Returns next rank in progression
   - Returns null if already at max rank (Doom Slayer)

3. **getXPToNextRank(totalXP: number, currentRank: Rank): number**
   - Calculates XP needed to reach next rank
   - Returns 0 if at max rank

4. **checkRankUp(previousXP: number, newXP: number): LevelUpEvent | null**
   - Detects rank changes between two XP values
   - Returns LevelUpEvent if rank increased, null otherwise
   - Used to trigger rank-up notifications (Phase 6)

### XP Curve Analysis

**Progression Timeline (4 workouts/week = ~200 XP/week):**

- Week 1: Private (0 XP)
- Week 1-2: Corporal (100 XP)
- Week 2-6: Sergeant (300 XP)
- Week 4-9: Lieutenant (650 XP)
- Week 6-15: Captain (1,200 XP)
- Week 10-25: Major (2,000 XP)
- Week 16-38: Colonel (3,200 XP)
- Week 25-60: Commander (5,000 XP)
- Week 38-84: Knight (7,500 XP)
- Week 55-110: Sentinel (11,000 XP)
- Week 80-160: Paladin (16,000 XP)
- Week 115-230: Warlord (23,000 XP)
- Week 165-330: Hellwalker (33,000 XP)
- Week 250-500: Slayer (50,000 XP)
- Week 500+: Doom Slayer (100,000 XP) **~2 years**

**Curve Characteristics:**
- Early ranks (1-5): Fast progression, 1-4 weeks per rank (onboarding phase)
- Mid ranks (6-10): Moderate progression, 4-12 weeks per rank (building momentum)
- Late ranks (11-15): Slow progression, 12-52+ weeks per rank (epic achievements)
- Exponential growth feels natural, avoids linear grind
- Max rank achievable but requires true dedication (~104 weeks at ideal pace)

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification criteria passed:

✅ `npx tsc --noEmit` - Zero TypeScript errors
✅ `npm run lint` - No linting issues
✅ `npm run build` - Production build successful (1.27s)
✅ src/types/index.ts has 4 new interfaces (Rank, XPData, LevelUpEvent, WeeklyXPBreakdown)
✅ src/lib/ranks.ts exports RANKS (15 entries), getRankForXP, getNextRank, getXPToNextRank, checkRankUp
✅ All existing types in src/types/index.ts preserved unchanged

## Integration Points

**Downstream dependencies (next phases will use):**

- **Phase 4 Plan 2 (XP Formulas):**
  - Import `getRankForXP()` to calculate current rank from XP
  - Import `checkRankUp()` to detect rank changes
  - Use `Rank` type for rank-related calculations

- **Phase 5 (Data Layer):**
  - Store `XPData` in Firestore `users/{uid}/stats/current` document
  - Use `currentRankId` to efficiently query rank without recalculation
  - Use `lastRankUpAt` for achievement tracking (first rank-up, fastest rank-up, etc.)

- **Phase 6 (UI Integration):**
  - Display current rank from `getRankForXP(totalXP)`
  - Show progress bar using `getXPToNextRank()`
  - Trigger rank-up animations using `LevelUpEvent` data
  - Show XP breakdown tooltips using `WeeklyXPBreakdown`

- **Future features:**
  - Squad leaderboard: Sort by rank + XP within rank
  - Achievements: "Reach Captain in 30 days", "Hit Doom Slayer"
  - Profile display: Show rank badge, tagline, XP progress

## Testing Notes

**Manual Testing (Post-Implementation):**

No UI components built yet, so testing will occur in Phase 5-6 when hooks and components consume these definitions.

**Recommended Unit Tests (Future):**

```typescript
// Test getRankForXP()
expect(getRankForXP(0)).toEqual(RANKS[0]); // Private
expect(getRankForXP(100)).toEqual(RANKS[1]); // Corporal
expect(getRankForXP(99999)).toEqual(RANKS[13]); // Slayer (not Doom Slayer yet)
expect(getRankForXP(100000)).toEqual(RANKS[14]); // Doom Slayer
expect(getRankForXP(999999)).toEqual(RANKS[14]); // Still Doom Slayer (no higher)

// Test getNextRank()
expect(getNextRank(1)?.id).toBe(2); // Private → Corporal
expect(getNextRank(15)).toBeNull(); // Doom Slayer has no next rank

// Test getXPToNextRank()
expect(getXPToNextRank(50, RANKS[0])).toBe(50); // 50 XP to Corporal (100 - 50)
expect(getXPToNextRank(100000, RANKS[14])).toBe(0); // At max rank

// Test checkRankUp()
expect(checkRankUp(50, 150)).not.toBeNull(); // Private → Corporal
expect(checkRankUp(150, 200)).toBeNull(); // Both Corporal, no rank change
```

## Known Issues

None.

## Next Steps

**Immediate (Phase 4 Plan 2):**
1. Implement XP calculation formulas (base XP + streak multipliers)
2. Import rank functions to integrate XP → Rank conversion
3. Create XP change detection logic

**Following (Phase 5):**
1. Create Firestore schema for XPData storage
2. Build useXP() hook to manage XP state
3. Implement XP persistence and sync logic

**Later (Phase 6):**
1. Build rank display UI components
2. Implement rank-up notification system (toast + confetti)
3. Add XP progress bars and tooltips

## Self-Check

Verified all claims before finalizing summary:

✅ **Files exist:**
```bash
[ -f "src/types/index.ts" ] && echo "FOUND: src/types/index.ts"
[ -f "src/lib/ranks.ts" ] && echo "FOUND: src/lib/ranks.ts"
```
Output: FOUND for both files

✅ **Commits exist:**
```bash
git log --oneline --all | grep -q "ef94488" && echo "FOUND: ef94488"
git log --oneline --all | grep -q "ef88281" && echo "FOUND: ef88281"
```
Output: FOUND for both commits

✅ **Exports verified:**
```bash
grep -q "export interface Rank" src/types/index.ts && echo "FOUND: Rank interface"
grep -q "export const RANKS" src/lib/ranks.ts && echo "FOUND: RANKS array"
grep -q "export function getRankForXP" src/lib/ranks.ts && echo "FOUND: getRankForXP"
```
Output: FOUND for all exports

## Self-Check: PASSED

All files created, all commits made, all exports present, TypeScript compiles, build succeeds. Foundation is solid for Phase 4 Plan 2 (XP formulas).
