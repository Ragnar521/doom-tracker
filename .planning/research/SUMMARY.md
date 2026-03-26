# Project Research Summary

**Project:** Rep & Tear v1.2 - Rank Showcase Feature
**Domain:** Gamified UI Component (Rank/Level Display)
**Researched:** 2026-03-26
**Confidence:** HIGH

## Executive Summary

The rank showcase feature is a low-risk, high-value UI enhancement that displays all 15 DOOM military ranks with visual distinction between earned, current, and locked states. Research confirms this is a **zero-dependency addition** - every required capability already exists from the v1.1 XP system implementation (React 19.2 list rendering, existing CSS animations, `useXP` hook, RANKS array from `lib/ranks.ts`).

Industry analysis of competitive games (VALORANT, Overwatch, Mobile Legends) reveals consistent patterns: vertical rank ladders with current rank highlighted, earned ranks fully visible, and locked ranks dimmed/grayscaled. These patterns translate directly to existing Rep & Tear design language - the `.achievement-card.locked` pattern for dimmed states and `.god-mode-glow` for highlighting. The implementation requires only a single new component (`RankShowcase.tsx`) and ~30 lines of CSS, integrating seamlessly into the existing Achievements page.

The primary risk is **pointsification** - overwhelming new users with 15 ranks without contextual guidance. Mitigation strategy: implement progressive disclosure with "next rank" focus section, show XP-to-next-rank progress indicator, and consider collapsing distant future ranks. Secondary risks include CLS (cumulative layout shift) from badge images without dimensions, scroll-to-current-rank timing issues, and guest user state handling - all addressable with established patterns documented in PITFALLS.md.

## Key Findings

### Recommended Stack

**Zero new dependencies required.** The rank showcase leverages existing validated capabilities from v1.1.

**Core technologies:**
- **React 19.2** - List rendering via RANKS.map() — Already validated for achievement cards (18 items), 15 ranks is trivial
- **Tailwind CSS 3.4.19** - Responsive grid layout, opacity/grayscale utilities — Existing breakpoint pattern (sm: at 640px) matches WeekNavigation
- **Existing CSS animations** - `.god-mode-glow` for current rank highlight, `.achievement-card.locked` pattern for dimmed states — Reusable without modification

**Data & state:**
- `RANKS` array (lib/ranks.ts) provides all 15 rank definitions with xpThreshold, color, tagline
- `useXP` hook (hooks/useXP.ts) provides currentRank and totalXP for state derivation
- No Firestore queries needed (static data, instant rendering)

**Critical insight:** This is pure composition - combining existing primitives in a new layout. No package.json changes, no new runtime dependencies, no build configuration updates.

### Expected Features

**Must have (table stakes):**
- All 15 ranks visible in vertical list - Standard pattern in every competitive ranking system
- XP threshold displayed per rank - Users need to know progression targets
- Current rank highlighted with visual emphasis - Universal "you are here" indicator pattern
- Earned ranks fully visible, unearned dimmed/grayed - BadgeOS/Steam locked state pattern (50% opacity + grayscale)
- Placement above achievements on Achievements page - Rank systems should be prominent, seen first

**Should have (differentiators):**
- Color-coded rank tiers matching DOOM aesthetic - Gray (Private) → green (learning) → blue (veteran) → purple (elite) → gold (Doom Slayer)
- "Progress to next rank" indicator - "+XXX XP to [Next Rank]" motivates grinding
- Auto-scroll to current rank on mobile - Ensures current rank is immediately visible in long list
- Special golden glow for max rank (Doom Slayer) - Emphasizes ultimate achievement

**Defer (v2+):**
- Rank icons/badges - Would require 15 new assets, project uses text-based ranks everywhere
- Interactive rank cards (click to expand) - Over-engineering, users want simple scannable list
- "Days until next rank" prediction - Complex calculation, misleading if workout frequency changes
- Rank unlock timestamps - Requires new Firestore collection + migration, low value

### Architecture Approach

Integration follows existing Achievements page pattern with minimal structural changes. The RankShowcase component slots between header and achievement categories, consuming XP data from `useXP` hook and rendering the static RANKS array with derived state (isEarned, isCurrent).

