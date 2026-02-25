# Phase 2: Expandable Timeline & Summaries - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Provide complete workout history visualization through collapsible year/month sections with aggregated statistics. Users can explore their full history beyond the existing 12-week summary view. The 12-week summary remains unchanged at top of Dashboard.

</domain>

<decisions>
## Implementation Decisions

### Timeline Hierarchy Structure
- **Default state:** Everything collapsed initially - clean slate, user expands what they want to see
- **Current week treatment:** Current week always visible at top, pinned above timeline sections for quick tracking (separate from historical data)
- **Year ordering:** Newest first (2026, 2025, 2024...) - most recent data at top, scroll down to go back in time
- **Month ordering within years:** Oldest first (Jan, Feb, Mar...) - natural calendar order within each year
- **Week display format:** Full 7-day grid like Tracker page - maintains consistency with existing UI patterns users already understand
- **Multi-expand capability:** Yes - accordion style where multiple years/months can be open simultaneously to support comparison use cases (e.g., summer 2024 vs summer 2025)
- **Bulk controls:** No "collapse all" / "expand all" button - manual expand/collapse only for simplicity

### Summary Statistics Display
- **Month header stats (all 4):**
  - Total workouts (e.g., "23 workouts")
  - Average per week (e.g., "4.2/week")
  - Success rate (e.g., "75% weeks met goal")
  - Best week (e.g., "Best: 6 workouts")
- **Year header stats (all 5):**
  - Total workouts (e.g., "187 workouts")
  - Average per week (e.g., "3.6/week")
  - Success rate (e.g., "68% weeks met goal")
  - Longest streak (e.g., "Best streak: 12 weeks")
  - **God Mode count** (e.g., "God Mode: 8 weeks") - how many weeks with 5+ workouts
- **Layout:** Horizontal row of stat chips - compact, fits on one line on desktop, matches DOOM HUD aesthetic
- **Sick/vacation weeks:** Exclude from all calculations - pretend they don't exist (matches existing streak logic)

### Loading and Performance
- **Load timing:** On expand - lazy loading, only fetch when user clicks to expand
- **Loading state:** Skeleton screens (gray pulsing boxes) matching final layout
- **Caching:** Cache after first load - historical data rarely changes, instant re-expansion
- **Large data handling:** Claude's discretion - choose between virtualization, pagination, or trust React based on performance requirements

### Visual Presentation
- **Hierarchy distinction:** Size-based - year headers larger, month headers smaller, week grids smallest (typography hierarchy)
- **Expand/collapse affordance:** Chevron icon (▶/▼) on left of header - classic accordion pattern, universally understood
- **Animation:** Yes - smooth height transition (200-300ms) for polished feel
- **Dashboard integration:** Timeline appears below existing 12-week summary - preserves familiar flow, timeline is "more details below"

### Claude's Discretion
- Incomplete period labeling (current month/year "In Progress" markers or not)
- Large dataset performance strategy (virtualization vs pagination vs standard rendering)
- Exact skeleton screen design and animation details
- Responsive breakpoints for stat chip layout on mobile
- Edge case handling (years with no data, partial months)

</decisions>

<specifics>
## Specific Ideas

- **God Mode stat** is a special addition to year headers - user wants to celebrate weeks where they achieved 5+ workouts (Berserk/God Mode state from the face system)
- Timeline must not break existing Dashboard - 12-week summary stays at top exactly as-is
- Maintain DOOM aesthetic throughout - panels, frames, colors consistent with existing theme

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 02-expandable-timeline-summaries*
*Context gathered: 2026-02-25*
