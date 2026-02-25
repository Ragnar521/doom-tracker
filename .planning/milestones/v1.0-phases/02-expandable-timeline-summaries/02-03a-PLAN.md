---
phase: 2
plan: "02-03a"
type: feature
wave: 3
autonomous: true
depends_on:
  - "02-01"
  - "02-02"
files_modified:
  - src/components/timeline/StatChip.tsx
  - src/components/timeline/WeekGrid.tsx
requirements:
  - TIMELINE-09
  - TIMELINE-10
  - TIMELINE-11
must_haves:
  truths:
    - Stat chips display DOOM-themed summary stats (total, avg, success rate, etc.)
    - Week grids show 7-day workout history with health bar colors
    - All components maintain retro DOOM aesthetic
    - Components are reusable building blocks for month/year sections
  artifacts:
    - src/components/timeline/StatChip.tsx for stat display
    - src/components/timeline/WeekGrid.tsx for week history grids
  key_links:
    - getHealthColor (Phase 1) → WeekGrid cell backgrounds
    - getStatusBorderClass → WeekGrid sick/vacation borders
    - StatChip → MonthSection + YearSection headers (Plan 02-03b)
    - WeekGrid → MonthSection expanded content (Plan 02-03b)
---

# Plan 02-03a: Timeline Base Components (Wave 3a)

## Goal

Build reusable timeline base components: StatChip for DOOM-themed stat display and WeekGrid for displaying week history grids. These are the foundational building blocks that month/year sections will compose.

## Context

Plans 02-01 and 02-02 created data infrastructure (grouping, stats). Now we build the UI primitives: StatChip for displaying individual stats (used in headers), and WeekGrid for showing workout weeks (used in expanded sections). These follow existing patterns from Dashboard.tsx (week grid, stat cards).

This is Wave 3a - building the simple, reusable components first. Wave 3b (Plan 02-03b) will build the accordion sections that compose these components.

## Tasks

### Task 1: Create StatChip component for DOOM-themed stat display

<task type="auto">
<name>Create StatChip component</name>

<files>
- src/components/timeline/StatChip.tsx (new)
</files>

<action>
Create src/components/timeline/StatChip.tsx for DOOM-themed stat display:

**Interface:**
```typescript
interface StatChipProps {
  label: string;      // Uppercase label (e.g., "TOTAL")
  value: string;      // Display value (e.g., "187 workouts")
  color?: string;     // Optional Tailwind text color (default: doom-green)
}

export default function StatChip({ label, value, color = 'text-doom-green' }: StatChipProps)
```

**Implementation:**
- bg-gray-900 background, border-gray-800 border
- px-2 py-1 padding, rounded corners
- text-[9px] size (matches Dashboard StatCard)
- label in text-gray-500, value in specified color
- Layout: "LABEL: value" on single line

**Code pattern:**
```typescript
interface StatChipProps {
  label: string;
  value: string;
  color?: string;
}

export default function StatChip({ label, value, color = 'text-doom-green' }: StatChipProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 px-2 py-1 rounded">
      <span className="text-gray-500 text-[9px] tracking-wider">
        {label}:{' '}
      </span>
      <span className={`${color} text-[9px] font-bold`}>
        {value}
      </span>
    </div>
  );
}
```

**Visual reference:** Dashboard.tsx StatCard (lines 7-15), adapted to inline chip format

**Styling notes:**
- Use existing doom-panel aesthetic
- Responsive: wraps naturally in flex container
- Minimum touch target handled by parent flex gap
</action>

<verify>
**Manual checks:**
- [ ] File src/components/timeline/StatChip.tsx exists
- [ ] Component accepts label, value, and optional color props
- [ ] Renders DOOM-themed chip with gray background and border
- [ ] Text size matches Dashboard stats (9px)
- [ ] Default color is doom-green
- [ ] Custom colors work when provided (e.g., text-doom-gold)
- [ ] Label displays in gray-500, value in specified color

<automated>
npm run build && npm run lint
</automated>
</verify>

<done>
StatChip component complete. Plan 02-03b will use this in month/year section headers.
</done>
</task>

