# Architecture Research

**Domain:** Enhanced Analytics Dashboard (React + TypeScript + Firebase)
**Researched:** 2026-02-25
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Layer (Routes)                       │
│  Dashboard.tsx, Tracker.tsx, Achievements.tsx, etc.          │
├─────────────────────────────────────────────────────────────┤
│                    Component Layer                           │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │ WeekTracker  │  │ StatsPanel    │  │ DoomFace       │   │
│  │ Timeline     │  │ SummaryCards  │  │ TrendIndicator │   │
│  └──────┬───────┘  └───────┬───────┘  └────────┬───────┘   │
│         │                  │                    │           │
├─────────┴──────────────────┴────────────────────┴───────────┤
│                    Hooks Layer (Data)                        │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │ useAllWeeks  │  │ useStats    │  │ useWeek      │       │
│  │ (aggregated) │  │ (legacy)    │  │ (single)     │       │
│  └──────┬───────┘  └─────┬───────┘  └──────┬───────┘       │
│         │                │                  │               │
├─────────┴────────────────┴──────────────────┴───────────────┤
│                    Context Layer                             │
│  ┌────────────┐  ┌─────────────────┐  ┌────────────┐       │
│  │ AuthContext│  │ AchievementCtx  │  │ BoostCtx   │       │
│  └──────┬─────┘  └────────┬────────┘  └─────┬──────┘       │
│         │                 │                  │              │
├─────────┴─────────────────┴──────────────────┴──────────────┤
│                    Storage Layer                             │
│  ┌────────────────────┐           ┌──────────────────┐      │
│  │ Firebase Firestore │           │ LocalStorage     │      │
│  │ (authenticated)    │           │ (guest mode)     │      │
│  └────────────────────┘           └──────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Dashboard Page | Overall layout & stats coordination | Calls `useAllWeeks()`, renders StatCards + grids |
| Timeline Component | Expandable historical view (new) | Lazy loads year/month sections, collapsible |
| SummaryCard | Period aggregations (month/year) | Pure component, receives pre-calculated stats |
| TrendIndicator | Comparison arrows/badges (new) | Calculates % change from previous period/average |
| WeekGrid | Grid visualization (existing) | 12-week color-coded squares (being enhanced) |
| DayHeatmap | Day frequency visualization (existing) | 7-column grid showing favorite workout days |
| useAllWeeks Hook | Loads + aggregates all weeks | Firebase query OR LocalStorage scan, memoized stats |
| useStats Hook | Legacy stats manager | Single-document stats (may deprecate in favor of useAllWeeks) |
| useWeek Hook | Single week CRUD | Used by Tracker page, not Dashboard |

## Recommended Project Structure

```
src/
├── pages/
│   └── Dashboard.tsx               # Main analytics page (enhanced)
├── components/
│   ├── analytics/                  # NEW: Analytics-specific components
│   │   ├── Timeline.tsx            # Expandable year/month sections
│   │   ├── TimelineYear.tsx        # Collapsible year section
│   │   ├── TimelineMonth.tsx       # Month summary card with week grid
│   │   ├── SummaryCard.tsx         # Reusable stat card (period summary)
│   │   └── TrendIndicator.tsx      # Up/down arrow with % change
│   ├── WeekGrid.tsx                # Enhanced 12-week grid (existing, improve colors)
│   ├── DayHeatmap.tsx              # Day frequency grid (existing)
│   ├── StatCard.tsx                # Existing stat card (may merge with SummaryCard)
│   └── LoadingSpinner.tsx          # Loading states
├── hooks/
│   ├── useAllWeeks.ts              # ENHANCE: Add timeline data methods
│   ├── useStats.ts                 # LEGACY: Consider deprecating
│   ├── useWeek.ts                  # Single week (unchanged)
│   └── useTimeline.ts              # NEW: Timeline-specific data + lazy loading
├── lib/
│   ├── weekUtils.ts                # ENHANCE: Add month/year grouping utils
│   ├── colorUtils.ts               # NEW: Health bar color scheme logic
│   └── trendUtils.ts               # NEW: Trend calculation helpers
└── types/
    └── index.ts                    # ENHANCE: Add timeline/summary types
```

### Structure Rationale

