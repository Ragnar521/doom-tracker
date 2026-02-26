---
phase: 05
plan: 02
subsystem: data-layer
tags: [xp, integration, hooks, callbacks, achievements]
dependency_graph:
  requires:
    - "src/lib/xpFormulas.ts (Phase 04-02)"
    - "src/hooks/useXP.ts (Plan 05-01)"
    - "src/hooks/useWeek.ts (existing)"
    - "src/hooks/useAchievements.ts (existing)"
    - "src/contexts/AchievementContext.tsx (existing)"
  provides:
    - "src/hooks/useWeek.ts - XP delta callback integration"
    - "src/hooks/useAchievements.ts - Achievement XP bonus"
    - "src/contexts/AchievementContext.tsx - XP grant threading"
  affects:
    - "Phase 06 (UI components will wire these callbacks)"
    - "Tracker.tsx (will use useWeek with XP callbacks)"
    - "App.tsx (will wire AchievementProvider with XP grant)"
tech_stack:
  added: []
  patterns: ["callback threading", "options object pattern", "delta-based XP updates"]
key_files:
  created: []
  modified:
    - path: "src/hooks/useWeek.ts"
      purpose: "Added optional XP delta callbacks for workout toggles and status changes"
      exports: ["useWeek", "WeekData", "WeekStatus"]
    - path: "src/hooks/useAchievements.ts"
      purpose: "Added achievement XP bonus grant (+100 XP with 800ms delay)"
      exports: ["useAchievements"]
    - path: "src/contexts/AchievementContext.tsx"
      purpose: "Thread onXPGrant callback from provider to hook"
      exports: ["AchievementProvider", "useAchievementContext"]
decisions:
  - "XP delta calculated BEFORE Firestore write for optimistic UI update"
  - "Options object pattern maintains backward compatibility (no breaking changes)"
  - "Achievement XP grants after 800ms delay for dramatic effect"
  - "Achievement XP can trigger rank-up toast (isSilent=false, double reward)"
  - "No circular dependencies — callbacks keep hooks independent"
metrics:
  duration: 110s
  tasks_completed: 2
  files_modified: 3
  commits: 2
completed_at: "2026-02-26"
---

# Phase 05 Plan 02: Workout Toggle Integration Summary

**One-liner:** XP delta callbacks wired into workout toggles and achievement unlocks, making XP update in real-time as users interact with the app.

## What Was Built

Integrated the useXP hook (from Plan 05-01) with existing workout and achievement systems:

1. **useWeek hook** - Added optional callbacks for XP delta calculation on workout toggles and full recalculation on status changes
2. **useAchievements hook** - Added XP bonus grant (+100 XP) on achievement unlock with dramatic 800ms delay
3. **AchievementContext** - Threaded onXPGrant callback from provider props to hook

All modifications are backward compatible (optional parameters with defaults) — existing consumers continue working without changes.

## Task Breakdown

### Task 1: Add XP delta callbacks to useWeek hook ✅
**Commit:** `65ccab3`
**Files:** `src/hooks/useWeek.ts` (modified)

Added optional `UseWeekOptions` interface:
```typescript
interface UseWeekOptions {
  onXPDelta?: (delta: number) => void;
  onXPRecalculate?: () => void;
  currentStreak?: number;
}
```

Modified `toggleDay` to calculate XP delta:
- Calculate old/new workout counts
- Use `calculateWeeklyXP` to compute XP before and after toggle
- Fire `onXPDelta` callback with the difference (can be negative)
- Callback fires BEFORE Firestore write (optimistic UI update)

Modified `setStatus` to trigger recalculation:
- Week status changes (normal/sick/vacation) affect entire week's XP
- Fire `onXPRecalculate` callback after status update

**Key implementation details:**
- Options parameter has empty default: `options: UseWeekOptions = {}`
- No breaking changes — existing consumers work unchanged
- No direct dependency on useXP (callbacks keep hooks independent)
- Delta calculation is O(1) — fast enough for immediate updates

### Task 2: Add achievement XP bonus to useAchievements and wire through AchievementContext ✅
**Commit:** `53f657c`
**Files:** `src/hooks/useAchievements.ts`, `src/contexts/AchievementContext.tsx` (modified)

**useAchievements modifications:**

Added `UseAchievementsOptions` interface:
```typescript
interface UseAchievementsOptions {
  onXPGrant?: (amount: number) => Promise<void>;
}
```

Modified `dismissAchievement`:
- Grant +100 XP after 800ms delay using `setTimeout`
- Non-blocking (function returns immediately, XP grants asynchronously)
- NOT silent (can trigger rank-up toast for double reward moment)

Modified `confirmNewAchievements`:
- Grant +100 XP per achievement with 800ms stagger
- Uses `await new Promise(resolve => setTimeout(resolve, 800))`
- Blocking for multiple achievements (sequential unlocks)

**AchievementContext modifications:**

Added `onXPGrant` prop to `AchievementProvider`:
```typescript
interface AchievementProviderProps {
  children: ReactNode;
  onXPGrant?: (amount: number) => Promise<void>;
}
```

