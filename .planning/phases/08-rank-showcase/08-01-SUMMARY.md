---
phase: 08-rank-showcase
plan: 01
subsystem: UI/Rank Display
tags:
  - rank-progression
  - ui-component
  - achievements-page
  - guest-handling
dependency_graph:
  requires:
    - Phase 05 XP system (useXP hook)
    - Phase 05 RANKS array definitions
    - Existing achievements page structure
  provides:
    - RankShowcase component
    - Rank progression visualization
  affects:
    - Achievements page layout
    - Guest user experience
tech_stack:
  added:
    - RankShowcase.tsx presentational component
  patterns:
    - Reused .achievement-card CSS pattern
    - Reused .god-mode-glow animation
    - Props drilling for XP data
key_files:
  created:
    - src/components/RankShowcase.tsx (77 lines)
  modified:
    - src/pages/Achievements.tsx (+28 lines, -3 lines)
decisions:
  - Removed totalXP from RankShowcase props (not needed for display)
  - Reused existing CSS patterns (no new classes created)
  - Guest users see sign-in message instead of empty state
  - Loading state includes XP loading check for authenticated users
metrics:
  duration: 2m
  completed: 2026-03-26T10:58:33Z
  tasks: 2
  commits: 2
  files_created: 1
  files_modified: 1
  lines_added: 105
---

# Phase 08 Plan 01: Rank Showcase Summary

**One-liner:** Vertical rank progression ladder with gold-glowing current rank, dimmed locked ranks, and progress indicator showing XP to next rank.

## Objective

Build the Rank Showcase feature: a vertical list of all 15 DOOM military ranks displayed on the Achievements page with visual distinction between earned, current, and locked states.

## What Was Built

### RankShowcase Component (`src/components/RankShowcase.tsx`)

**Presentational component** that receives XP data via props and renders all 15 DOOM military ranks in a vertical list.

**Key Features:**
- **Header:** "RANK PROGRESSION" title with "CLIMB THE LADDER" subtitle
- **15 Rank Cards:** All ranks from #1 Private to #15 Doom Slayer
- **Visual States:**
  - **Current rank:** Gold border + pulsing god-mode-glow animation
  - **Earned ranks:** Full opacity with theme colors (text-gray-400 to text-doom-gold)
  - **Locked ranks:** Dimmed (opacity 0.5) + grayscale (0.8) via `.locked` class
- **Progress Indicator:** Shows "+XXX XP to [Next Rank]" on current rank card only
- **Max Rank Handling:** Shows "MAX RANK ACHIEVED" when at Doom Slayer rank
- **Test Attributes:** All cards have `data-testid="rank-card"`, current rank has `data-current="true"`
- **GPU Optimization:** `willChange: 'box-shadow'` on current rank for smooth animation

**Design Decisions:**
- Reused `.achievement-card` base styling (no new CSS classes needed)
- Reused `.god-mode-glow` animation (consistent with existing DoomFace behavior)
- XP threshold displayed as raw number (e.g., "5000 XP" not "5,000 XP") per plan spec
- Ascending order: Private at top, Doom Slayer at bottom (matches RANKS array order)

### Achievements Page Integration (`src/pages/Achievements.tsx`)

**Added rank showcase above achievements section** with full guest user handling.

**Changes:**
- **New Imports:** `useAuth`, `useXP`, `useAllWeeks`, `useAchievementContext`, `RankShowcase`
- **Hook Calls:** Added useAuth, useAllWeeks, useXP before existing useAchievements
- **Loading Logic:** Updated to include `allWeeksLoading` and `xpLoading` for authenticated users
- **Conditional Rendering:**
  - **Authenticated users:** Show RankShowcase with current rank data
  - **Guest users:** Show "SIGN IN TO UNLOCK RANK PROGRESSION" message in doom-panel
- **Placement:** Rank showcase appears ABOVE existing achievements header (as specified in RANK-05)

**Anti-patterns Avoided:**
- ✅ Did NOT call useXP multiple times (would cause duplicate Firestore writes)
- ✅ Used `weeks` directly from useAllWeeks (already memoized, no destructuring needed)
- ✅ Checked both `!user` AND loading states (prevents flash of wrong content)

## Tasks Completed

### Task 1: Create RankShowcase Presentational Component
**Status:** ✅ Complete
**Commit:** `aa1f01f`
**Files:** `src/components/RankShowcase.tsx` (new, 77 lines)

Created RankShowcase component with:
- Props interface (currentRank, xpToNextRank, nextRank)
- Header section with title and subtitle
- Map over RANKS array with earned/current/locked state logic
- Progress indicator on current rank only
- Test attributes for E2E testing
- GPU performance optimization

