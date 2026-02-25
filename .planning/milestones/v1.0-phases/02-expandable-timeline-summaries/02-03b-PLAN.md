---
phase: 2
plan: "02-03b"
type: feature
wave: 3
autonomous: true
depends_on:
  - "02-01"
  - "02-02"
  - "02-03a"
files_modified:
  - src/components/timeline/MonthSection.tsx
  - src/components/timeline/YearSection.tsx
requirements:
  - TIMELINE-02
  - TIMELINE-03
  - TIMELINE-05
  - TIMELINE-06
  - TIMELINE-08
  - MONTHLY-01
  - MONTHLY-02
  - MONTHLY-03
  - MONTHLY-04
  - YEARLY-01
  - YEARLY-02
  - YEARLY-03
  - YEARLY-04
  - YEARLY-05
must_haves:
  truths:
    - Year sections display 6 summary stats and expand to show months
    - Month sections display 4 summary stats and expand to show week grids
    - Sections use chevron icons (▶/▼) for expand/collapse affordance
    - Smooth 300ms animations provide polished feel
    - Months within years sorted Jan-Dec (0-11 ascending)
  artifacts:
    - src/components/timeline/MonthSection.tsx with header + 4 stats + expandable week grid
    - src/components/timeline/YearSection.tsx with header + 6 stats + expandable month sections
  key_links:
    - StatChip (Plan 02-03a) → section headers (stat display)
    - WeekGrid (Plan 02-03a) → MonthSection expanded content
    - calculateMonthStats (Plan 02-02) → MonthSection stats
    - calculateYearStats (Plan 02-02) → YearSection stats
    - MonthSection → YearSection expanded content (composition)
---

# Plan 02-03b: Timeline Accordion Sections (Wave 3b)

## Goal

Build expandable year/month accordion sections with stat headers. Components compose StatChip and WeekGrid from Plan 02-03a with data/stats hooks from previous plans, but don't integrate with Dashboard yet.

## Context

Plans 02-01 and 02-02 created data infrastructure (grouping, stats). Plan 02-03a created base components (StatChip, WeekGrid). Now we build the accordion layer: YearSection with 6 stats that expands to show MonthSections, and MonthSection with 4 stats that expands to show WeekGrid. These follow existing accordion pattern from Settings.tsx.

This is Wave 3b - building the accordion wrappers that compose the base components from 02-03a.

## Tasks

### Task 1: Create MonthSection component

<task type="auto">
<name>Create MonthSection accordion component</name>

<files>
- src/components/timeline/MonthSection.tsx (new)
</files>

<action>
Create src/components/timeline/MonthSection.tsx for month accordion:

**Interface:**
```typescript
interface MonthSectionProps {
  year: number;
  month: number;      // 0-11
  weeks: WeekRecord[];
}

export default function MonthSection({ year, month, weeks }: MonthSectionProps)
```

**Implementation:**

1. **State:**
   - const [expanded, setExpanded] = useState(false)

2. **Stats calculation:**
   - const stats = useMemo(() => calculateMonthStats(weeks), [weeks])

3. **Month name:**
   - const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long' })

4. **Header button:**
   - w-full p-2 text-left flex items-center gap-2
   - Chevron icon (expanded ? '▼' : '▶') on left
   - Month name (e.g., "JANUARY") in text-doom-gold text-sm font-bold
   - hover:text-doom-gold/80 transition-colors

5. **Stat chips row:**
   - Below header, always visible (not collapsed)
   - flex flex-wrap gap-2 text-[9px] px-2 pb-2
   - 4 StatChips: Total, Avg/Week, Success%, Best Week
   - Format: "23 workouts", "4.2/week", "75%", "Best: 6"

6. **Expanded content:**
   - {expanded && (<WeekGrid weeks={weeks} />)}
   - px-2 pb-2 padding
   - transition-all duration-300 for smooth expand

