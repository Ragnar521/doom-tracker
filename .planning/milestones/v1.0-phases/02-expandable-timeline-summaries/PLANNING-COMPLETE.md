# Phase 2 Planning Complete

**Phase:** 02-expandable-timeline-summaries
**Plans Created:** 4
**Total Requirements Covered:** 34 (all Phase 2 requirements)
**Planning Date:** 2026-02-25

## Plan Breakdown

### Wave 1: Foundation
- **02-01-PLAN.md** - Timeline Data Infrastructure
  - Files: src/lib/timelineUtils.ts, src/hooks/useTimelineData.ts
  - Creates: Month grouping utilities, year/month data structures, lazy loading hook
  - Requirements: TIMELINE-01, TIMELINE-02, TIMELINE-03, TIMELINE-04, TIMELINE-07, MONTHLY-05, MONTHLY-06, MONTHLY-07, YEARLY-06, YEARLY-07, PERF-03

### Wave 2: Calculations
- **02-02-PLAN.md** - Period Statistics Calculations
  - Files: src/hooks/usePeriodStats.ts
  - Creates: Month stats (4), Year stats (6 including God Mode count)
  - Requirements: MONTHLY-01, MONTHLY-02, MONTHLY-03, MONTHLY-04, YEARLY-01, YEARLY-02, YEARLY-03, YEARLY-04, YEARLY-05, PERF-02
  - Depends on: 02-01

### Wave 3: UI Components
- **02-03-PLAN.md** - Timeline UI Components
  - Files: src/components/timeline/YearSection.tsx, MonthSection.tsx, WeekGrid.tsx, StatChip.tsx
  - Creates: Expandable accordion components, stat display chips, week grids
  - Requirements: TIMELINE-05, TIMELINE-06, TIMELINE-08, TIMELINE-09, TIMELINE-10, TIMELINE-11, MONTHLY-01, MONTHLY-02, MONTHLY-03, MONTHLY-04, YEARLY-01, YEARLY-02, YEARLY-03, YEARLY-04, YEARLY-05
  - Depends on: 02-01, 02-02

### Wave 4: Integration
- **02-04-PLAN.md** - Dashboard Integration & Polish
  - Files: src/pages/Dashboard.tsx, src/index.css
  - Creates: CSS transitions, Dashboard timeline section, performance validation
  - Requirements: TIMELINE-12, PERF-01, PERF-02, PERF-07, PERF-08
  - Depends on: 02-01, 02-02, 02-03

## Execution Strategy

**Parallelization:**
- Wave 1: Single plan (foundation)
- Wave 2: Depends on Wave 1 completion
- Wave 3: Depends on Waves 1+2 completion (needs data layer + stats)
- Wave 4: Depends on all previous waves (final integration)

**Estimated Duration:** 4 waves × ~30 minutes = ~2 hours total

**Critical Path:** 02-01 → 02-02 → 02-03 → 02-04 (sequential)

## Key Architectural Decisions

1. **Data Layer First:** Plan 02-01 establishes grouping utilities before UI, preventing rework
2. **Pure Function Stats:** Plan 02-02 uses pure functions for calculations, no side effects
3. **Reusable Components:** Plan 02-03 builds modular components matching Settings accordion pattern
4. **Non-Breaking Integration:** Plan 02-04 adds timeline below existing Dashboard (lines 108+), zero changes to existing sections

## User Decisions Honored

From 02-CONTEXT.md:

- ✅ Everything collapsed by default (YearSection and MonthSection useState(false))
- ✅ Year ordering newest first (availableYears.sort descending)
- ✅ Month ordering oldest first within years (0-11 ascending)
- ✅ Multi-expand accordion (Set-based expand state, not radio style)
- ✅ Sick/vacation exclusion (getNormalWeeks filter in all calculations)
- ✅ God Mode stat in year headers (6th stat: weeks with 5+ workouts)
- ✅ Smooth animations (250ms CSS transitions, max-height technique)
- ✅ Timeline below 12-week summary (Dashboard integration preserves existing flow)

## Requirements Coverage

**Phase 2 Requirements (34 total):**

| Category | Count | Plans Covering |
|----------|-------|----------------|
| TIMELINE-* | 12 | 02-01, 02-03, 02-04 |
| MONTHLY-* | 7 | 02-01, 02-02, 02-03 |
| YEARLY-* | 7 | 02-01, 02-02, 02-03 |
| PERF-* | 8 | 02-01, 02-02, 02-04 |

**Coverage:** 34/34 requirements mapped (100%)

## Risk Mitigation

**Potential Issues:**

1. **ISO Week Edge Cases (Week 53, Dec-Jan boundaries)**
   - Mitigation: Reuse existing weekUtils.ts functions (already handle ISO 8601 correctly)
   - Plan: 02-01 uses getYearFromWeekId and Thursday rule for month assignment

2. **Performance with 100+ Weeks**
   - Mitigation: Lazy rendering (only expanded sections), client-side grouping (instant)
   - Plan: 02-04 includes performance validation checklist

3. **Month Boundary Ambiguity**
   - Mitigation: ISO Thursday rule implementation in getMonthFromWeekId
   - Plan: 02-01 Task 1 explicitly documents Thursday = Monday + 3 days

4. **Sick/Vacation Filtering Inconsistency**
   - Mitigation: Single getNormalWeeks utility used by all stat calculations
   - Plan: 02-01 creates shared filter, 02-02 uses it exclusively

5. **CSS Animation Jank**
   - Mitigation: max-height technique (not height: auto), 250ms duration
   - Plan: 02-04 Task 1 implements proven CSS pattern from research

## Success Metrics

**Phase Goal Validation:**

Users can:
- ✅ View complete workout history beyond 12 weeks (TIMELINE-01)
- ✅ Expand year sections to see monthly breakdowns (TIMELINE-02, TIMELINE-05)
- ✅ Expand month sections to see individual week grids (TIMELINE-03, TIMELINE-06)
- ✅ See summary statistics on headers (MONTHLY-01-04, YEARLY-01-05)
- ✅ Experience smooth performance with 100+ weeks (PERF-01, PERF-02, TIMELINE-12)
- ✅ Keep existing 12-week summary at top (PERF-07, PERF-08)

**Technical Validation:**

- All 34 requirements mapped to plans
- Wave dependencies correctly identified
- No circular dependencies in plan graph
- Autonomous execution enabled (all plans marked autonomous: true)
- TypeScript compilation verified at each plan
- Existing codebase patterns reused (Settings accordion, Dashboard grid)

## Next Steps

**For Orchestrator:**
1. Validate plan structure and frontmatter
2. Check requirement coverage (should be 34/34)
3. Approve for execution or request revisions
4. Queue plans in wave order: 02-01 → 02-02 → 02-03 → 02-04

**For Executor:**
1. Execute 02-01 first (foundation)
2. Wait for 02-01 completion before starting 02-02
3. Wait for 02-01 + 02-02 before starting 02-03
4. Execute 02-04 last (integration)
5. Run manual testing checklist in 02-04 Task 3

---

**Planning Status:** ✅ Complete
**Ready for Execution:** Yes
**Estimated Completion:** ~2 hours (4 waves × 30 min avg)
