# Phase 8: Rank Showcase - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Display all 15 DOOM military ranks on the Achievements (Glory) page with clear visual distinction between earned, current, and locked states. Includes progress indicator to next rank and guest user handling. No new rank mechanics, no interactive cards, no rank icons/badges.

</domain>

<decisions>
## Implementation Decisions

### Card layout & density
- Card style per rank (small card, not compact row or grid)
- Each card shows: rank number (#1-#15), rank name, tagline, and XP threshold
- XP threshold displayed as raw number (no comma formatting) — e.g., "5000 XP" not "5,000 XP"
- Earned ranks display name in their theme color (text-green-400, text-blue-400, etc. from RANKS array)
- Locked/unearned ranks display name in gray
- Reuse .achievement-card styling pattern for card backgrounds

### Current rank emphasis
- Gold border + subtle pulsing glow effect (reuse existing .god-mode-glow CSS animation)
- Progress indicator appears inside the current rank card as a third line: "+XXX XP to [NEXT RANK]"
- Max rank (Doom Slayer) shows "MAX RANK ACHIEVED" instead of progress

### Scroll & section placement
- Rank showcase is always visible above achievements section (not collapsible)
- Ascending order: #1 Private at top, #15 Doom Slayer at bottom
- No auto-scroll to current rank (user scrolls manually)
- Section has its own doom-panel header (like the ACHIEVEMENTS header) with title and subtitle

### Guest user handling
- Guest users (not signed in) see no rank showcase — XP is authenticated-only (per existing v1.1 decision)
- Requirement RANK-07 specifies "SIGN IN TO UNLOCK RANK PROGRESSION" message

### Claude's Discretion
- Header panel title and subtitle text (e.g., "RANK PROGRESSION" / "CLIMB THE LADDER")
- Exact spacing, padding, and typography sizing within cards
- Whether all 15 rank cards are in one doom-panel or each is its own panel
- Earned vs locked card opacity/grayscale values (can reference .achievement-card.locked pattern: opacity 0.5, grayscale 0.8)
- Guest user message styling and placement

</decisions>

<specifics>
## Specific Ideas

- Card style similar to achievement cards but with rank-specific theme colors for earned ranks
- Current rank card preview mockup: rank number + name on first line, tagline + XP on second line, progress text on third line, all within gold-bordered glowing card
- Rank theme colors create a visual rainbow progression: gray -> green -> blue -> purple -> yellow -> orange -> red -> gold

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/ranks.ts`: RANKS array with all 15 ranks (id, name, xpThreshold, color, tagline) — complete data source
- `src/hooks/useXP.ts`: useXP hook provides totalXP, currentRank, nextRank, xpToNextRank — all needed state
- `.god-mode-glow` CSS class: pulsing gold animation (pulse-gold keyframe, 1.5s infinite) — reuse for current rank highlight
- `.achievement-card` CSS class: card background gradient + border styling — reuse for rank cards
- `.achievement-card.locked`: opacity 0.5 + grayscale 0.8 — reference for locked rank styling

### Established Patterns
- Achievement cards: gradient background (#2a2a2a -> #1a1a1a), 2px border, transitions
- Locked state: opacity + grayscale filter combination
- Unlocked state: gold border-color + gold box-shadow
- doom-panel: 3D beveled panel used for section containers
- Page structure: doom-panel header with title + subtitle, followed by content sections

### Integration Points
- `src/pages/Achievements.tsx`: RankShowcase component renders above the achievement categories
- useXP hook already used in Tracker.tsx — needs to be called in Achievements.tsx or passed via props
- useAuth for guest user check (already available via AuthContext)
- RANKS array imported from `src/lib/ranks.ts`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-rank-showcase*
*Context gathered: 2026-03-26*