### Task 2: Create WeekGrid component for displaying week history

<task type="auto">
<name>Create WeekGrid component</name>

<files>
- src/components/timeline/WeekGrid.tsx (new)
</files>

<action>
Create src/components/timeline/WeekGrid.tsx for displaying weeks:

**Interface:**
```typescript
interface WeekGridProps {
  weeks: WeekRecord[];  // Weeks to display in grid
}

export default function WeekGrid({ weeks }: WeekGridProps)
```

**Implementation:**
- grid grid-cols-6 gap-1 layout (6 weeks per row, like Dashboard)
- Each week cell:
  - aspect-square, rounded
  - getHealthColor(week.workoutCount) background
  - getStatusBorderClass(week.status) border
  - flex items-center justify-center
  - text-[8px] text-white font-bold showing workout count
  - title attribute: "Week {number}: {count} workouts"

**Code pattern:**
```typescript
import type { WeekRecord } from '../../hooks/useAllWeeks';
import { getWeekNumber, getHealthColor, getStatusBorderClass } from '../../lib/weekUtils';

interface WeekGridProps {
  weeks: WeekRecord[];
}

export default function WeekGrid({ weeks }: WeekGridProps) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {weeks.map((week) => {
        const weekNum = getWeekNumber(week.weekId);
        const bgColor = getHealthColor(week.workoutCount);
        const borderClass = getStatusBorderClass(week.status);

        return (
          <div
            key={week.weekId}
            className={`aspect-square rounded ${bgColor} ${borderClass}
                       flex items-center justify-center
                       text-[8px] text-white font-bold`}
            title={`Week ${weekNum}: ${week.workoutCount} workouts`}
          >
            {week.workoutCount}
          </div>
        );
      })}
    </div>
  );
}
```

**Direct copy from:** Dashboard.tsx lines 83-92 (existing 12-week grid)

**Imports:**
- WeekRecord from ../../hooks/useAllWeeks
- getWeekNumber, getHealthColor, getStatusBorderClass from ../../lib/weekUtils

**Note:** Reuse existing pattern 100% - no changes to grid logic
</action>

<verify>
**Manual checks:**
- [ ] File src/components/timeline/WeekGrid.tsx exists
- [ ] Grid uses 6 columns layout matching Dashboard
- [ ] Each week uses health bar colors from Phase 1 (getHealthColor)
- [ ] Sick/vacation borders applied via getStatusBorderClass
- [ ] Workout count displayed in center of each cell (text-[8px])
- [ ] Title attribute shows "Week X: Y workouts"
- [ ] Grid handles empty weeks array gracefully

<automated>
npm run build && npm run lint
</automated>
</verify>

<done>
WeekGrid component complete. Plan 02-03b will use this in month section expanded content.
</done>
</task>

## Dependencies

**Blocks:**
- 02-03b-PLAN.md (MonthSection, YearSection) - needs StatChip and WeekGrid components

**Blocked by:**
- 02-01-PLAN.md - requires WeekRecord type from useAllWeeks
- 02-02-PLAN.md - stats calculation functions available (not directly used here, but needed for testing)

## Verification Criteria

**Success checklist:**
- [ ] 2 new files created in src/components/timeline/ directory
- [ ] StatChip component renders DOOM-themed stat display
- [ ] StatChip accepts label, value, color props
- [ ] WeekGrid component reuses Dashboard grid pattern exactly
- [ ] WeekGrid displays 6 columns of weeks
- [ ] Health bar colors applied to week cells via getHealthColor
- [ ] Sick/vacation borders applied via getStatusBorderClass
- [ ] TypeScript compiles: `npm run build` succeeds
- [ ] No linting errors: `npm run lint` passes

**Goal-backward validation:**
Base components can be rendered in isolation (e.g., Storybook-style). They are pure presentational components with no data fetching. Plan 02-03b will compose these into MonthSection and YearSection accordions.

---

*Plan: 02-03a | Wave: 3 | Autonomous: true*
*Files: src/components/timeline/StatChip.tsx, WeekGrid.tsx*
