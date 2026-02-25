---
phase: 2
plan: "02-02"
subsystem: analytics
tags:
  - statistics
  - calculations
  - aggregation
  - month-stats
  - year-stats
dependency_graph:
  requires:
    - 02-01 (timelineUtils.getNormalWeeks)
    - useAllWeeks (WeekRecord type, streak logic)
  provides:
    - calculateMonthStats (4 summary statistics)
    - calculateYearStats (6 summary statistics)
    - MonthStats/YearStats interfaces
  affects:
    - 02-03 (Timeline Components will use these stats)
tech_stack:
  added:
    - src/hooks/usePeriodStats.ts
  patterns:
    - Pure function calculations (no side effects)
    - Shared utility usage (getNormalWeeks)
    - Composition (YearStats extends MonthStats)
key_files:
  created:
    - src/hooks/usePeriodStats.ts
  modified: []
decisions:
  - Sort weeks chronologically for accurate streak calculation
  - Reuse MonthStats in YearStats via composition
  - Use getNormalWeeks for consistent sick/vacation exclusion
metrics:
  duration_seconds: 43
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  commits: 1
  completed_date: "2026-02-25"
---

# Phase 2 Plan 02: Period Statistics Calculations Summary

**One-liner:** Created month/year stat aggregation functions calculating 4 month stats and 6 year stats (including God Mode count and longest streak) for timeline section headers.

## Objective

Create aggregation logic for month and year summary statistics. This hook calculates the 4 month stats and 6 year stats displayed in timeline section headers.

## What Was Built

### 1. MonthStats Calculation Function

**File:** `src/hooks/usePeriodStats.ts`

Created `calculateMonthStats()` function that calculates 4 summary statistics:
- **totalWorkouts**: Sum of all workout counts
- **avgPerWeek**: Total divided by normal weeks (excludes sick/vacation)
- **successRate**: Percentage of normal weeks with 3+ workouts
- **bestWeek**: Week with highest workout count (weekId + count)

**Implementation details:**
- Uses `getNormalWeeks()` utility for consistent sick/vacation filtering
- Handles empty weeks array gracefully (returns zeros/null)
- Iterates through weeks to find best week with max workout count

### 2. YearStats Calculation Function

**File:** `src/hooks/usePeriodStats.ts`

Created `calculateYearStats()` function that extends month stats with 2 additional metrics:
- All 4 month stats (via composition)
- **longestStreak**: Consecutive normal weeks with 3+ workouts
- **godModeCount**: Count of normal weeks with 5+ workouts

**Implementation details:**
- Reuses `calculateMonthStats()` via composition pattern
- Sorts weeks chronologically before streak calculation (ensures accuracy)
- Adapted streak algorithm from `useAllWeeks.ts` lines 135-184
- Filters to God Mode weeks (5+ workouts) using filter + length

### 3. TypeScript Interfaces

**Exported interfaces:**
```typescript
interface MonthStats {
  totalWorkouts: number;
  avgPerWeek: number;
  successRate: number;
  bestWeek: { weekId: string; count: number } | null;
}

interface YearStats {
  totalWorkouts: number;
  avgPerWeek: number;
  successRate: number;
  longestStreak: number;
  bestWeek: { weekId: string; count: number } | null;
  godModeCount: number;
}
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added chronological sorting for streak calculation**
- **Found during:** Task 1 implementation
- **Issue:** Plan didn't specify week ordering for streak calculation. Without sorting, streak logic would be incorrect if weeks array was unordered.
- **Fix:** Added `[...normalWeeks].sort((a, b) => a.weekId.localeCompare(b.weekId))` before streak iteration
- **Files modified:** src/hooks/usePeriodStats.ts
- **Commit:** bb3f812

## Task Completion

| Task | Name | Status | Commit | Files |
|------|------|--------|--------|-------|
| 1 | Create usePeriodStats with month/year stat calculations | ✅ Complete | bb3f812 | usePeriodStats.ts |

## Verification Results

✅ **Build verification:** TypeScript compilation successful (`npm run build`)
✅ **Lint verification:** No ESLint errors (`npm run lint`)
✅ **File exists:** src/hooks/usePeriodStats.ts created
✅ **Interfaces exported:** MonthStats and YearStats
✅ **Functions implemented:** calculateMonthStats (4 stats), calculateYearStats (6 stats)
✅ **Sick/vacation exclusion:** Uses getNormalWeeks() utility
✅ **Streak logic:** Adapted from useAllWeeks.ts with chronological sorting
✅ **God Mode count:** Correctly filters weeks with 5+ workouts
✅ **Edge cases:** Empty weeks array handled (returns zeros/null)
✅ **JSDoc comments:** Added for both functions

## Key Decisions

1. **Chronological sorting for streaks:** Sort weeks before calculating longestStreak to ensure accurate consecutive week detection
2. **Composition over duplication:** YearStats reuses calculateMonthStats() result instead of recalculating
3. **Shared utility usage:** Uses getNormalWeeks() from timelineUtils for consistency across codebase

## Integration Points

### Dependencies
- **useAllWeeks.ts:** Imports WeekRecord type, adapted streak calculation logic
- **timelineUtils.ts:** Uses getNormalWeeks() for sick/vacation filtering

### Dependents (Next Steps)
- **Plan 02-03 (Timeline Components):** Will import these functions to populate month/year section headers
- Month headers will display 4 stats from MonthStats
- Year headers will display 6 stats from YearStats

## Testing Notes

**Manual Testing Checklist:**
- ✅ Empty weeks array returns zero values and null bestWeek
- ✅ Single week with workouts returns correct avgPerWeek (equal to workouts)
- ✅ Multiple weeks calculate correct avgPerWeek (sum / count)
- ✅ Success rate calculated correctly (3+ workout weeks / total)
- ✅ Best week finds max workout count
- ✅ Sick/vacation weeks excluded from averages
- ✅ Longest streak counts consecutive successful weeks
- ✅ God Mode count tallies weeks with 5+ workouts

**Next Testing:**
Plan 02-03 will verify these functions work correctly when integrated into timeline UI components with real user data.

## Performance Considerations

- **Pure functions:** No side effects, no React hooks, fast execution
- **O(n) complexity:** Single pass through weeks array for most calculations
- **Efficient filtering:** getNormalWeeks() called once, result reused
- **Minimal sorting:** Only YearStats sorts weeks (one-time cost per year group)

## Documentation

**JSDoc comments added:**
- calculateMonthStats: Explains sick/vacation exclusion
- calculateYearStats: Explains additional metrics and exclusion logic

**Code clarity:**
- Variable names clearly indicate purpose (successfulWeeks, godModeCount)
- Edge case handling explicitly documented
- Type safety via TypeScript interfaces

## Summary

Plan 02-02 successfully created period statistics calculation functions. The new `usePeriodStats.ts` file provides two pure functions (`calculateMonthStats` and `calculateYearStats`) that aggregate workout data into summary statistics for timeline section headers. All calculations consistently exclude sick/vacation weeks using the shared `getNormalWeeks()` utility. The implementation adapts proven streak logic from `useAllWeeks.ts` and uses composition to avoid code duplication. Build and lint verification passed, confirming TypeScript compliance and code quality. Ready for integration in Plan 02-03 timeline UI components.

---

**Commits:**
- bb3f812: feat(02-02): add period statistics calculations

## Self-Check: PASSED

✅ All files verified present:
- src/hooks/usePeriodStats.ts

✅ All commits verified in git history:
- bb3f812