**Verification:**
- ✅ TypeScript compiles without errors (`npx tsc --noEmit`)
- ✅ Component exports default
- ✅ All 15 rank cards rendered with correct data-testid
- ✅ Current rank gets data-current="true"
- ✅ Correct visual states (earned/current/locked)

### Task 2: Integrate RankShowcase into Achievements Page
**Status:** ✅ Complete
**Commit:** `31a4edb`
**Files:** `src/pages/Achievements.tsx` (+28, -3)

Integrated RankShowcase with:
- Added required hook imports and calls
- Updated loading state to include XP loading
- Conditional rendering based on user authentication
- Guest message for unauthenticated users
- Placed rank showcase above achievements section

**Verification:**
- ✅ Production build succeeds (`npm run build`)
- ✅ ESLint passes (`npm run lint`)
- ✅ Authenticated users see rank showcase
- ✅ Guest users see sign-in message
- ✅ No flash of incorrect content

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused totalXP prop**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** `totalXP` prop declared in RankShowcaseProps but never used in component (TypeScript error TS6133)
- **Fix:** Removed `totalXP` from props interface and component signature
- **Rationale:** totalXP not needed for display — currentRank, xpToNextRank, and nextRank are sufficient
- **Files modified:** `src/components/RankShowcase.tsx`
- **Commit:** Included in Task 2 commit `31a4edb`

No other deviations — plan executed as written.

## Requirements Coverage

**All 7 requirements from RANK-01 through RANK-07 satisfied:**

- ✅ **RANK-01:** All 15 DOOM military ranks visible on Achievements page
- ✅ **RANK-02:** Each rank shows number, name, tagline, XP threshold
- ✅ **RANK-03:** Current rank highlighted with gold border + pulsing glow
- ✅ **RANK-04:** Earned ranks full opacity with theme colors, unearned dimmed+grayscale
- ✅ **RANK-05:** Rank showcase placed above achievements section
- ✅ **RANK-06:** Progress indicator shows "+XXX XP to next rank" on current rank card
- ✅ **RANK-07:** Guest users see "SIGN IN TO UNLOCK RANK PROGRESSION" message

## Key Insights

### What Worked Well

1. **CSS Reuse Strategy:** Reusing `.achievement-card` and `.god-mode-glow` meant zero new CSS — instant visual consistency with existing components
2. **Presentational Component Pattern:** Props drilling kept RankShowcase simple and testable (no Firebase dependencies)
3. **Loading State Handling:** Including `xpLoading` in loading check prevents flash of wrong content for authenticated users
4. **Guest User Experience:** Showing a message instead of empty state provides better conversion funnel (RANK-07 requirement)

### Technical Notes

1. **Tailwind Color Classes:** rank.color values (text-gray-400, text-green-400, etc.) are string literals scanned by Tailwind's content config — no safelist needed for production builds
2. **GPU Performance:** `willChange: 'box-shadow'` on current rank card prevents animation jank (god-mode-glow uses box-shadow keyframes)
3. **Test Attributes:** data-testid and data-current attributes enable E2E test suite from Plan 08-00

### Future Considerations

1. **Auto-scroll to Current Rank:** Not implemented in this plan — could be added in Phase 8 Plan 02 (mobile UX enhancement)
2. **Rank Card Interactions:** No hover states or click handlers yet — potential for future tooltips or detailed rank info modals
3. **Progress Bar:** Current progress is text-only ("+XXX XP to next") — could add visual progress bar similar to achievement progress bars

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| `aa1f01f` | feat(08-01): create RankShowcase presentational component | src/components/RankShowcase.tsx |
| `31a4edb` | feat(08-01): integrate RankShowcase into Achievements page | src/components/RankShowcase.tsx, src/pages/Achievements.tsx |

## Metrics

- **Duration:** 2 minutes
- **Tasks Completed:** 2/2
- **Files Created:** 1 (RankShowcase.tsx)
- **Files Modified:** 1 (Achievements.tsx)
- **Lines Added:** 105 total (77 new + 28 modified)
- **Commits:** 2 task commits
- **Build Status:** ✅ Passing
- **Lint Status:** ✅ Passing

## Self-Check: PASSED

### Created Files Verification
```bash
✅ FOUND: src/components/RankShowcase.tsx
```

### Commits Verification
```bash
✅ FOUND: aa1f01f (Task 1: RankShowcase component)
✅ FOUND: 31a4edb (Task 2: Achievements integration)
```

All deliverables verified and present.

---

**Plan Status:** ✅ Complete
**Next Plan:** 08-02 (if additional rank showcase features needed) or Phase complete
**Ready for:** STATE.md update, ROADMAP.md update, final metadata commit
