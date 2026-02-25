---
phase: 03-trend-indicators-comparisons
plan: 01
subsystem: analytics-infrastructure
tags: [trend-calculation, percentage-change, memoization, edge-cases]
depends_on: []
provides: [trendUtils, calculateMonthStatsWithTrends, calculateYearStatsWithTrends, useTrendData]
affects: []
tech_stack:
  added: []
  patterns: [pure-functions, memoization, edge-case-handling]
key_files:
  created:
    - src/lib/trendUtils.ts
    - src/hooks/useTrendData.ts
  modified:
    - src/hooks/usePeriodStats.ts
decisions:
  - Use Math.round for whole number percentages (not toFixed - returns string)
  - Use Unicode arrows (↑ ↓ →) for zero-bundle-impact visualization
  - Return null for missing previous period (hide trend indicator entirely)
  - Division by zero returns infinity symbol (↑ ∞) not error
  - Both values zero returns stable trend (→ 0%) not division error
metrics:
  duration_seconds: 112
  tasks_completed: 3
  files_created: 2
  files_modified: 1
  commits: 3
  lines_added: 204
completed_date: "2026-02-25"
---

# Phase 03 Plan 01: Trend Calculation Infrastructure Summary

**One-liner:** Pure calculation functions and memoized hooks for percentage change trends with comprehensive edge case handling (division by zero, infinity symbols, sick/vacation exclusion).

## What Was Built

Created the foundation for trend indicators and comparative analytics:

1. **Trend Calculation Utility** (`src/lib/trendUtils.ts`)
   - Pure function `calculateTrend(current, previous)` with full edge case handling
   - Returns `TrendData` interface: `{ direction, percentage, display }`
   - Handles division by zero → `{ direction: 'up', percentage: 'infinity', display: '↑ ∞' }`
   - Handles both zero → `{ direction: 'stable', percentage: 0, display: '→ 0%' }`
   - Handles missing previous → `null` (no trend available)
   - Uses `Math.round()` for whole number percentages
   - Formats display with Unicode arrows (U+2191 ↑, U+2193 ↓, U+2192 →)

2. **Extended Period Stats** (`src/hooks/usePeriodStats.ts`)
   - New interfaces: `MonthStatsWithTrends`, `YearStatsWithTrends`
   - `calculateMonthStatsWithTrends()` - dual trend comparisons (previous month + year-ago)
   - `calculateYearStatsWithTrends()` - year-over-year trend comparison
   - Trends compare `avgPerWeek` metric between periods
   - Composition pattern: calls existing `calculateMonthStats`/`calculateYearStats` which use `getNormalWeeks`
   - Returns `null` trend if previous/year-ago period has no data

3. **Global Trend Data Hook** (`src/hooks/useTrendData.ts`)
   - `useTrendData()` hook calculates all-time benchmarks
   - Returns `GlobalTrendData`: `{ allTimeAverage, consistencyRate, totalNormalWeeks }`
   - All-time average: total workouts / total normal weeks
   - Consistency rate: (successful weeks / normal weeks) * 100
   - Excludes sick/vacation weeks via `getNormalWeeks` utility
   - Memoized with `useMemo` - only recalculates when `weeks` array changes

## Deviations from Plan

None - plan executed exactly as written.

All requirements met:
- TREND-06: Percentage change display ✓
- TREND-07: All-time average comparison ✓
- TREND-08: Sick/vacation exclusion via `getNormalWeeks` ✓
- TREND-09: Memoization in `useTrendData` ✓
- TREND-10: Consistency percentage calculation ✓

## Integration Points

**Reused Existing Utilities:**
- `getNormalWeeks()` from `timelineUtils.ts` - ensures consistent sick/vacation exclusion
- `calculateMonthStats()` and `calculateYearStats()` - composition pattern avoids duplication
- `useAllWeeks()` hook - provides week data for global calculations

**New Exports for Phase 03-02:**
- `TrendData` interface - will be used by `TrendIndicator` component
- `calculateTrend()` function - pure calculation logic ready for UI integration
- `MonthStatsWithTrends`/`YearStatsWithTrends` - will replace basic stats in timeline components
- `useTrendData()` hook - will add all-time benchmarks to Dashboard stats

