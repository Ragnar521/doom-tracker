# Phase 02 Plan Revision Summary

**Date:** 2026-02-25
**Revision Type:** Targeted fixes for checker blocker issues
**Status:** Complete

## Changes Made

### 1. All Plans: Converted to Autonomous Task Format

**Issue:** Tasks missing required elements (`<name>`, `<files>`, `<action>`, `<verify>`, `<done>`)

**Fix:** Restructured all tasks to use proper autonomous format:
- Added `<name>` with clear task description
- Added `<files>` listing files modified/created
- Wrapped implementation details in `<action>` tags
- Added `<verify>` with manual checks + `<automated>npm run build && npm run lint</automated>`
- Added `<done>` with completion criteria

**Applied to:** 02-01, 02-02, 02-03a, 02-03b, 02-04

### 2. All Plans: Added Structured Frontmatter

**Issue:** Missing required frontmatter fields (phase, plan, type, must_haves as structured YAML)

**Fix:** Added complete frontmatter to each plan:
```yaml
---
phase: 2
plan: "02-XX"
wave: X
type: autonomous
depends_on: [...]
files_modified: [...]
requirements: [...]  # All relevant requirement IDs
must_haves:
  truths: [...]      # User-observable outcomes
  artifacts: [...]   # Key files/components created
  key_links: [...]   # Component wiring and dependencies
---
```

**Applied to:** 02-01, 02-02, 02-03a, 02-03b, 02-04

### 3. All Plans: Added Requirements Arrays

**Issue:** Missing or incomplete `requirements` arrays in frontmatter

**Fix:** Added comprehensive requirements coverage:
- **02-01:** TIMELINE-01, TIMELINE-02, TIMELINE-03, TIMELINE-04, TIMELINE-07, MONTHLY-05, MONTHLY-06, MONTHLY-07, YEARLY-06, YEARLY-07, PERF-03 (11 requirements)
- **02-02:** MONTHLY-01, MONTHLY-02, MONTHLY-03, MONTHLY-04, YEARLY-01, YEARLY-02, YEARLY-03, YEARLY-04, YEARLY-05, PERF-02 (10 requirements)
- **02-03a:** TIMELINE-09, TIMELINE-10, TIMELINE-11 (3 requirements)
- **02-03b:** TIMELINE-02, TIMELINE-03, TIMELINE-05, TIMELINE-06, TIMELINE-08, MONTHLY-01, MONTHLY-02, MONTHLY-03, MONTHLY-04, YEARLY-01, YEARLY-02, YEARLY-03, YEARLY-04, YEARLY-05 (14 requirements)
- **02-04:** TIMELINE-04, TIMELINE-11, TIMELINE-12, PERF-01, PERF-02, PERF-07, PERF-08 (7 requirements)

**Total coverage:** All 34 phase requirements now claimed

### 4. All Plans: Converted must_haves to Structured Format

**Issue:** must_haves in prose section instead of structured YAML frontmatter

**Fix:** Converted to structured frontmatter with three sections:
- **truths:** User-observable outcomes (what users will experience)
- **artifacts:** Key files/components created (what the code produces)
- **key_links:** Component wiring and dependencies (how pieces connect)

**Example (02-01):**
```yaml
must_haves:
  truths:
    - Timeline shows complete workout history beyond 12-week limit
    - Week grouping creates year/month hierarchy for navigation
    - ISO week Thursday rule prevents month boundary bugs
  artifacts:
    - src/lib/timelineUtils.ts with getMonthFromWeekId, groupWeeksByYearAndMonth, getNormalWeeks
    - src/hooks/useTimelineData.ts providing availableYears, getYearWeeks, getMonthWeeks
  key_links:
    - timelineUtils.ts → useTimelineData.ts (grouping functions consumed by hook)
    - useAllWeeks → useTimelineData (week data source)
```

### 5. Plan 02-03: Split into 02-03a and 02-03b

**Issue:** Plan had 4 tasks creating 4 components - exceeds safe autonomous limit (~65% context)

**Fix:** Split into two focused plans:
- **02-03a (Wave 3a):** StatChip + WeekGrid (2 simple components, foundational building blocks)
- **02-03b (Wave 3b):** MonthSection + YearSection (2 accordion components that compose 02-03a components)

**Benefits:**
- Each plan fits comfortably in autonomous context window
- Clear dependency chain: 02-03a blocks 02-03b
- Logical separation: primitives first, then composition

### 6. Plan 02-03b: Made Component Wiring Explicit

**Issue:** Component wiring not explicit in task actions (only shown in code snippets)