**Code pattern:**
```typescript
import { useState, useMemo } from 'react';
import type { WeekRecord } from '../../hooks/useAllWeeks';
import { calculateMonthStats } from '../../hooks/usePeriodStats';
import StatChip from './StatChip';
import WeekGrid from './WeekGrid';

interface MonthSectionProps {
  year: number;
  month: number;
  weeks: WeekRecord[];
}

export default function MonthSection({ year, month, weeks }: MonthSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => calculateMonthStats(weeks), [weeks]);

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="doom-panel mb-2">
      {/* Header button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-2 text-left flex items-center gap-2
                   text-doom-gold hover:text-doom-gold/80 transition-colors"
      >
        <span className="text-sm">{expanded ? '▼' : '▶'}</span>
        <span className="text-sm font-bold tracking-wider">{monthName.toUpperCase()}</span>
      </button>

      {/* Stats (always visible) */}
      <div className="flex flex-wrap gap-2 px-2 pb-2">
        <StatChip label="TOTAL" value={`${stats.totalWorkouts} workouts`} />
        <StatChip label="AVG/WEEK" value={stats.avgPerWeek.toFixed(1)} />
        <StatChip label="SUCCESS" value={`${stats.successRate.toFixed(0)}%`} />
        {stats.bestWeek && (
          <StatChip label="BEST" value={`${stats.bestWeek.count} workouts`} />
        )}
      </div>

      {/* Expanded week grid */}
      {expanded && (
        <div className="px-2 pb-2 transition-all duration-300">
          <WeekGrid weeks={weeks} />
        </div>
      )}
    </div>
  );
}
```

**Pattern reference:** Settings.tsx accordion (lines 126-141)

**Styling:**
- doom-panel background
- mb-2 spacing between months
- hover:text-doom-gold/80 on header
- Smooth expand/collapse animation (300ms)

**Wiring:**
- Import StatChip and WeekGrid from Plan 02-03a
- Import calculateMonthStats from Plan 02-02
- Pass weeks array to WeekGrid when expanded
</action>

<verify>
**Manual checks:**
- [ ] File src/components/timeline/MonthSection.tsx exists
- [ ] Month name displayed correctly (e.g., "JANUARY")
- [ ] Chevron toggles between ▶ and ▼ on click
- [ ] 4 stat chips always visible (not collapsed) using StatChip component
- [ ] Week grid only renders when expanded using WeekGrid component
- [ ] Smooth expand/collapse animation (300ms transition-all)
- [ ] Stats calculated via calculateMonthStats from Plan 02-02
- [ ] Best week stat only shows if bestWeek exists (null check)

<automated>
npm run build && npm run lint
</automated>
</verify>

<done>
MonthSection component complete with stat chips and expandable week grid. YearSection (Task 2) will render multiple MonthSections.
</done>
</task>

### Task 2: Create YearSection component

<task type="auto">
<name>Create YearSection accordion component</name>

<files>
- src/components/timeline/YearSection.tsx (new)
</files>

<action>
Create src/components/timeline/YearSection.tsx for year accordion:

**Interface:**
```typescript
interface YearSectionProps {
  year: number;
  yearWeeks: WeekRecord[];
  monthGroups: Map<number, WeekRecord[]>;  // month (0-11) → weeks
}

export default function YearSection({ year, yearWeeks, monthGroups }: YearSectionProps)
```

**Implementation:**

1. **State:**
   - const [expanded, setExpanded] = useState(false)

2. **Stats calculation:**
   - const stats = useMemo(() => calculateYearStats(yearWeeks), [yearWeeks])

3. **Header button:**
   - w-full p-3 flex items-center gap-2
   - Chevron (expanded ? '▼' : '▶') + year in text-xl font-bold text-doom-gold
   - hover:text-doom-gold/80 transition-colors

4. **Stat chips row:**
   - Below header, always visible
   - px-3 pb-3 flex flex-wrap gap-2
   - 6 StatChips:
     1. "TOTAL: {totalWorkouts} workouts"
     2. "AVG/WEEK: {avgPerWeek.toFixed(1)}"
     3. "SUCCESS: {successRate.toFixed(0)}%"
     4. "BEST STREAK: {longestStreak} weeks"
     5. "GOD MODE: {godModeCount} weeks" (special user request)
     6. "BEST WEEK: {bestWeek.count} workouts" (if bestWeek exists)

5. **Expanded content:**
   - {expanded && (
       <div className="px-3 pb-3 space-y-2">
         {Array.from(monthGroups.entries())
           .sort((a, b) => a[0] - b[0])  // Months 0-11 ascending
           .map(([month, weeks]) => (
             <MonthSection key={month} year={year} month={month} weeks={weeks} />
           ))}
       </div>
     )}
   - transition-all duration-300