- **components/analytics/:** Groups new timeline components, keeps Dashboard less cluttered
- **useTimeline hook:** Separates lazy-loading logic from useAllWeeks (SRP)
- **colorUtils.ts:** Centralized color scheme logic for consistency (green=best, red=low)
- **trendUtils.ts:** Reusable trend calculation (vs previous period, vs average)
- **Keep existing components:** WeekGrid, DayHeatmap, StatCard work well, just enhance

## Architectural Patterns

### Pattern 1: Memoized Aggregation in Custom Hooks

**What:** Use `useMemo` to calculate expensive stats from week data arrays

**When to use:** When aggregating 100+ weeks of data (current Dashboard already does this)

**Trade-offs:**
- **Pros:** Prevents re-calculation on every render, smooth UX
- **Cons:** Holds data in memory, but acceptable for <1000 weeks (~20 years)

**Example:**
```typescript
// hooks/useAllWeeks.ts (existing pattern, already optimal)
const stats = useMemo<DashboardStats>(() => {
  if (weeks.length === 0) return defaultStats;

  const totalWorkouts = weeks.reduce((sum, w) => sum + w.workoutCount, 0);
  const dayFrequency = [0, 0, 0, 0, 0, 0, 0];
  weeks.forEach((w) => {
    w.workouts.forEach((completed, idx) => {
      if (completed) dayFrequency[idx]++;
    });
  });

  return { totalWorkouts, dayFrequency, /* ... */ };
}, [weeks]);
```

### Pattern 2: Lazy Loading with Collapsible Sections

**What:** Don't render all timeline data at once, expand year/month sections on demand

**When to use:** Timeline views with potentially 100+ weeks (new feature)

**Trade-offs:**
- **Pros:** Fast initial render, mobile-friendly, reduces DOM nodes
- **Cons:** Requires state management for collapsed/expanded sections

**Example:**
```typescript
// components/analytics/Timeline.tsx (proposed)
function Timeline({ weeks }: { weeks: WeekRecord[] }) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(
    new Set([new Date().getFullYear()]) // Current year expanded by default
  );

  const yearGroups = useMemo(() => groupWeeksByYear(weeks), [weeks]);

  return (
    <div>
      {Object.entries(yearGroups).map(([year, yearWeeks]) => (
        <TimelineYear
          key={year}
          year={parseInt(year)}
          weeks={yearWeeks}
          expanded={expandedYears.has(parseInt(year))}
          onToggle={() => toggleYear(parseInt(year))}
        />
      ))}
    </div>
  );
}
```

### Pattern 3: Derived State for Trend Calculations

**What:** Calculate trends (vs previous period, vs average) from existing aggregated data

**When to use:** Showing comparison indicators without additional database queries

**Trade-offs:**
- **Pros:** No extra Firestore reads, instant calculation
- **Cons:** Requires careful null/edge case handling (first month has no previous)

**Example:**
```typescript
// lib/trendUtils.ts (proposed)
export function calculateTrend(
  current: number,
  comparison: number | null
): { percentage: number; direction: 'up' | 'down' | 'neutral' } {
  if (comparison === null || comparison === 0) {
    return { percentage: 0, direction: 'neutral' };
  }

  const percentage = ((current - comparison) / comparison) * 100;
  return {
    percentage: Math.abs(percentage),
    direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
  };
}

// Usage in component
const monthlyTrend = calculateTrend(
  currentMonthWorkouts,
  previousMonthWorkouts
);
```

### Pattern 4: Health Bar Color Scheme (Inverted Traffic Light)

**What:** Green = high workouts, Yellow = medium, Red = low (matches DOOM health mechanic)

**When to use:** All week visualizations (replace existing traffic light scheme)

**Trade-offs:**
- **Pros:** More intuitive, aligns with game aesthetic, clear at a glance
- **Cons:** Breaking change, requires user education (add legend)

**Example:**
```typescript
// lib/colorUtils.ts (proposed, replaces existing logic in Dashboard.tsx)
export function getHealthBarColor(count: number, maxCount: number = 7): string {
  const percentage = (count / maxCount) * 100;

  if (percentage >= 71) return 'bg-doom-green';    // 5-7 workouts
  if (percentage >= 57) return 'bg-green-600';     // 4 workouts
  if (percentage >= 43) return 'bg-yellow-500';    // 3 workouts
  if (percentage >= 14) return 'bg-orange-600';    // 1-2 workouts
  return 'bg-doom-red';                            // 0 workouts
}

// Special statuses override color
export function getWeekColor(week: WeekRecord): string {
  if (week.status === 'sick' || week.status === 'vacation') {
    return 'bg-gray-600'; // Gray for non-normal weeks
  }
  return getHealthBarColor(week.workoutCount);
}
```

