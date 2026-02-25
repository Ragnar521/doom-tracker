# Requirements: Rep & Tear - Enhanced Analytics

**Defined:** 2026-02-25
**Core Value:** Users can visualize and understand their complete workout history with clear, meaningful statistics that motivate continued consistency and highlight long-term progress patterns.

## v1 Requirements

Requirements for the enhanced analytics milestone. Each maps to roadmap phases.

### Color Scheme

- [x] **COLOR-01**: System uses health bar color paradigm (green=best performance, red=critical)
- [x] **COLOR-02**: Green color represents 5-7 workouts per week (godmode/full health)
- [x] **COLOR-03**: Yellow color represents 3-4 workouts per week (healthy/moderate health)
- [x] **COLOR-04**: Red color represents 0-2 workouts per week (critical/low health)
- [x] **COLOR-05**: Gray color represents sick/vacation weeks (non-combat status)
- [x] **COLOR-06**: Centralized color utility function determines colors for all visualizations
- [x] **COLOR-07**: Color scheme applies consistently across Dashboard and all analytics views
- [ ] **COLOR-08**: Pattern/texture overlays supplement colors for colorblind accessibility

### Timeline View

- [x] **TIMELINE-01**: User can view complete workout history beyond 12-week limit
- [x] **TIMELINE-02**: Timeline organizes weeks into expandable year sections
- [x] **TIMELINE-03**: Year sections contain expandable month subsections
- [x] **TIMELINE-04**: Sections are collapsed by default to prevent performance issues
- [ ] **TIMELINE-05**: User can expand/collapse year sections with click/tap
- [ ] **TIMELINE-06**: User can expand/collapse month sections with click/tap
- [x] **TIMELINE-07**: Expanded sections lazy load data (not loaded upfront)
- [ ] **TIMELINE-08**: Loading skeletons appear while data fetches
- [x] **TIMELINE-09**: Expanded sections display week grids with workout counts
- [x] **TIMELINE-10**: Week grids use health bar color scheme
- [x] **TIMELINE-11**: Mobile UI has 44px minimum touch targets for expand/collapse
- [ ] **TIMELINE-12**: Timeline works smoothly on mobile with 100+ weeks of data

### Monthly Summaries

- [x] **MONTHLY-01**: Each month section header displays total workouts for that month
- [x] **MONTHLY-02**: Each month section header displays average workouts per week
- [x] **MONTHLY-03**: Each month section header displays success rate (% weeks with 3+ workouts)
- [x] **MONTHLY-04**: Each month section header displays best week in that month
- [x] **MONTHLY-05**: Month summaries exclude sick/vacation weeks from calculations
- [x] **MONTHLY-06**: Month boundaries determined by ISO week Thursday rule
- [x] **MONTHLY-07**: Monthly totals sum correctly to yearly totals

### Yearly Summaries

- [x] **YEARLY-01**: Each year section header displays total workouts for that year
- [x] **YEARLY-02**: Each year section header displays average workouts per week
- [x] **YEARLY-03**: Each year section header displays success rate (% weeks with 3+ workouts)
- [x] **YEARLY-04**: Each year section header displays longest streak in that year
- [x] **YEARLY-05**: Each year section header displays best week in that year
- [x] **YEARLY-06**: Year summaries exclude sick/vacation weeks from calculations
- [x] **YEARLY-07**: Year summaries handle Week 53 edge cases correctly

### Trend Indicators

- [ ] **TREND-01**: User sees trend indicator comparing current month vs previous month
- [ ] **TREND-02**: User sees trend indicator comparing current year vs previous year
- [ ] **TREND-03**: Trend indicators show up arrow (↑) when performance improves
- [ ] **TREND-04**: Trend indicators show down arrow (↓) when performance declines
- [ ] **TREND-05**: Trend indicators show right arrow (→) when performance is stable
- [ ] **TREND-06**: Trend indicators display percentage change (e.g., "+15%")
- [ ] **TREND-07**: User sees comparison vs personal all-time average
- [ ] **TREND-08**: Trend calculations exclude sick/vacation weeks
- [ ] **TREND-09**: Trend calculations are memoized to prevent performance issues
- [ ] **TREND-10**: Consistency percentage stat shows reliability (e.g., "67% of weeks")

### Performance & Polish