**Major components:**
1. **RankShowcase.tsx** (NEW) - Displays 15 ranks in responsive grid, calculates earned/current status from props, implements auto-scroll to current rank on mount
2. **Achievements.tsx** (MODIFIED) - Imports RankShowcase, passes XP data (currentRank, totalXP, loading) via props or context
3. **index.css** (MODIFIED) - Adds ~30 lines for `.rank-card`, `.rank-current`, `.rank-locked` styles with glow animations

**Data flow:** App.tsx (useXP hook) → Achievements.tsx (props) → RankShowcase → map over RANKS array → derive isEarned/isCurrent → apply conditional CSS classes.

**Key architectural decision:** Use React Context (XPContext) vs props drilling. Recommendation: Create XPContext for consistency with existing AchievementContext pattern and future extensibility (XP data likely needed in other pages like Squad leaderboard).

### Critical Pitfalls

1. **Cumulative Layout Shift (CLS) from unspecified badge dimensions** - Badge images without width/height cause content to jump as they load. Prevention: Add explicit width/height attributes to all `<img>` tags from the start, reserve space in layout. Detection: Run Lighthouse audit, check CLS < 0.1 threshold.

2. **Guest user state mismatch on XP display** - Guest users see rank showcase UI but XP system excludes them (Firestore-only per project decision). Prevention: Add auth check before rendering RankShowcase, show "SIGN IN TO UNLOCK RANK PROGRESSION" message for guests. This is critical - confusing UX leads to support burden.

3. **Scroll-to-current-rank timing issues** - Calling scrollIntoView() in useEffect before images load causes incorrect scroll position (current rank appears at edge instead of center). Prevention: Wait for images to load with Promise.all before scrolling. Detection: Test on throttled network (Chrome DevTools → Slow 3G).

4. **GPU overload from overusing will-change** - Applying will-change to all 15 ranks creates excessive compositing layers, causing janky scrolling on mobile. Prevention: Only animate current rank, avoid will-change entirely (CSS animations are GPU-accelerated by default). Limit glow effects to 1-2 elements maximum.

5. **Pointsification - meaningless rank display** - Showing all 15 ranks without context overwhelms new users (gap from Private to Doom Slayer is massive). Prevention: Implement "next rank" focus section with XP progress bar, consider collapsing distant future ranks behind "VIEW ALL RANKS" toggle, highlight actionable feedback ("how to earn XP").

## Implications for Roadmap

Based on research, suggested **single-phase implementation** (4-5 hours total):

### Phase 1: Core Component & CSS Foundation
**Rationale:** Bottom-up approach allows testing in isolation before integration.
**Delivers:**
- `RankShowcase.tsx` component with responsive grid layout (2 cols mobile, 3 tablet, 5 desktop)
- Rank state calculation (isEarned, isCurrent) derived from props
- CSS styles for rank cards, current highlight, locked dimming
**Duration:** 2 hours
**Addresses:** Table stakes features (all ranks visible, current highlighted, earned/locked states)
**Avoids:** CLS pitfall (add image dimensions from start), GPU overload (only animate current rank)

### Phase 2: Integration & Context Setup
**Rationale:** XPContext enables clean data flow, matches existing architecture patterns.
**Delivers:**
- Optional XPContext provider in App.tsx (if data needed beyond Achievements page)
- RankShowcase integrated into Achievements.tsx between header and categories
- Guest user handling (show "sign in to unlock" for unauthenticated users)
**Duration:** 1.5 hours
**Uses:** React Context pattern (mirrors AchievementContext), useXP hook
**Implements:** Data flow architecture (App → Context → Achievements → RankShowcase)
**Avoids:** Guest user state mismatch pitfall (auth check before rendering)

### Phase 3: Polish & Mobile Optimization
**Rationale:** Auto-scroll and progress indicator are high-value differentiators.
**Delivers:**
- Auto-scroll to current rank on mount (useEffect + useRef + scrollIntoView)
- "Progress to next rank" indicator (+XXX XP to [Next Rank])
- Special golden glow for max rank (Doom Slayer when earned)
- Responsive breakpoint alignment (use sm: at 640px to match WeekNavigation)
**Duration:** 1 hour
**Addresses:** Differentiator features (auto-scroll, next rank progress)
**Avoids:** Scroll timing pitfall (wait for images to load), breakpoint mismatch pitfall

