---
phase: 06-ui-celebrations-visual-components-level-up
plan: 02
subsystem: ui-xp-display
tags:
  - xp-system
  - ui-components
  - animations
  - bottom-sheet
dependency_graph:
  requires:
    - phase: 06
      plan: 01
      artifact: XPBar component with onClick handler
    - phase: 05
      plan: 01
      artifact: useXP hook with breakdown data
    - phase: 04
      plan: 02
      artifact: getWeeklyXPBreakdown formula
  provides:
    - XPBreakdownModal component (bottom sheet with tabs)
    - XP breakdown UI integration in Tracker page
  affects:
    - Tracker page (XP bar now clickable, opens modal)
    - User understanding of XP composition
tech_stack:
  added: []
  patterns:
    - Bottom sheet modal with slide animations
    - Two-tab interface (This Week / All Time)
    - Body scroll lock during modal display
    - Backdrop dismiss interaction
key_files:
  created:
    - src/components/XPBreakdownModal.tsx
  modified:
    - src/pages/Tracker.tsx
    - src/index.css
decisions:
  - title: "Bottom sheet modal over full-screen modal"
    rationale: "Bottom sheets feel more natural on mobile (primary use case) and provide better UX for quick information display without losing context"
    alternatives: ["Full-screen modal", "Popover tooltip", "Inline expansion"]
    impact: "Better mobile UX, familiar pattern from native apps"
  - title: "Two-tab layout instead of single view"
    rationale: "Separating 'This Week' (current progress) from 'All Time' (lifetime stats) reduces cognitive load and allows focused viewing"
    alternatives: ["Single combined view", "Three tabs (This Week/This Month/All Time)", "Accordion sections"]
    impact: "Cleaner information hierarchy, easier to scan"
  - title: "Rank progression always visible below tabs"
    rationale: "Rank info is critical context for XP numbers - keeping it visible in both tabs reinforces progression goals"
    alternatives: ["Third tab for rank info", "Only in All Time tab", "Separate modal"]
    impact: "Consistent rank context, better goal visibility"
  - title: "Slide-up/down animations with exit delay"
    rationale: "Animation provides visual feedback for modal open/close, 300ms delay allows smooth exit animation before unmounting"
    alternatives: ["Instant show/hide", "Fade only", "Scale animation"]
    impact: "Polished UX, matches native app feel"
metrics:
  duration: 160
  completed_at: "2026-02-26T12:31:03Z"
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  commits: 2
---

# Phase 06 Plan 02: XP Breakdown Modal & Rank Progression Summary

**One-liner:** Bottom sheet modal with two-tab XP breakdown (This Week base/streak, All Time workout/achievement totals) and rank progression display, wired to XP bar click on Tracker page.

## Objective Achieved

Created XPBreakdownModal component as a bottom sheet with "This Week" and "All Time" tabs showing detailed XP composition. Integrated modal into Tracker page with click handler on XP bar. Users can now tap the XP bar to see exactly how their XP is calculated, including workout base XP, streak multipliers, achievement bonuses, and rank progression info.

## Tasks Completed

### Task 1: Create XPBreakdownModal bottom sheet component
**Status:** ✅ Complete
**Commit:** `2953be7`
**Files:** `src/components/XPBreakdownModal.tsx`, `src/index.css`

**Implementation:**
- **XPBreakdownModal component** (249 lines):
  - Props: isOpen, onClose, workoutCount, currentStreak, weekStatus, totalXP, achievementXP, currentRank, nextRank, xpToNextRank
  - Bottom sheet container with fixed backdrop (`bg-black/80 backdrop-blur-sm`)
  - Slide-up/down animations with `isLeaving` state for smooth exit (300ms delay before unmounting)
  - Body scroll lock via useEffect (sets `document.body.style.overflow = 'hidden'` when open)
  - Drag handle indicator at top (cosmetic gray bar)
  - Close button (✕) in top-right corner
  - Backdrop tap to dismiss functionality

- **Two-tab interface**:
  - `activeTab` state: `'week' | 'alltime'`, default `'week'`
  - Tab buttons with active/inactive styling (doom-gold active, gray-500 inactive)
  - Active tab has bottom border in doom-gold

- **"This Week" tab content**:
  - Calls `getWeeklyXPBreakdown(workoutCount, currentStreak, weekStatus)` for breakdown data
  - Shows workout base XP: `+${breakdown.baseXP} XP` in white
  - Shows streak multiplier: `×${breakdown.streakMultiplier}` in doom-gold (gray if 1.0x)
  - Shows week total: `+${breakdown.totalXP} XP` in doom-green, bold
  - Special case: sick/vacation weeks show "No XP earned during {weekStatus} weeks" message

