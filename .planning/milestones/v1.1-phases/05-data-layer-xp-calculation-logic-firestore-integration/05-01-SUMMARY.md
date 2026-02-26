---
phase: 05
plan: 01
subsystem: data-layer
tags: [xp, firestore, hooks, persistence, retroactive-calculation]
dependency_graph:
  requires:
    - "src/lib/xpFormulas.ts (Phase 04-02)"
    - "src/lib/ranks.ts (Phase 04-01)"
    - "src/hooks/useAllWeeks.ts (existing)"
    - "src/contexts/AuthContext.tsx (existing)"
  provides:
    - "src/hooks/useXP.ts - XP state management hook"
  affects:
    - "Phase 05-02 (workout toggle integration)"
    - "Phase 06 (UI components)"
tech_stack:
  added: []
  patterns: ["React hooks", "Firestore persistence", "retroactive data migration"]
key_files:
  created:
    - path: "src/hooks/useXP.ts"
      purpose: "XP state management with Firestore persistence and retroactive calculation"
      exports: ["useXP"]
  modified: []
decisions:
  - "Retroactive XP calculation triggers automatically when totalXP is undefined in Firestore"
  - "Level-up toasts suppressed during retroactive grant (per RANK-03)"
  - "Guest users excluded from XP system (no LocalStorage XP)"
  - "Failed retroactive calculations don't persist partial results (retry on next load)"
  - "useMemo uses primitive dependencies (totalXP, currentRank.id) to prevent infinite loops"
  - "Achievement XP stored separately (achievementXP field) for transparency"
metrics:
  duration: 118s
  tasks_completed: 2
  files_created: 1
  commits: 2
completed_at: "2026-02-26"
---

# Phase 05 Plan 01: useXP Hook Implementation Summary

**One-liner:** XP state management hook with Firestore persistence, retroactive calculation for existing users, and silent migration flow.

## What Was Built

Created the `useXP` hook that serves as the core data layer for the XP system. This hook:

1. **Loads XP from Firestore** - Reads `users/{uid}/stats/current` document on mount
2. **Triggers retroactive calculation** - When no XP data exists, calculates total XP from all historical weeks
3. **Provides real-time XP state** - totalXP, currentRank, nextRank, xpToNextRank
4. **Handles level-up events** - Detects rank-ups and emits LevelUpEvent (except during retroactive calc)
5. **Supports guest mode** - Returns loading=false with 0 XP for unauthenticated users

## Task Breakdown

### Task 1: Create useXP hook with Firestore persistence ✅
**Commit:** `a0ab1da`
**Files:** `src/hooks/useXP.ts` (created)

Implemented complete useXP hook with:
- Effect 1: Load XP from Firestore on mount
- Effect 2: Retroactive XP calculation (guards: user exists, XP not loaded, weeks loaded, history exists)
- `addXP(amount, isSilent)` - Add XP with optional silent mode
- `recalculateXP()` - Full recalculation from all weeks (nuclear option)
- `dismissLevelUp()` - Clear level-up event
- Derived values: currentRank, nextRank, xpToNextRank (with primitive dependencies)

**Key implementation details:**
- Retroactive calculation uses current streak for ALL historical weeks (simplified, more rewarding)
- Achievement XP calculated as `unlockedAchievementCount * 100`
- Level-up toasts suppressed during retroactive grant (RANK-03 requirement)
- On failure, partial results not persisted (retry on next load)

### Task 2: Verify build and lint pass ✅
**Commit:** `1eed4e0`
**Files:** `src/hooks/useXP.ts` (modified)

Fixed ESLint issue:
- Removed unused `getXPToNextRank` import (calculating manually in useMemo)
- Lint passes with no warnings
- Production build succeeds

## Deviations from Plan

None - plan executed exactly as written.

## Technical Highlights