Pass through to hook:
```typescript
useAchievements({ onXPGrant })
```

**Key implementation details:**
- Options parameter has empty default — backward compatible
- Achievement toast appears first, then XP increments after a beat
- Flat +100 XP per achievement (not multiplied by streak)
- Achievement XP goes to separate `achievementXP` field in useXP

## Deviations from Plan

None - plan executed exactly as written.

## Technical Highlights

### Delta-Based XP Calculation
```typescript
// In useWeek.toggleDay
if (options.onXPDelta && options.currentStreak !== undefined) {
  const oldCount = data.workouts.filter(Boolean).length;
  const newCount = newWorkouts.filter(Boolean).length;
  const oldXP = calculateWeeklyXP(oldCount, options.currentStreak, data.status);
  const newXP = calculateWeeklyXP(newCount, options.currentStreak, data.status);
  const delta = newXP - oldXP;
  options.onXPDelta(delta); // Fire before Firestore write
}
```

This delta approach is O(1) per toggle — no need to recalculate entire history. Supports negative deltas (removing workouts).

### Achievement XP Timing
```typescript
// In useAchievements.dismissAchievement
if (options.onXPGrant) {
  setTimeout(async () => {
    await options.onXPGrant!(100); // +100 XP, NOT silent
  }, 800); // Dramatic delay — toast first, XP second
}
```

The 800ms delay creates a satisfying reward flow:
1. Achievement toast appears
2. Brief pause (user appreciates achievement)
3. XP increments (second reward beat)
4. Possible rank-up toast (triple reward moment!)

### Backward Compatibility
```typescript
// Old code still works (no options needed)
const { toggleDay } = useWeek(weekId);

// New code with XP integration
const { toggleDay } = useWeek(weekId, {
  onXPDelta: (delta) => addXP(delta),
  onXPRecalculate: () => recalculateXP(),
  currentStreak: 10
});
```

## Integration Points

### Phase 06 UI Will Wire These Callbacks

**In Tracker.tsx (or similar component):**
```typescript
const { totalXP, addXP, recalculateXP, currentRank } = useXP(weeks, currentStreak, ...);

const { toggleDay, setStatus } = useWeek(weekId, {
  onXPDelta: (delta) => {
    // Delta is pre-calculated — just add it
    addXP(delta, true); // Silent mode (no rank-up toast for workout toggles)
  },
  onXPRecalculate: async () => {
    // Full recalc needed (status changed)
    await recalculateXP();
  },
  currentStreak
});
```

**In App.tsx (or root provider):**
```typescript
const { addXP } = useXP(...); // Get addXP from somewhere (context or prop drilling)

return (
  <AchievementProvider onXPGrant={(amount) => addXP(amount, false)}>
    {/* App content */}
  </AchievementProvider>
);
```

## Verification

✅ TypeScript compiles with no errors
✅ ESLint passes with no warnings
✅ Production build succeeds (1.32s)
✅ useWeek accepts optional callbacks
✅ toggleDay calculates XP delta using calculateWeeklyXP
✅ setStatus triggers onXPRecalculate callback
✅ useAchievements accepts onXPGrant callback
✅ dismissAchievement grants +100 XP after 800ms
✅ confirmNewAchievements grants +100 XP per achievement with stagger
✅ AchievementProvider accepts onXPGrant prop
✅ No circular dependencies between hooks
✅ Backward compatible (existing code works unchanged)

## Files Changed

### Modified (3)
- `src/hooks/useWeek.ts` - Added XP delta callback support
- `src/hooks/useAchievements.ts` - Added achievement XP bonus
- `src/contexts/AchievementContext.tsx` - Thread XP grant callback

## Commits

1. `65ccab3` - feat(05-02): add XP delta callbacks to useWeek hook
2. `53f657c` - feat(05-02): add achievement XP bonus integration

## Next Steps

**Phase 06:** Build XP/rank UI components and wire callbacks
- Create Tracker.tsx integration (wire useWeek XP callbacks)
- Create App.tsx integration (wire AchievementProvider XP grant)
- Build XP progress bar component
- Build rank badge component
- Build level-up toast component

**Current State:**
- Data layer complete — XP calculates and persists correctly
- UI integration needed — callbacks exist but not yet wired in consuming components

## Performance Notes

- Delta-based XP updates are O(1) per workout toggle (no history scan)
- Status changes trigger full recalculation (acceptable, rare operation)
- Achievement XP grants are non-blocking (setTimeout, not await)
- All callbacks are optional — zero performance impact if not provided

## Self-Check: PASSED

**Modified files exist:**
```
FOUND: src/hooks/useWeek.ts
FOUND: src/hooks/useAchievements.ts
FOUND: src/contexts/AchievementContext.tsx
```

**Commits exist:**
```
FOUND: 65ccab3
FOUND: 53f657c
```

**Build verification:**
```
✓ TypeScript compilation: PASSED
✓ ESLint: PASSED (no warnings)
✓ Production build: PASSED (1.32s)
```

---

*Plan completed: 2026-02-26*
*Duration: 110 seconds*
*Status: Ready for Phase 06 UI integration*