- **"All Time" tab content**:
  - Calculates workout XP as `totalXP - achievementXP`
  - Shows workout XP with thousands separator (includes all streak bonuses)
  - Shows achievement XP (100 XP per achievement unlocked)
  - Shows total XP in doom-green, bold

- **Rank progression section** (always visible below tabs):
  - "RANK PROGRESSION" header in doom-gold
  - Current rank with tier color and tagline in gray italic
  - Next rank with tier color and "X,XXX XP to go" message
  - Special case: max rank shows "MAXIMUM RANK ACHIEVED" in doom-gold

- **CSS animations added to index.css**:
  - `.animate-slideUp`: slide-up 0.3s ease-out forwards
  - `.animate-slideDown`: slide-down 0.3s ease-out forwards
  - Keyframes for smooth bottom sheet appearance/disappearance

### Task 2: Wire XPBreakdownModal into Tracker page
**Status:** ✅ Complete
**Commit:** `ddf21c2`
**Files:** `src/pages/Tracker.tsx`, `src/components/XPBreakdownModal.tsx`

**Implementation:**
- Added import: `import XPBreakdownModal from '../components/XPBreakdownModal';`
- Added state: `const [showXPBreakdown, setShowXPBreakdown] = useState(false);`
- Destructured additional values from useXP hook:
  - `achievementXP` (needed for All Time tab)
  - `xpToNextRank` (needed for rank progression section)
- Updated XPBar onClick handler: `onClick={() => setShowXPBreakdown(true)}`
- Rendered XPBreakdownModal at end of Tracker return (after LevelUpToast):
  ```tsx
  <XPBreakdownModal
    isOpen={showXPBreakdown}
    onClose={() => setShowXPBreakdown(false)}
    workoutCount={workoutCount}
    currentStreak={allWeeksStats.currentStreak}
    weekStatus={weekData.status}
    totalXP={totalXP}
    achievementXP={achievementXP}
    currentRank={currentRank}
    nextRank={nextRank}
    xpToNextRank={xpToNextRank}
  />
  ```
- Added eslint-disable comment for intentional setState in effect (animation control for isLeaving state)

## Deviations from Plan

**No deviations** - plan executed exactly as written.

All requirements met:
- ✅ Bottom sheet slides up from bottom on XP bar tap
- ✅ Two tabs: "This Week" and "All Time"
- ✅ "This Week" shows base workout XP, streak multiplier, week total
- ✅ "All Time" shows lifetime workout XP, achievement XP, total XP
- ✅ Rank progression section shows current rank, next rank, XP remaining
- ✅ Backdrop tap dismisses modal with slide-down animation
- ✅ Body scroll lock while modal is open
- ✅ No TypeScript, lint, or build errors

## Technical Highlights

### Bottom Sheet Animation Pattern
Smooth slide-up/down animations with exit delay for polished UX:
```typescript
const handleClose = () => {
  setIsLeaving(true);
  setTimeout(() => {
    onClose();
    setIsLeaving(false);
  }, 300);
};

// CSS class applied based on state
className={`... ${isLeaving ? 'animate-slideDown' : 'animate-slideUp'}`}
```

### Tab Switching UI
Clean two-tab interface with active state styling:
```tsx
<button
  onClick={() => setActiveTab('week')}
  className={`flex-1 py-2 text-[10px] tracking-widest font-bold transition-colors ${
    activeTab === 'week'
      ? 'text-doom-gold border-b-2 border-doom-gold -mb-[2px]'
      : 'text-gray-500'
  }`}
>
  THIS WEEK
</button>
```

### Data Flow Integration
Modal receives live data from multiple sources:
```typescript
// From useWeek hook
workoutCount={workoutCount}
weekStatus={weekData.status}

// From useAllWeeks hook
currentStreak={allWeeksStats.currentStreak}

// From useXP hook
totalXP={totalXP}
achievementXP={achievementXP}
currentRank={currentRank}
nextRank={nextRank}
xpToNextRank={xpToNextRank}
```

### Body Scroll Lock Pattern
Prevents background scrolling on mobile while modal is open:
```typescript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }
}, [isOpen]);
```

## Requirements Traceability

**Requirements fulfilled:**
- ✅ **UI-04**: XP breakdown modal accessible via XP bar tap
- ✅ Two-tab interface (This Week / All Time)
- ✅ This Week tab shows base XP, streak multiplier, week total
- ✅ All Time tab shows workout XP, achievement XP, lifetime total
- ✅ Rank progression info visible in modal (current rank, next rank, XP remaining)
- ✅ Bottom sheet slide animations (up on open, down on close)
- ✅ Backdrop tap to dismiss

## Verification Results