## Data Flow

### Request Flow (Existing, Optimized)

```
User Opens Dashboard
    ↓
Dashboard.tsx → useAllWeeks() → Check AuthContext
    ↓                               ↓
    ├─── Authenticated? ────→ Firestore query (orderBy startDate desc)
    │                             ↓
    │                        getDocs() returns all week docs
    │                             ↓
    └─── Guest Mode? ───────→ LocalStorage scan (keys: doom-tracker-week-*)
                                  ↓
                             Both paths converge
                                  ↓
                             Transform to WeekRecord[]
                                  ↓
                             useMemo calculates stats (totalWorkouts, streaks, etc.)
                                  ↓
                             Component renders with memoized data
```

### Timeline Data Flow (New Feature)

```
User Clicks "View Full History" Button
    ↓
Timeline Component Mounts
    ↓
Receives weeks[] from useAllWeeks (already loaded)
    ↓
useMemo groups weeks by year → Map<year, WeekRecord[]>
    ↓
useMemo groups weeks by month → Map<monthKey, MonthSummary>
    ↓
Render collapsed year sections (only current year expanded)
    ↓
User Clicks Year Header
    ↓
Toggle expandedYears state (no re-fetch needed)
    ↓
Month sections render (lazy, only if year expanded)
    ↓
Calculate month summaries on-demand (useMemo per month)
```

### State Management (Existing Pattern, Extended)

```
[Firestore/LocalStorage]
    ↓ (load on mount)
[useAllWeeks Hook]
    ↓ (returns weeks[], stats, loading)
[Dashboard Component]
    ↓ (passes data to children)
┌───┴─────────────────────────────┐
│                                 │
[WeekGrid]                    [Timeline]
    ↓                             ↓
Display recent 12           Group by year/month
                                  ↓
                            [TimelineYear]
                                  ↓
                            [TimelineMonth]
                                  ↓
                            Display month summary
```

### Key Data Flows

1. **Initial Load:** Single Firestore query fetches ALL weeks, memoized aggregation happens once
2. **Timeline Expansion:** Pure UI state change, no data refetch
3. **Trend Calculations:** Derived from already-loaded week data (no extra queries)
4. **Color Mapping:** Pure function transforms workout count → color class

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 weeks (~2 years) | Current architecture is perfect, no changes needed |
| 100-500 weeks (~10 years) | Add pagination to Timeline (load year-by-year), keep 12-week summary |
| 500+ weeks (20+ years) | Consider lazy loading in useAllWeeks (fetch only current year + summary stats), backend aggregation for trends |

### Scaling Priorities

1. **First bottleneck:** Timeline DOM size with 500+ weeks open
   - **Fix:** Virtual scrolling or year-based lazy loading (only load expanded years)
   - **When:** At 200+ weeks (4+ years), or ~2000+ DOM nodes

2. **Second bottleneck:** Firestore read costs (100+ week documents)
   - **Fix:** Add aggregated stats document (monthly/yearly summaries pre-calculated)
   - **When:** At 1000+ users with 100+ weeks each (currently free tier is fine)

3. **Mobile performance:** Large dataset calculations on low-end devices
   - **Fix:** Move trend calculations to Web Worker (non-blocking)
   - **When:** User reports of lag (unlikely with current data size)

**Current Reality:** With 12 weeks displayed by default and timeline collapsed, performance is excellent for 0-200 weeks (0-4 years). Most users won't hit scaling issues for years.

## Anti-Patterns

### Anti-Pattern 1: Fetching Week Data Inside Timeline Component

**What people do:** Call useAllWeeks() inside Timeline component separately from Dashboard

**Why it's wrong:** Duplicates Firestore query, wastes reads, causes race conditions

**Do this instead:** Pass `weeks[]` prop from Dashboard (single source of truth)