## Edge Cases Handled

1. **Division by Zero**
   - Previous period has 0 workouts, current has workouts → `'↑ ∞'`
   - Prevents `Infinity` or `NaN` from breaking UI rendering

2. **Both Values Zero**
   - Previous = 0, current = 0 → `'→ 0%'` (stable trend)
   - Logical: no workouts → no workouts is no change

3. **Missing Previous Period**
   - No previous month/year data → returns `null`
   - Allows UI to hide trend indicator entirely (user decision)

4. **Empty Normal Weeks**
   - All weeks in period are sick/vacation → `avgPerWeek = 0`
   - Trend calculation still works (e.g., 0 → 3.5 shows `'↑ ∞'`)

5. **Rounding Edge Cases**
   - `Math.round()` handles 0.5 rounding correctly (banker's rounding)
   - Negative percentages formatted automatically (no need for extra sign handling)

## Performance Optimizations

1. **Pure Functions**
   - `calculateTrend()` is stateless and easily testable
   - No side effects - same inputs always produce same output

2. **Memoization**
   - `useTrendData()` uses `useMemo` with `[weeks]` dependency
   - Prevents recalculation on every render (only when weeks change)
   - React 19 auto-optimization further reduces render overhead

3. **Composition Over Duplication**
   - `calculateMonthStatsWithTrends` calls existing `calculateMonthStats`
   - Avoids duplicating `getNormalWeeks` filtering logic
   - Single source of truth for sick/vacation exclusion

## Testing Verification

Build and lint both passed:
- TypeScript compilation: ✓ No errors
- ESLint: ✓ No violations
- All exports verified: ✓ Interfaces and functions available

Manual verification of edge cases:
- `calculateTrend(10, 5)` → `{ direction: 'up', percentage: 100, display: '↑ +100%' }` ✓
- `calculateTrend(5, 10)` → `{ direction: 'down', percentage: -50, display: '↓ -50%' }` ✓
- `calculateTrend(10, 0)` → `{ direction: 'up', percentage: 'infinity', display: '↑ ∞' }` ✓
- `calculateTrend(0, 0)` → `{ direction: 'stable', percentage: 0, display: '→ 0%' }` ✓
- `calculateTrend(10, null)` → `null` ✓

## Next Steps (Plan 03-02)

Phase 03-02 will add UI components to display these trends:

1. **TrendIndicator Component**
   - Display trend arrows with percentages
   - DOOM-themed colors (green up, red down, gray stable)
   - Mirrors `StatChip` styling pattern

2. **Month/Year Section Integration**
   - Replace `calculateMonthStats` with `calculateMonthStatsWithTrends`
   - Add dual trend indicators to month headers (vs previous + vs year-ago)
   - Add year-over-year trend to year headers

3. **Dashboard Stats Update**
   - Add all-time average stat
   - Add consistency percentage stat
   - Display global benchmarks above timeline

All calculation logic is now ready for UI integration.

## Commits

| Hash | Description | Files |
|------|-------------|-------|
| 8155600 | feat(03-01): create trend calculation utilities | src/lib/trendUtils.ts |
| eed4509 | feat(03-01): extend period stats with trend comparisons | src/hooks/usePeriodStats.ts |
| 5a4a6aa | feat(03-01): create global trend data hook | src/hooks/useTrendData.ts |

Total: 3 commits, 3 files affected, 204 lines added.

## Self-Check: PASSED

**Created files exist:**
```
FOUND: src/lib/trendUtils.ts
FOUND: src/hooks/useTrendData.ts
```

**Modified files updated:**
```
FOUND: src/hooks/usePeriodStats.ts (extended with trend functions)
```

**Commits verified:**
```
FOUND: 8155600 (trend calculation utilities)
FOUND: eed4509 (period stats extension)
FOUND: 5a4a6aa (global trend data hook)
```

**TypeScript build:**
```
✓ tsc -b passed
✓ vite build passed
```

**ESLint:**
```
✓ No linting errors
```

All deliverables confirmed present and functional.
