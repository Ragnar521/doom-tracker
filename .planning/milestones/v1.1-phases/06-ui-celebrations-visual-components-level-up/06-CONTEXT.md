# Phase 6: UI & Celebrations - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the visual XP system on the Tracker page: XP progress bar with rank display, XP breakdown modal, and level-up celebration animations. Also removes the "Probability to hit target" section. Squad/friend XP visibility belongs in Phase 7.

</domain>

<decisions>
## Implementation Decisions

### XP bar design
- Positioned below DoomGuy face, above the 7-day workout grid
- DOOM red gradient fill (dark red to bright red), consistent with existing theme
- XP numbers displayed inside the bar (overlaid on fill), RPG-style — e.g. "1,250 / 2,000 XP"
- Rank badge text appears to the left of the bar
- Smooth CSS transition animation when XP increases
- Two-step fill animation on level-up: fill to 100% → brief pause → reset to new level percentage

### XP breakdown modal
- Opens as a bottom sheet / drawer (slides up from bottom) when user taps the XP bar
- Two tabs: "This Week" and "All Time"
- "This Week" tab: base workout XP, streak multiplier applied, achievement bonuses earned this week
- "All Time" tab: lifetime totals from workouts, streaks, and achievements
- Clean numbers/list format — labels with XP values (e.g. "WORKOUTS: +45 XP, STREAK BONUS: x1.5")
- No charts or visual graphs — text-based breakdown only
- Includes rank progression info: current rank name, next rank name, XP remaining until promotion

### Rank badge visuals
- Text-only rank name (no chevron icons or sprite icons) — no extra assets needed
- Tier-based color progression:
  - Low ranks: gray/white text
  - Mid ranks: doom-red text
  - High ranks: doom-gold text
  - Doom Slayer: special glow effect
- Displayed on Tracker page only (not on Achievements page)
- Full rank name shown in the breakdown modal

### Claude's Discretion
- Rank name abbreviated vs full on the XP bar (choose based on available space and readability)
- Level-up celebration toast design and confetti intensity
- Two-step fill animation timing (pause duration between fill-to-100% and reset)
- Bottom sheet height and dismiss behavior
- Tab switcher styling in breakdown modal
- Exact typography and spacing for XP numbers inside the bar
- How to handle very low fill percentages (text visibility when bar is nearly empty)

</decisions>

<specifics>
## Specific Ideas

- XP numbers inside the bar should feel like a classic RPG HP/MP bar
- Bottom sheet is preferred over center modal for mobile-friendliness
- Rank color tiers give visual progression feedback without needing custom icons
- Keep the breakdown simple — numbers and labels, no complex visualizations

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-ui-celebrations-visual-components-level-up*
*Context gathered: 2026-02-26*