**Example:**
```typescript
// ❌ BAD: Redundant data fetching
function Timeline() {
  const { weeks } = useAllWeeks(); // Second query!
  return <div>{/* ... */}</div>;
}

// ✅ GOOD: Receive data as prop
function Timeline({ weeks }: { weeks: WeekRecord[] }) {
  const yearGroups = useMemo(() => groupWeeksByYear(weeks), [weeks]);
  return <div>{/* ... */}</div>;
}

// Dashboard.tsx
function Dashboard() {
  const { weeks, stats, loading } = useAllWeeks(); // Single query
  return (
    <>
      <WeekGrid weeks={stats.recentWeeks} />
      <Timeline weeks={weeks} />
    </>
  );
}
```

### Anti-Pattern 2: Re-calculating Trends on Every Render

**What people do:** Calculate trend percentages inside component render without useMemo

**Why it's wrong:** Unnecessary computation, causes jank on low-end devices

**Do this instead:** Use useMemo or calculate once in parent

**Example:**
```typescript
// ❌ BAD: Recalculates every render
function TrendIndicator({ current, previous }: Props) {
  const trend = calculateTrend(current, previous); // Runs every render!
  return <span>{trend.percentage}%</span>;
}

// ✅ GOOD: Memoize or calculate in parent
function TrendIndicator({ trend }: { trend: TrendData }) {
  return <span>{trend.percentage}%</span>;
}

// Parent component
function MonthSummary({ weeks }: Props) {
  const trend = useMemo(
    () => calculateTrend(currentMonth, previousMonth),
    [currentMonth, previousMonth]
  );
  return <TrendIndicator trend={trend} />;
}
```

### Anti-Pattern 3: Overusing useEffect for Derived State

**What people do:** Use useEffect to update state based on props changes

**Why it's wrong:** Causes double renders, increases complexity, React 19 best practices avoid this

**Do this instead:** Use useMemo for derived calculations

**Example:**
```typescript
// ❌ BAD: Unnecessary effect
function Timeline({ weeks }: Props) {
  const [yearGroups, setYearGroups] = useState({});

  useEffect(() => {
    setYearGroups(groupWeeksByYear(weeks)); // Double render!
  }, [weeks]);

  return <div>{/* ... */}</div>;
}

// ✅ GOOD: Direct memoization
function Timeline({ weeks }: Props) {
  const yearGroups = useMemo(() => groupWeeksByYear(weeks), [weeks]);
  return <div>{/* ... */}</div>;
}
```

### Anti-Pattern 4: Inline Color Logic in JSX

**What people do:** Complex ternary chains in className attributes

**Why it's wrong:** Hard to maintain, inconsistent colors across components, untestable

**Do this instead:** Centralized color utility functions

**Example:**
```typescript
// ❌ BAD: Inline color logic (current Dashboard.tsx pattern)
<div className={
  count >= 5 ? 'bg-doom-gold' :
  count >= 4 ? 'bg-doom-green' :
  count >= 3 ? 'bg-yellow-600' :
  'bg-doom-red'
}>

// ✅ GOOD: Utility function
import { getWeekColor } from '../lib/colorUtils';

<div className={getWeekColor(weekRecord)}>
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Firebase Firestore | Direct SDK calls in hooks | Already implemented, single query per page load |
| LocalStorage | Fallback for guest mode | Key pattern: `doom-tracker-week-{weekId}` |
| React Router | Page navigation | Dashboard is at `/dashboard`, already protected |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Dashboard ↔ Timeline | Props (weeks[]) | Single data source, no re-fetching |
| Timeline ↔ TimelineYear | Props + callbacks | Year expansion state managed in Timeline |
| TimelineYear ↔ TimelineMonth | Props | Month summaries calculated in TimelineMonth |
| Dashboard ↔ useAllWeeks | Hook return value | Memoized stats, loading state, weeks array |
| useAllWeeks ↔ Firebase | Firestore SDK | Single `getDocs()` query with `orderBy('startDate', 'desc')` |
| colorUtils ↔ Components | Pure functions | Stateless, testable, consistent |

## Performance Patterns

### Memoization Strategy

```typescript
// Hook level (useAllWeeks.ts)
const stats = useMemo(() => calculateStats(weeks), [weeks]);

// Component level (Timeline.tsx)
const yearGroups = useMemo(() => groupByYear(weeks), [weeks]);
const monthGroups = useMemo(() => groupByMonth(weeks), [weeks]);