**Code pattern:**
```typescript
import { useState, useMemo } from 'react';
import type { WeekRecord } from '../../hooks/useAllWeeks';
import { calculateYearStats } from '../../hooks/usePeriodStats';
import StatChip from './StatChip';
import MonthSection from './MonthSection';

interface YearSectionProps {
  year: number;
  yearWeeks: WeekRecord[];
  monthGroups: Map<number, WeekRecord[]>;
}

export default function YearSection({ year, yearWeeks, monthGroups }: YearSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => calculateYearStats(yearWeeks), [yearWeeks]);

  return (
    <div className="doom-panel mb-2">
      {/* Header button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-2
                   text-doom-gold hover:text-doom-gold/80 transition-colors"
      >
        <span className="text-xl">{expanded ? '▼' : '▶'}</span>
        <span className="text-xl font-bold">{year}</span>
      </button>

      {/* Stats (always visible) */}
      <div className="px-3 pb-3 flex flex-wrap gap-2">
        <StatChip label="TOTAL" value={`${stats.totalWorkouts} workouts`} />
        <StatChip label="AVG/WEEK" value={stats.avgPerWeek.toFixed(1)} />
        <StatChip label="SUCCESS" value={`${stats.successRate.toFixed(0)}%`} />
        <StatChip label="STREAK" value={`${stats.longestStreak} weeks`} />
        <StatChip label="GOD MODE" value={`${stats.godModeCount} weeks`} color="text-doom-gold" />
        {stats.bestWeek && (
          <StatChip label="BEST" value={`${stats.bestWeek.count} workouts`} />
        )}
      </div>

      {/* Expanded month sections */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 transition-all duration-300">
          {Array.from(monthGroups.entries())
            .sort((a, b) => a[0] - b[0]) // Jan-Dec
            .map(([month, weeks]) => (
              <MonthSection key={month} year={year} month={month} weeks={weeks} />
            ))}
        </div>
      )}
    </div>
  );
}
```

**Pattern reference:** Settings.tsx accordion + Dashboard.tsx StatCard

**Styling:**
- doom-panel background
- mb-2 spacing between years
- Larger text/padding than MonthSection (hierarchy)
- God Mode stat uses text-doom-gold color (special emphasis)

**Wiring:**
- Import StatChip from Plan 02-03a
- Import MonthSection from Task 1 above
- Import calculateYearStats from Plan 02-02
- Render MonthSection components when expanded, sorted Jan-Dec
</action>

<verify>
**Manual checks:**
- [ ] File src/components/timeline/YearSection.tsx exists
- [ ] Year displayed in larger font (xl) than month headers
- [ ] Chevron toggles on click (▶/▼)
- [ ] 6 stat chips always visible using StatChip component
- [ ] God Mode stat included in year stats (user requirement)
- [ ] God Mode stat uses doom-gold color for emphasis
- [ ] Month sections only render when year expanded
- [ ] Months sorted 0-11 (Jan-Dec) in ascending order
- [ ] Smooth expand/collapse animation (300ms)
- [ ] Stats calculated via calculateYearStats from Plan 02-02
- [ ] MonthSection components properly wired with year, month, weeks props

<automated>
npm run build && npm run lint
</automated>
</verify>

<done>
YearSection component complete with stat chips and expandable month sections. Plan 02-04 will integrate these into Dashboard.
</done>
</task>

## Dependencies

**Blocks:**
- 02-04-PLAN.md (Dashboard Integration) - needs YearSection component to integrate

**Blocked by:**
- 02-01-PLAN.md - requires useTimelineData hook and WeekRecord type
- 02-02-PLAN.md - requires calculateMonthStats and calculateYearStats functions
- 02-03a-PLAN.md - requires StatChip and WeekGrid components

## Verification Criteria

**Success checklist:**
- [ ] 2 new files created in src/components/timeline/ directory
- [ ] MonthSection component has header + 4 stats + expandable week grid
- [ ] YearSection component has header + 6 stats (including God Mode) + expandable month sections
- [ ] Chevron icons toggle ▶/▼ on expand/collapse
- [ ] Expand/collapse animations smooth (300ms duration)
- [ ] Month sections sorted Jan-Dec (0-11 ascending) within year
- [ ] MonthSection uses StatChip and WeekGrid from Plan 02-03a
- [ ] YearSection uses StatChip and MonthSection components
- [ ] Stats calculated via useMemo to avoid recalculation
- [ ] TypeScript compiles: `npm run build` succeeds
- [ ] No linting errors: `npm run lint` passes

**Goal-backward validation:**
Timeline accordion components can be rendered in isolation (e.g., Storybook-style). They consume data from useTimelineData and usePeriodStats hooks, and compose StatChip/WeekGrid components. Dashboard integration (Plan 02-04) will compose YearSection components into full timeline below existing 12-week summary.

---

*Plan: 02-03b | Wave: 3 | Autonomous: true*
*Files: src/components/timeline/MonthSection.tsx, YearSection.tsx*
