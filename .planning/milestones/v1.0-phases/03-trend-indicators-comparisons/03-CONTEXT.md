# Phase 3: Trend Indicators & Comparisons - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Provide performance context through trend visualization and comparative analytics. Users see momentum arrows showing whether workout consistency is improving, declining, or stable compared to previous periods and their personal all-time average. This phase adds visual indicators and calculations - it does NOT add new data collection or modify existing timeline UI structure.

</domain>

<decisions>
## Implementation Decisions

### Trend Visualization Design
- **Placement:** Trend indicators appear directly in month/year section headers alongside existing stats
- **Arrow Style:** DOOM-themed angular arrows - sharp, pixelated graphics matching retro aesthetic
  - Green ↑ for up trend
  - Red ↓ for down trend
  - Gray → for stable trend
- **Format:** Compact "Arrow + percentage" display (e.g., "↑ +15%" or "↓ -8%")
- **Tooltips:** Self-explanatory only - no hover tooltips, indicators are clear on their own

### Comparison Benchmarks
- **Current Month Trends:**
  - Primary: Compare to previous month (Feb 2026 vs Jan 2026)
  - Secondary: Compare to same month last year (Feb 2026 vs Feb 2025) - only if year-ago data exists
  - Display both side-by-side: "↑ +15% vs Jan" and "↑ +8% vs Feb '25"
- **Current Year Trends:**
  - Compare to previous year only (2026 vs 2025)
  - Format: "↑ +12% vs 2025"
- **All-Time Average Benchmark:**
  - Show in separate stats section above timeline
  - Display overall average: "Your average: 3.8 workouts/week across all time"
  - Include comparison indicator showing current period performance vs all-time average

### Trend Calculation Logic
- **Arrow Direction Thresholds:**
  - Any change triggers arrow (no stability threshold)
  - Up arrow (↑): current > previous
  - Down arrow (↓): current < previous
  - Stable arrow (→): current == previous
- **Percentage Calculation:**
  - Simple percent change: ((current - previous) / previous) * 100
  - Round to whole numbers (e.g., 15%, not 15.3%)
- **Sick/Vacation Week Handling:**
  - Exclude sick and vacation weeks from BOTH current and previous periods
  - Ensures fair comparison (only comparing "normal" weeks)
  - Aligns with how streak calculations work
- **All Sick/Vacation Periods:**
  - If a period has ONLY sick/vacation weeks (no normal weeks), show "N/A" instead of trend
  - Cannot calculate meaningful comparison with no active data

### Empty States and Edge Cases
- **No Previous Period:**
  - Hide trend indicator entirely (e.g., user's first month ever - nothing to compare to)
  - Clean UI, doesn't draw attention to missing data
- **Year-over-Year for New Users:**
  - Hide YoY trend until year-ago data exists
  - February 2026 won't show "vs Feb 2025" if user started in 2026
  - Only month-over-month appears until first anniversary
- **Zero Workout Periods:**
  - Calculate normally and show percentage
  - If Feb has 0 workouts and Jan had 10: show "↓ -100%"
  - If Feb has 10 and Jan had 0: show "↑ ∞" (infinity symbol)
- **Division by Zero (Previous Period = 0):**
  - Display "↑ ∞" using actual infinity symbol
  - Indicates coming back from inactive period

### Claude's Discretion
- Exact pixel sizing and spacing of trend indicators in headers
- Mobile vs desktop responsive breakpoints for dual trend display
- Color shade variations for arrows (exact hex values within DOOM theme)
- Rounding rules for edge case percentages (very small changes)
- Animation/transition timing when trends update

</decisions>

<specifics>
## Specific Ideas

- DOOM-themed angular arrows should match the sharp, pixelated style of achievement badges and face sprites
- All-time average section should feel like a "personal best" stats panel - motivational, not judgmental
- Trend indicators should integrate seamlessly into existing timeline headers without requiring layout restructuring

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-trend-indicators-comparisons*
*Context gathered: 2026-02-25*