- [ ] **PERF-01**: Dashboard loads smoothly with 100+ weeks of historical data
- [x] **PERF-02**: Timeline rendering does not block main thread
- [x] **PERF-03**: Lazy loading prevents Firebase read cost spikes
- [ ] **PERF-04**: Color contrast meets WCAG AA standards (4.5:1 ratio)
- [ ] **PERF-05**: Keyboard navigation works for collapsible sections
- [ ] **PERF-06**: Empty state messaging appears for users with no historical data
- [ ] **PERF-07**: Existing 12-week summary view remains unchanged at top of Dashboard
- [ ] **PERF-08**: Existing day frequency heatmap remains unchanged

## v2 Requirements

Deferred to future milestones. Acknowledged but not in current scope.

### Advanced Analytics

- **EXPORT-01**: User can export workout data to CSV format
- **EXPORT-02**: User can export workout data to JSON format
- **RANGE-01**: User can select custom date ranges for analysis
- **REVIEW-01**: Year-in-review feature generates annual summary (December only)

### Visualization Enhancements

- **CHART-01**: Add optional chart visualizations alongside grids
- **VIRTUAL-01**: Implement TanStack Virtual for 200+ weeks (only if needed)
- **PREDICT-01**: Show predicted trends based on historical patterns

## Out of Scope

Explicitly excluded from this milestone. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Chart libraries (Recharts, D3.js, Chart.js) | Heavy bundles (100KB+) conflict with DOOM retro aesthetic; pure Tailwind grids are lighter and more authentic |
| Workout time tracking | Not part of analytics focus; keep binary tracking simple |
| Exercise type categorization | Complexity creep; Rep & Tear's core value is simplicity |
| Comparison with friends | Focus on personal progress only; social features are separate milestone |
| Custom date range selection | Over-engineering; fixed periods (week/month/year) cover 95% of use cases |
| Data export (CSV/JSON) | Power user feature with <5% usage; implement when actively requested |
| AI predictions | Premature; need more historical data and user validation first |
| Pre-built timeline components (Flowbite, react-chrono) | Material Design conflicts with DOOM theme; custom components required |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| COLOR-01 | Phase 1 | Complete |
| COLOR-02 | Phase 1 | Complete |
| COLOR-03 | Phase 1 | Complete |
| COLOR-04 | Phase 1 | Complete |
| COLOR-05 | Phase 1 | Complete |
| COLOR-06 | Phase 1 | Complete |
| COLOR-07 | Phase 1 | Complete |
| COLOR-08 | Phase 4 | Pending |
| TIMELINE-01 | Phase 2 | Complete |
| TIMELINE-02 | Phase 2 | Complete |
| TIMELINE-03 | Phase 2 | Complete |
| TIMELINE-04 | Phase 2 | Complete |
| TIMELINE-05 | Phase 2 | Pending |
| TIMELINE-06 | Phase 2 | Pending |
| TIMELINE-07 | Phase 2 | Complete |
| TIMELINE-08 | Phase 2 | Pending |
| TIMELINE-09 | Phase 2 | Complete |
| TIMELINE-10 | Phase 2 | Complete |
| TIMELINE-11 | Phase 2 | Complete |
| TIMELINE-12 | Phase 2 | Pending |
| MONTHLY-01 | Phase 2 | Complete |
| MONTHLY-02 | Phase 2 | Complete |
| MONTHLY-03 | Phase 2 | Complete |
| MONTHLY-04 | Phase 2 | Complete |
| MONTHLY-05 | Phase 2 | Complete |
| MONTHLY-06 | Phase 2 | Complete |
| MONTHLY-07 | Phase 2 | Complete |
| YEARLY-01 | Phase 2 | Complete |
| YEARLY-02 | Phase 2 | Complete |
| YEARLY-03 | Phase 2 | Complete |
| YEARLY-04 | Phase 2 | Complete |
| YEARLY-05 | Phase 2 | Complete |
| YEARLY-06 | Phase 2 | Complete |
| YEARLY-07 | Phase 2 | Complete |
| TREND-01 | Phase 3 | Pending |
| TREND-02 | Phase 3 | Pending |
| TREND-03 | Phase 3 | Pending |
| TREND-04 | Phase 3 | Pending |
| TREND-05 | Phase 3 | Pending |
| TREND-06 | Phase 3 | Pending |
| TREND-07 | Phase 3 | Pending |
| TREND-08 | Phase 3 | Pending |
| TREND-09 | Phase 3 | Pending |
| TREND-10 | Phase 3 | Pending |
| PERF-01 | Phase 2 | Pending |
| PERF-02 | Phase 2 | Complete |
| PERF-03 | Phase 2 | Complete |
| PERF-04 | Phase 4 | Pending |
| PERF-05 | Phase 4 | Pending |
| PERF-06 | Phase 4 | Pending |
| PERF-07 | Phase 2 | Pending |
| PERF-08 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 48
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after initial definition*