// Prop level (Timeline → TimelineYear)
const yearSummary = useMemo(
  () => calculateYearSummary(yearWeeks),
  [yearWeeks]
);
```

### Conditional Rendering (Lazy Expansion)

```typescript
// Only render expanded sections
{expandedYears.has(year) && (
  <div className="year-content">
    {months.map(month => <TimelineMonth key={month} {...props} />)}
  </div>
)}
```

### Batch Updates (React 18+ Automatic)

```typescript
// Multiple state updates are automatically batched in React 18+
const handleYearToggle = (year: number) => {
  setExpandedYears(prev => toggleSet(prev, year));
  // If needed, other state updates here are batched
};
```

## Build Order (Suggested Phases)

### Phase 1: Color Scheme Update (Low Risk, High Value)
1. Create `lib/colorUtils.ts` with health bar logic
2. Update Dashboard.tsx to use new colors
3. Add color legend to Dashboard
4. Test visual consistency
**Dependencies:** None
**Estimated:** 2-4 hours

### Phase 2: Timeline Data Layer (Foundation)
1. Enhance `lib/weekUtils.ts` with grouping functions
   - `groupWeeksByYear(weeks): Map<year, WeekRecord[]>`
   - `groupWeeksByMonth(weeks): Map<monthKey, MonthSummary>`
2. Create `types/index.ts` interfaces (MonthSummary, YearSummary)
3. Test grouping logic
**Dependencies:** Phase 1 complete (uses color utils)
**Estimated:** 3-5 hours

### Phase 3: Timeline Components (UI Layer)
1. Create `components/analytics/Timeline.tsx` (shell with expand/collapse)
2. Create `components/analytics/TimelineYear.tsx` (collapsible section)
3. Create `components/analytics/TimelineMonth.tsx` (month summary + week grid)
4. Wire up to Dashboard.tsx
**Dependencies:** Phase 2 complete (needs grouping functions)
**Estimated:** 6-8 hours

### Phase 4: Trend Indicators (Enhancement)
1. Create `lib/trendUtils.ts` with comparison functions
2. Create `components/analytics/TrendIndicator.tsx`
3. Integrate into MonthSummary and YearSummary displays
4. Add trend calculations to month/year grouping
**Dependencies:** Phase 3 complete (renders in Timeline components)
**Estimated:** 4-6 hours

### Phase 5: Summary Cards (Polish)
1. Create `components/analytics/SummaryCard.tsx` (reusable)
2. Add monthly/yearly summary stats to Timeline headers
3. Show "vs previous period" and "vs average" comparisons
**Dependencies:** Phase 4 complete (uses TrendIndicator)
**Estimated:** 3-4 hours

### Phase 6: Mobile Polish & Performance
1. Test collapsible sections on mobile viewports
2. Add loading states for large datasets
3. Test with 100+ weeks of mock data
4. Optimize re-renders with React DevTools Profiler
**Dependencies:** Phase 5 complete (full feature set)
**Estimated:** 4-6 hours

**Total Estimated Time:** 22-33 hours (3-5 days for one developer)

## Testing Strategy

### Unit Tests (Utilities)
- `colorUtils.getHealthBarColor()` with edge cases (0, 7, negative)
- `weekUtils.groupWeeksByYear()` with cross-year boundaries
- `trendUtils.calculateTrend()` with null/zero handling

### Integration Tests (Hooks)
- `useAllWeeks()` with mock Firestore data (100+ weeks)
- Timeline grouping with real-world week data
- Memoization performance (verify recalc only when weeks[] changes)

### E2E Tests (Playwright)
- Dashboard loads with 12-week grid visible
- Timeline expands/collapses years
- Month summaries display correct workout counts
- Trend indicators show up/down arrows correctly
- Color legend matches displayed colors

## Sources

- **Existing Codebase:** `/Users/radekmuzikant/Documents/doom-tracker/src/`
  - `hooks/useAllWeeks.ts` - Memoized aggregation pattern
  - `pages/Dashboard.tsx` - Current 12-week grid implementation
  - `lib/weekUtils.ts` - ISO week ID calculations
- **React Patterns:** [React 19 Documentation](https://react.dev) - useMemo, derived state
- **Firebase Best Practices:** [Firestore Query Optimization](https://firebase.google.com/docs/firestore/query-data/queries)
- **DOOM Aesthetic Reference:** `.claude/CLAUDE.md` - Color scheme, retro theme constraints

---
*Architecture research for: Enhanced Analytics Dashboard*
*Researched: 2026-02-25*
*Confidence: HIGH - Based on existing production codebase patterns*