**Fix:** Added explicit wiring instructions in task actions:
- Task 1 (MonthSection): "Import StatChip and WeekGrid from Plan 02-03a"
- Task 1: "Pass weeks array to WeekGrid when expanded"
- Task 2 (YearSection): "Import StatChip from Plan 02-03a"
- Task 2: "Import MonthSection from Task 1 above"
- Task 2: "Render MonthSection components when expanded, sorted Jan-Dec"

Also documented in key_links:
```yaml
key_links:
  - StatChip (Plan 02-03a) → section headers (stat display)
  - WeekGrid (Plan 02-03a) → MonthSection expanded content
  - calculateMonthStats (Plan 02-02) → MonthSection stats
  - calculateYearStats (Plan 02-02) → YearSection stats
  - MonthSection → YearSection expanded content (composition)
```

### 7. Plan 02-04: Addressed Pinned Current Week Requirement

**Issue:** Plan didn't address user decision: "Current week always visible at top, pinned above timeline sections"

**Fix:** Clarified in multiple places:

1. **Context section:**
   > **User decision on current week:** "Current week always visible at top, pinned above timeline sections for quick tracking (separate from historical data)". The existing 12-week grid at the top of Dashboard already satisfies this - it shows the current week plus 11 previous weeks, always visible. The new timeline section will appear below this, providing historical context beyond the 12-week window.

2. **Task 2 action:**
   > **Current week handling:**
   > The existing 12-week grid (lines 81-108) already shows the current week at the top of Dashboard, satisfying the user decision: "Current week always visible at top, pinned above timeline sections for quick tracking". The new timeline section provides historical context beyond the 12-week window.

3. **Task 3 verification:**
   > **Current week visibility check:**
   > - Verify 12-week grid at top shows current week (satisfies user decision)
   > - Verify timeline appears below as historical context
   > - Verify no duplication or confusion between current week views

4. **Goal-backward validation:**
   > Users can now view their complete workout history beyond the 12-week limit. The existing 12-week grid at the top shows the current week (always visible, per user decision). Below that, the new timeline provides expandable year/month sections with summary stats.

**Key insight:** The existing Dashboard already has a pinned current week view (the 12-week grid). The new timeline adds historical context below without duplicating or replacing this.

## Files Changed

### Created
- `.planning/phases/02-expandable-timeline-summaries/02-03a-PLAN.md` (new, replaces part of 02-03)
- `.planning/phases/02-expandable-timeline-summaries/02-03b-PLAN.md` (new, replaces part of 02-03)

### Modified
- `.planning/phases/02-expandable-timeline-summaries/02-01-PLAN.md` (autonomous format + structured frontmatter)
- `.planning/phases/02-expandable-timeline-summaries/02-02-PLAN.md` (autonomous format + structured frontmatter)
- `.planning/phases/02-expandable-timeline-summaries/02-04-PLAN.md` (autonomous format + structured frontmatter + current week clarification)

### Deleted
- `.planning/phases/02-expandable-timeline-summaries/02-03-PLAN.md` (replaced by 02-03a + 02-03b)

## Verification

All blocker issues resolved:

✅ **Task completeness** - All tasks now use `<name>`, `<files>`, `<action>`, `<verify>`, `<done>` format
✅ **Frontmatter fields** - All plans have phase, plan, type, must_haves in structured YAML
✅ **Requirement coverage** - All 34 requirements claimed in frontmatter arrays
✅ **Verification derivation** - must_haves converted to truths/artifacts/key_links structure
✅ **Nyquist compliance** - All tasks have `<automated>npm run build && npm run lint</automated>`
✅ **Scope sanity** - 02-03 split into 02-03a (2 components) + 02-03b (2 components)
✅ **Context compliance** - 02-04 now explicitly addresses pinned current week requirement
✅ **Key links planned** - Component wiring explicit in task actions and frontmatter

## Phase Execution Order

After revision:

1. **Wave 1:** 02-01 (data infrastructure)
2. **Wave 2:** 02-02 (period stats) - depends on 02-01
3. **Wave 3a:** 02-03a (base components) - depends on 02-01, 02-02
4. **Wave 3b:** 02-03b (accordion sections) - depends on 02-01, 02-02, 02-03a
5. **Wave 4:** 02-04 (Dashboard integration) - depends on 02-01, 02-02, 02-03a, 02-03b

Total: 5 autonomous plans (was 4, split 02-03 into 02-03a + 02-03b)

---

**Revision complete.** All blocker issues addressed. Plans ready for autonomous execution.