### Phase Ordering Rationale

- **Component-first approach:** Build RankShowcase in isolation with mock props before wiring up real data - enables faster iteration and testing
- **Context before integration:** Establish data flow pattern before adding UI - prevents prop drilling refactors later
- **Polish last:** Core functionality must work before adding nice-to-haves - avoids feature creep and keeps MVP focused

**Single-phase feasibility:** Given low complexity and zero dependencies, this could be implemented as a single atomic phase. However, three sub-phases provide better checkpoints for validation and easier rollback if issues arise.

### Research Flags

**Phases with standard patterns (skip research-phase):**
- **All phases** - Rank showcase uses well-documented patterns from competitive games (VALORANT, Overwatch rank ladders), established React list rendering, and existing Rep & Tear component patterns (Achievements page structure). No need for additional research during planning.

**No deeper research needed:** All implementation patterns are validated, all pitfalls are documented with prevention strategies, all stack capabilities are pre-existing.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | All capabilities validated in v1.1 XP system - no new dependencies, existing patterns proven |
| Features | **HIGH** | Table stakes verified across 5+ competitive games (VALORANT, Overwatch, Mobile Legends), visual patterns confirmed in BadgeOS/Steam |
| Architecture | **HIGH** | Direct codebase analysis confirms integration points, existing Achievements page provides clear template, XPContext follows established pattern |
| Pitfalls | **HIGH** | CLS/scroll timing backed by official sources (web.dev, MDN), guest user handling derived from project context, pointsification from gamification research |

**Overall confidence:** **HIGH**

All research areas converge on the same conclusion: this is a low-risk, high-value feature with established patterns and pre-existing capabilities.

### Gaps to Address

**Minor uncertainty in mobile optimization:**
- Auto-scroll behavior may need adjustment for different screen sizes (iPhone SE vs iPad)
- How to handle: Test on real devices (not just DevTools emulation), use scrollIntoView with `block: 'center'` for consistent positioning
- Validation: Throttled network testing to ensure scroll waits for images

**Guest user messaging decision:**
- Option A: Hide rank showcase entirely for guests (cleaner)
- Option B: Show dimmed/blurred ranks with "SIGN IN TO UNLOCK" overlay (better discoverability)
- How to handle: Choose Option B during implementation for better conversion funnel - show what they're missing
- Validation: User testing to ensure messaging is clear, not confusing

**Progressive disclosure implementation:**
- Should distant future ranks be collapsed behind "VIEW ALL RANKS"?
- How to handle: Start with all 15 visible, add collapse feature only if user feedback indicates overwhelm
- Validation: Monitor user behavior - do people scroll the full list, or do they only look at next 2-3 ranks?

These are implementation details, not research gaps - confidence in core approach remains high.

## Sources

### Primary (HIGH confidence)
- **Rep & Tear codebase** - Direct analysis of useXP.ts, ranks.ts, Achievements.tsx, index.css confirms all integration points and existing patterns
- **CLAUDE.md project context** - Responsive breakpoints (sm: at 640px), DOOM aesthetic requirements, guest user exclusion policy, component structure conventions
- **VALORANT/Overwatch/Mobile Legends rank systems** - Verified industry patterns for rank display (vertical ladder, current highlight, locked dimming)
- **web.dev CLS Guide** - Official source for cumulative layout shift prevention (image dimensions)
- **MDN will-change documentation** - Authoritative guidance on GPU optimization pitfalls
- **React 19.2 official docs** - List rendering patterns, hooks best practices

### Secondary (MEDIUM confidence)
- **BadgeOS gamification plugin** - Badge locked state patterns (50% opacity for unearned)
- **React scroll position best practices** - Medium articles on scrollIntoView timing with image loading
- **Gamification UX guides** - Pointsification warnings, progressive disclosure recommendations
- **Glassmorphism performance 2026** - GPU memory considerations for visual effects

### Tertiary (LOW confidence, needs validation)
- **Specific mobile scroll behavior** - Real device testing required to validate auto-scroll UX
- **Progressive disclosure effectiveness** - User testing needed to determine if rank list collapse is valuable

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
