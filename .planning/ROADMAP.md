# Roadmap: Rep & Tear - Enhanced Analytics

## Overview

This milestone enhances Rep & Tear's analytics capabilities by fixing the confusing color scheme, removing the 12-week timeline limitation, and adding monthly/yearly summaries with trend indicators. The journey moves from foundational color and data architecture decisions through timeline UI implementation, trend analysis features, and final polish for accessibility and performance. Each phase builds on the previous, ensuring users can visualize and understand their complete workout history with clear, meaningful statistics that motivate continued consistency.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Health Bar Color Foundation** - Replace confusing traffic light colors with health bar paradigm and establish lazy loading architecture
- [ ] **Phase 2: Expandable Timeline & Summaries** - Remove 12-week limitation with collapsible year/month sections and period aggregations
- [ ] **Phase 3: Trend Indicators & Comparisons** - Add momentum arrows and comparative benchmarks for context
- [ ] **Phase 4: Accessibility & Polish** - Ensure colorblind support, keyboard navigation, and performance at scale

## Phase Details

### Phase 1: Health Bar Color Foundation
**Goal**: Establish intuitive color scheme matching DOOM health mechanics and lazy loading architecture before building UI
**Depends on**: Nothing (first phase)
**Requirements**: COLOR-01, COLOR-02, COLOR-03, COLOR-04, COLOR-05, COLOR-06, COLOR-07
**Success Criteria** (what must be TRUE):
  1. User sees green colors for high workout counts (5-7 per week) matching "full health" mental model
  2. User sees yellow colors for moderate workout counts (3-4 per week) matching "damaged" state
  3. User sees red colors for low workout counts (0-2 per week) matching "critical health" state
  4. Dashboard week grid uses new color scheme consistently across all visualizations
  5. Centralized color utility function exists that all components can use for consistent color mapping
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 2: Expandable Timeline & Summaries
**Goal**: Remove 12-week limitation and provide complete workout history through collapsible timeline with monthly/yearly aggregations
**Depends on**: Phase 1
**Requirements**: TIMELINE-01, TIMELINE-02, TIMELINE-03, TIMELINE-04, TIMELINE-05, TIMELINE-06, TIMELINE-07, TIMELINE-08, TIMELINE-09, TIMELINE-10, TIMELINE-11, TIMELINE-12, MONTHLY-01, MONTHLY-02, MONTHLY-03, MONTHLY-04, MONTHLY-05, MONTHLY-06, MONTHLY-07, YEARLY-01, YEARLY-02, YEARLY-03, YEARLY-04, YEARLY-05, YEARLY-06, YEARLY-07, PERF-01, PERF-02, PERF-03, PERF-07, PERF-08
**Success Criteria** (what must be TRUE):
  1. User can expand year sections to view all weeks from any historical year
  2. User can expand month sections within years to view individual week grids
  3. Month section headers display summary statistics (total workouts, average per week, success rate, best week)
  4. Year section headers display summary statistics (total workouts, average per week, success rate, longest streak, best week)
  5. Timeline sections are collapsed by default and only load data when user expands them
  6. Dashboard remains responsive and smooth when user has 100+ weeks of historical data
  7. Loading skeletons appear while data fetches so user knows something is happening
  8. Existing 12-week summary view remains unchanged at top of Dashboard
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 3: Trend Indicators & Comparisons
**Goal**: Provide performance context through trend arrows and comparative benchmarks against previous periods and personal averages
**Depends on**: Phase 2
**Requirements**: TREND-01, TREND-02, TREND-03, TREND-04, TREND-05, TREND-06, TREND-07, TREND-08, TREND-09, TREND-10
**Success Criteria** (what must be TRUE):
  1. User sees trend indicator on current month showing up/down/stable arrow vs previous month
  2. User sees trend indicator on current year showing up/down/stable arrow vs previous year
  3. Trend indicators display percentage change (e.g., "+15%" or "-8%") alongside arrow direction
  4. User sees comparison indicator showing performance vs personal all-time average
  5. Consistency percentage stat shows what percent of all weeks met the 3+ workout goal
  6. Sick and vacation weeks are excluded from all trend calculations so they don't skew results
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 4: Accessibility & Polish
**Goal**: Ensure features work for all users through colorblind support, keyboard navigation, and performance validation
**Depends on**: Phase 3
**Requirements**: COLOR-08, PERF-04, PERF-05, PERF-06
**Success Criteria** (what must be TRUE):
  1. Colorblind users can distinguish performance levels through pattern/texture overlays supplementing colors
  2. User can navigate and expand/collapse timeline sections using only keyboard (no mouse required)
  3. Color contrast ratios meet WCAG AA standards (4.5:1) for readability
  4. Users with no historical data see welcoming empty state message instead of blank screen
  5. Timeline performance validated with 200+ weeks of mock data showing no jank or lag
**Plans**: TBD

Plans:
- [ ] TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Health Bar Color Foundation | 0/TBD | Not started | - |
| 2. Expandable Timeline & Summaries | 0/TBD | Not started | - |
| 3. Trend Indicators & Comparisons | 0/TBD | Not started | - |
| 4. Accessibility & Polish | 0/TBD | Not started | - |
