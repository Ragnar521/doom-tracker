# Phase 1: Health Bar Color Foundation - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the current traffic light color scheme with a DOOM health bar paradigm. The new system uses green for high workout counts (full health), yellow for moderate counts (damaged), and red for low counts (critical health). This phase establishes the color mapping logic and visual presentation before Phase 2 builds the expandable timeline UI.

</domain>

<decisions>
## Implementation Decisions

### Color Mapping Strategy
- **6-7 workouts** = green (full health)
- **5 workouts** = light green (strong health)
- **3-4 workouts** = yellow (damaged)
- **1-2 workouts** = red (critical health)
- **0 workouts** = no color (very subtle gray/dark background to show tracked but inactive week)

**Green intensity:** Light green for 5 workouts, single darker green for 6-7 workouts (two green shades total)

**Red intensity:** Single red shade for entire 1-2 workout range (no gradient within critical state)

### Visual Presentation
- **Background style:** Solid color fill on entire week cell
- **Text color:** Always white/light gray text regardless of background color
- **Interactive states:** Claude's discretion for hover/click effects (subtle brightness changes preferred)
- **Additional cues:** None - color alone is sufficient (no icons, badges, or patterns in Phase 1)
- **Zero workout appearance:** Very subtle gray/dark background (not completely transparent)

### Transition Handling
- **User communication:** Silent change - no announcement toast or notification
- **Deployment:** Immediate rollout - all users see new colors on next page load
- **Code cleanup:** Completely remove old color logic (no deprecated code or comments)
- **Performance:** No special handling - colors computed on render (React performance sufficient)

### Consistency Boundaries
- **Primary scope:** Dashboard week grid (12-week summary view)
- **Future scope:** Dashboard historical timeline (Phase 2 expandable sections)
- **Excluded:** StatsPanel current week display, WeekTracker page day buttons (different contexts)
- **DoomGuy face:** Keep current face logic unchanged (serves different purpose, already works well)

### Special Week Handling
- **Sick/vacation weeks:** Gold/blue border around normal health bar background color
  - Border color indicates status (gold for sick, blue for vacation)
  - Background color reflects actual workout count using standard health bar mapping
  - Dual visual encoding: border = excuse status, fill = performance

### Architecture
- **Color utility:** Standalone pure function `getHealthColor(workoutCount) => color`
  - Simple, testable, importable anywhere
  - No React hooks or component coupling
  - Centralized single source of truth

### Claude's Discretion
- Exact hover/click interaction effects (keep subtle, match DOOM aesthetic)
- Specific hex color values (match existing doom-green, doom-gold, doom-red from tailwind config)
- Border thickness for sick/vacation indicator (2-3px recommended)

</decisions>

<specifics>
## Specific Ideas

- The color scheme should match the DOOM health bar mental model where green = healthy, yellow = damaged, red = critical
- Zero workout weeks should have "tracked but inactive" visual presence (subtle gray) rather than completely disappearing
- Sick/vacation weeks need to show both their excuse status AND their workout performance through dual visual encoding (border + fill)
- The system should be simple enough that users immediately understand the health metaphor without explanation

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-health-bar-color-foundation*
*Context gathered: 2026-02-25*