### Retroactive Migration Flow
```typescript
// Effect 2 guards prevent unnecessary recalculation
if (!user) return; // Guest mode
if (xpLoaded) return; // XP already loaded from Firestore
if (weeksLoading) return; // Weeks haven't loaded yet
if (weeks.length === 0 && !weeksLoading) return; // Brand new user, no history

// Calculate from all weeks
let workoutXP = 0;
weeks.forEach((week) => {
  const weekXP = calculateWeeklyXP(week.workoutCount, currentStreak, week.status);
  workoutXP += weekXP;
});

const achXP = unlockedAchievementCount * 100;
const retroTotalXP = workoutXP + achXP;

// Persist to Firestore (with error handling)
await setDoc(docRef, { totalXP, currentRankId, achievementXP }, { merge: true });

// NO level-up event during retroactive (silent mode)
console.log(`Retroactive XP granted: ${retroTotalXP} XP (Rank: ${rank.name})`);
```

### Primitive Dependencies Pattern
```typescript
// ✅ CORRECT: Primitive dependencies prevent infinite loops
const currentRank: Rank = useMemo(() => getRankForXP(totalXP), [totalXP]);
const nextRank: Rank | null = useMemo(() => getNextRank(currentRank.id), [currentRank.id]);
const xpToNextRank: number = useMemo(
  () => (nextRank ? nextRank.xpThreshold - totalXP : 0),
  [nextRank, totalXP]
);

// ❌ WRONG: Object reference dependencies cause loops
// const currentRank = useMemo(() => getRankForXP(totalXP), [xpData]);
```

### Guest Mode Handling
```typescript
// Guest users get immediate return (no XP, no errors)
if (!user) {
  setLoading(false);
  return; // No LocalStorage XP (XP is Firestore-only)
}
```

## Integration Points

### Consumed by Plan 05-02
```typescript
// Plan 05-02 will integrate useXP into workout toggle flow
const { totalXP, addXP, recalculateXP } = useXP(weeks, currentStreak, ...);

// On workout toggle:
await toggleWorkout(dayIndex);
await recalculateXP(); // Recalc XP after workout data changes
```

### Consumed by Phase 06 (UI)
```typescript
// Phase 06 will use XP state for display
const { currentRank, nextRank, xpToNextRank, levelUpEvent } = useXP(...);

return (
  <div>
    <RankBadge rank={currentRank} />
    <XPProgressBar current={totalXP} next={nextRank?.xpThreshold} />
    {levelUpEvent && <LevelUpToast event={levelUpEvent} />}
  </div>
);
```

## Verification

✅ TypeScript compiles with no errors
✅ ESLint passes with no warnings
✅ Production build succeeds
✅ Hook exports correct signature
✅ Retroactive calculation logic guards prevent premature execution
✅ Level-up toasts suppressed during retroactive grant (RANK-03)
✅ Guest users get loading=false with 0 XP
✅ useMemo uses primitive dependencies (no infinite loops)

## Files Changed

### Created (1)
- `src/hooks/useXP.ts` - XP state management hook (250 lines)

## Commits

1. `a0ab1da` - feat(05-01): implement useXP hook with Firestore persistence
2. `1eed4e0` - fix(05-01): remove unused import in useXP hook

## Next Steps

**Plan 05-02:** Integrate useXP into workout toggle flow
- Call `recalculateXP()` after workout toggles
- Add achievement XP bonus on achievement unlock
- Handle delta-based XP updates for performance

**Phase 06:** Build XP/rank UI components
- Rank badge display
- XP progress bar
- Level-up toast notifications
- Weekly XP breakdown tooltips

## Performance Notes

- Retroactive calculation runs once per user (first load when no XP data exists)
- Subsequent loads read XP directly from Firestore (fast)
- `recalculateXP()` is intentionally "nuclear" (full recalc) - use sparingly
- Delta-based updates (Plan 05-02) will handle most workout toggles efficiently

## Self-Check: PASSED

**Created files exist:**
```
FOUND: src/hooks/useXP.ts
```

**Commits exist:**
```
FOUND: a0ab1da
FOUND: 1eed4e0
```

**Build verification:**
```
✓ TypeScript compilation: PASSED
✓ ESLint: PASSED (no warnings)
✓ Production build: PASSED (1.30s)
```

---

*Plan completed: 2026-02-26*
*Duration: 118 seconds*
*Status: Ready for Plan 05-02*