✅ **TypeScript compilation:** No errors
✅ **ESLint:** No errors or warnings
✅ **Production build:** Success (695.21 kB main bundle, gzipped: 214.38 kB)
✅ **Component structure:** XPBreakdownModal.tsx (249 lines)
✅ **CSS classes added:** `.animate-slideUp`, `.animate-slideDown`
✅ **Tracker page integration:** XPBar onClick wired, modal renders with correct props

**Manual verification required:**
- [ ] Tap XP bar on Tracker page → bottom sheet slides up
- [ ] "This Week" tab shows workout count base XP (5/15/30/50/80/100 based on workout count)
- [ ] "This Week" tab shows streak multiplier (1.0x / 1.5x / 1.75x / 2.0x / 2.5x)
- [ ] "This Week" tab shows correct week total (base XP × multiplier)
- [ ] Sick/vacation weeks show "No XP earned" message in This Week tab
- [ ] "All Time" tab shows lifetime workout XP with thousands separator
- [ ] "All Time" tab shows achievement XP (100 per achievement)
- [ ] "All Time" tab shows correct total XP
- [ ] Rank progression section shows current rank with correct tier color
- [ ] Rank progression section shows next rank and XP remaining
- [ ] Max rank shows "MAXIMUM RANK ACHIEVED" message
- [ ] Modal dismisses on backdrop tap with slide-down animation
- [ ] Body scroll is locked while modal is open (mobile testing)

## Dependencies & Integration Points

**Upstream dependencies (consumed):**
- `useXP()` from Phase 05-01 (totalXP, achievementXP, currentRank, nextRank, xpToNextRank)
- `useAllWeeks()` from Phase 05-01 (stats.currentStreak)
- `useWeek()` from Phase 05-02 (workoutCount, weekData.status)
- `getWeeklyXPBreakdown()` from Phase 04-02 (base XP, streak multiplier, total XP)
- `RANKS` array from Phase 04-01 (rank colors, names, taglines)
- XPBar component from Phase 06-01 (onClick handler)

**Downstream impact (provides):**
- XPBreakdownModal component available for future use (Dashboard, Settings)
- User understanding of XP composition improved (transparency)
- XP system feels more complete and trustworthy

## Performance Notes

- Bottom sheet renders conditionally (`if (!isOpen && !isLeaving) return null`)
- No unnecessary re-renders (component unmounts when closed)
- CSS animations run on GPU (transform property, no layout thrashing)
- Body scroll lock prevents scroll performance issues on iOS
- No performance regressions in production build (bundle size increase ~5KB for modal component)

## User Experience Impact

**Positive changes:**
- Users can now see exactly how XP is calculated (transparency builds trust)
- Two-tab layout reduces information overload
- Rank progression visible in context of XP numbers (clearer goals)
- Bottom sheet feels natural on mobile (primary use case)
- Smooth animations provide polished, professional feel

**User flow:**
1. User taps XP bar → bottom sheet slides up
2. User sees "This Week" tab by default (most relevant for current session)
3. User can switch to "All Time" tab to see lifetime totals
4. User sees rank progression info below tabs (consistent context)
5. User taps backdrop or close button → modal slides down and dismisses

## Next Steps

**Immediate follow-up (Phase 06 Plan 03 - if exists):**
- Rank-up animations in DoomFace component (face celebration on level-up)
- Achievement notification improvements (XP gain shown in toast)

**Future enhancements:**
- XP history chart in Dashboard (visualize XP gain over time)
- Weekly XP leaderboard in Squad page (compare with friends)
- XP milestones (celebrate every 1000 XP gained)
- XP breakdown export (CSV download for power users)

## Self-Check: PASSED

**Files created:**
- ✅ `src/components/XPBreakdownModal.tsx` exists (249 lines)

**Files modified:**
- ✅ `src/pages/Tracker.tsx` modified (XPBreakdownModal imported and rendered)
- ✅ `src/index.css` modified (slideUp/Down animations added)

**Commits:**
- ✅ `2953be7`: feat(06-02): create XPBreakdownModal bottom sheet component
- ✅ `ddf21c2`: feat(06-02): wire XPBreakdownModal into Tracker page

**Verification:**
- ✅ TypeScript compiles without errors
- ✅ ESLint passes with no warnings
- ✅ Production build succeeds
- ✅ All task done criteria met
- ✅ All must-have truths satisfied
- ✅ All key-links verified (XPBreakdownModal imported, getWeeklyXPBreakdown called)

---

**Execution time:** 160 seconds (~2.7 minutes)
**Completed:** 2026-02-26T12:31:03Z
**Executor:** Claude Sonnet 4.5
**Status:** ✅ Complete
