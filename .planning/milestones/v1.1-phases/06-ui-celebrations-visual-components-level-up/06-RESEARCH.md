# Phase 6: UI & Celebrations (Visual Components & Level-Up) - Research

**Researched:** 2026-02-26
**Domain:** React UI components, CSS animations, modal/drawer patterns
**Confidence:** HIGH

## Summary

Phase 6 implements the visual XP system on the Tracker page: an animated XP progress bar with rank display, a tappable breakdown modal (bottom sheet), and level-up celebrations (toast + confetti). The foundation is already complete — Phase 4 established rank definitions and XP formulas, Phase 5 built the useXP hook with level-up event emission. This phase is pure UI: creating React components that consume existing data structures and hooks.

The project already has established patterns for all necessary UI primitives: progress bars (`.progress-bar`, `.progress-fill` in index.css), toasts (AchievementToast.tsx, Toast.tsx), confetti (Confetti.tsx), and modals (Modal.tsx). The DOOM aesthetic uses dark red gradients, metallic panels with beveled borders, and gold accents. Animations use CSS transitions and keyframes — no external animation libraries.

**Primary recommendation:** Build three new components (XPBar, XPBreakdownModal, LevelUpToast) following existing toast/modal/progress patterns. Replace "Probability to hit target" section on Tracker page with XPBar. Use CSS transitions for smooth fill animations and implement two-step fill on level-up (fill to 100% → pause 800ms → reset to new level with smooth transition).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**XP bar design:**
- Positioned below DoomGuy face, above the 7-day workout grid
- DOOM red gradient fill (dark red to bright red), consistent with existing theme
- XP numbers displayed inside the bar (overlaid on fill), RPG-style — e.g. "1,250 / 2,000 XP"
- Rank badge text appears to the left of the bar
- Smooth CSS transition animation when XP increases
- Two-step fill animation on level-up: fill to 100% → brief pause → reset to new level percentage

**XP breakdown modal:**
- Opens as a bottom sheet / drawer (slides up from bottom) when user taps the XP bar
- Two tabs: "This Week" and "All Time"
- "This Week" tab: base workout XP, streak multiplier applied, achievement bonuses earned this week
- "All Time" tab: lifetime totals from workouts, streaks, and achievements
- Clean numbers/list format — labels with XP values (e.g. "WORKOUTS: +45 XP, STREAK BONUS: x1.5")
- No charts or visual graphs — text-based breakdown only
- Includes rank progression info: current rank name, next rank name, XP remaining until promotion

**Rank badge visuals:**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RANK-02 | User sees rank-up celebration (toast + confetti) when reaching a new rank | Existing AchievementToast.tsx + Confetti.tsx patterns apply directly. useXP hook already emits levelUpEvent with previousRank/newRank. Create LevelUpToast component consuming levelUpEvent. |
| UI-01 | User sees XP progress bar and current rank on the Tracker page | Create XPBar component positioned between DoomFace and WeekTracker. Use existing `.progress-bar` and `.doom-panel` CSS classes. Display currentRank and totalXP from useXP hook. |
| UI-02 | XP bar shows animated fill when XP increases | Use CSS transition on width property (transition: width 0.5s ease-out). Existing `.progress-fill` pattern shows how to handle smooth transitions. React state change triggers automatic re-render with new width percentage. |
| UI-03 | XP bar displays numerical progress (current XP / XP needed for next rank) | Calculate percentage: (totalXP - currentRank.xpThreshold) / (nextRank.xpThreshold - currentRank.xpThreshold). Display as "X,XXX / Y,YYY XP" overlaid on progress bar. Handle max rank edge case (nextRank === null). |
| UI-04 | User can tap XP bar to see XP breakdown (base workout XP + streak bonus + achievement bonus) | Create XPBreakdownModal bottom sheet component. Open on click handler. Fetch current week data from useWeek hook, calculate breakdown using getWeeklyXPBreakdown() from xpFormulas.ts. Display two tabs with conditional rendering. |
| UI-05 | "Probability to hit target" section is removed from Tracker page | Delete lines 110-135 from Tracker.tsx (probability calculation logic + progress bar JSX). Replace with XPBar component. |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19.2 | 19.2 | UI framework | Already project standard, all components use React hooks |
| TypeScript 5.9 | ~5.9 | Type safety | Strict mode enabled, all components are typed |
| Tailwind CSS 3.4 | 3.4 | Styling framework | Project uses utility-first approach with DOOM-themed extensions |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | - | All patterns exist in codebase |

**Zero new dependencies** — User decision from Phase 4. All UI primitives (modals, toasts, animations) already implemented in project.

**Installation:**
```bash
# No installation needed — use existing dependencies
```

## Architecture Patterns

### Recommended Component Structure

```
src/components/
├── XPBar.tsx              # Main XP progress bar (NEW)
├── XPBreakdownModal.tsx   # Bottom sheet drawer (NEW)
├── LevelUpToast.tsx       # Rank-up celebration (NEW)
├── AchievementToast.tsx   # Existing pattern reference
├── Confetti.tsx           # Existing confetti component (reuse)
└── ui/
    └── Modal.tsx          # Existing modal base (reference for bottom sheet)
```

### Pattern 1: XP Progress Bar Component

**What:** Self-contained XP bar with rank badge, fill animation, and click handler
**When to use:** Display current XP state with interactive tap-to-details behavior
**Example:**
```typescript
// Source: Existing progress bar pattern from Tracker.tsx + DOOM panel styling
interface XPBarProps {
  currentRank: Rank;
  nextRank: Rank | null;
  totalXP: number;
  xpToNextRank: number;
  onClick: () => void;
}

export default function XPBar({ currentRank, nextRank, totalXP, xpToNextRank, onClick }: XPBarProps) {
  // Calculate fill percentage
  const currentRankBaseXP = currentRank.xpThreshold;
  const nextRankXP = nextRank?.xpThreshold || totalXP;
  const xpIntoCurrentRank = totalXP - currentRankBaseXP;
  const xpNeededForNextRank = nextRankXP - currentRankBaseXP;
  const fillPercent = Math.min(100, (xpIntoCurrentRank / xpNeededForNextRank) * 100);

  return (
    <div className="doom-panel p-3 cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-bold tracking-wider ${currentRank.color}`}>
          {currentRank.name.toUpperCase()}
        </span>
      </div>
      <div className="relative h-6 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#2a2a2a] rounded overflow-hidden">
        {/* Animated fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7a1a1a] to-[#b91c1c] transition-all duration-500 ease-out"
          style={{ width: `${fillPercent}%` }}
        />
        {/* XP text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {totalXP.toLocaleString()} / {nextRank ? nextRankXP.toLocaleString() : '∞'} XP
          </span>
        </div>
      </div>
    </div>
  );
}
```

### Pattern 2: Bottom Sheet Modal

**What:** Mobile-friendly drawer that slides up from bottom (alternative to center modal)
**When to use:** Mobile-first UI, better thumb ergonomics, less intrusive than center modal
**Example:**
```typescript
// Source: Adapting existing Modal.tsx for bottom sheet behavior
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 doom-panel rounded-t-lg max-h-[80vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// CSS keyframe (add to index.css)
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
```

### Pattern 3: Level-Up Toast with Two-Step Fill Animation

**What:** Toast notification for rank-up events with animated confetti
**When to use:** When useXP.levelUpEvent is not null, display celebration
**Example:**
```typescript
// Source: AchievementToast.tsx pattern
interface LevelUpToastProps {
  event: LevelUpEvent;
  onDismiss: () => void;
}

export default function LevelUpToast({ event, onDismiss }: LevelUpToastProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => onDismiss(), 5000); // 5s duration
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <>
      <Confetti trigger={showConfetti} />
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 doom-panel p-4 border-2 border-doom-gold animate-fadeIn">
        <div className="text-center">
          <p className="text-doom-gold text-[10px] tracking-widest mb-1">RANK PROMOTION</p>
          <p className="text-white text-sm font-bold">{event.newRank.name.toUpperCase()}</p>
          <p className="text-gray-400 text-[8px]">{event.newRank.tagline}</p>
        </div>
      </div>
    </>
  );
}
```

### Pattern 4: Two-Step Fill Animation on Level-Up

**What:** Visual feedback showing XP bar filling to 100%, pausing, then resetting to new rank percentage
**When to use:** When levelUpEvent is detected, trigger special animation sequence
**Example:**
```typescript
// Implementation strategy in XPBar component
const [isLevelingUp, setIsLevelingUp] = useState(false);
const [animatedFillPercent, setAnimatedFillPercent] = useState(fillPercent);

useEffect(() => {
  // Detect level-up by comparing current rank ID with previous
  const prevRankRef = useRef(currentRank.id);

  if (currentRank.id > prevRankRef.current) {
    // Level-up detected: two-step animation
    setIsLevelingUp(true);

    // Step 1: Fill to 100%
    setAnimatedFillPercent(100);

    // Step 2: After 800ms pause, reset to actual new percentage
    setTimeout(() => {
      setAnimatedFillPercent(fillPercent);
      setIsLevelingUp(false);
    }, 800);
  } else {
    // Normal XP gain: smooth transition to new percentage
    setAnimatedFillPercent(fillPercent);
  }

  prevRankRef.current = currentRank.id;
}, [currentRank.id, fillPercent]);

// In JSX, use animatedFillPercent instead of fillPercent
<div style={{ width: `${animatedFillPercent}%` }} className="transition-all duration-500" />
```

### Pattern 5: Tab Switcher for Breakdown Modal

**What:** Simple two-tab switcher ("This Week" / "All Time") using conditional rendering
**When to use:** When displaying different data views in same modal
**Example:**
```typescript
// Source: Common React pattern, similar to Settings.tsx sections
const [activeTab, setActiveTab] = useState<'week' | 'alltime'>('week');

return (
  <div>
    {/* Tab buttons */}
    <div className="flex border-b-2 border-gray-800">
      <button
        onClick={() => setActiveTab('week')}
        className={`flex-1 py-2 text-[10px] font-bold tracking-wider transition-colors ${
          activeTab === 'week'
            ? 'text-doom-gold border-b-2 border-doom-gold'
            : 'text-gray-500'
        }`}
      >
        THIS WEEK
      </button>
      <button
        onClick={() => setActiveTab('alltime')}
        className={`flex-1 py-2 text-[10px] font-bold tracking-wider transition-colors ${
          activeTab === 'alltime'
            ? 'text-doom-gold border-b-2 border-doom-gold'
            : 'text-gray-500'
        }`}
      >
        ALL TIME
      </button>
    </div>

    {/* Tab content */}
    <div className="p-4">
      {activeTab === 'week' ? (
        <WeeklyBreakdown />
      ) : (
        <AllTimeBreakdown />
      )}
    </div>
  </div>
);
```

### Anti-Patterns to Avoid

- **Don't use external animation libraries** — Project decision is CSS-only animations. Existing patterns (toast-slide, fadeIn, confetti-fall) are sufficient.
- **Don't create new modal components from scratch** — Adapt existing Modal.tsx pattern for bottom sheet behavior (just change position from center to bottom).
- **Don't fetch XP data inside XPBar** — Component should be presentational only, receive all data via props from Tracker.tsx parent (which uses useXP hook).
- **Don't hardcode rank colors in components** — Use rank.color property from RANKS array (already has Tailwind classes like 'text-gray-400', 'text-doom-gold').
- **Don't forget max rank edge case** — When user reaches Doom Slayer (rank 15), nextRank is null. XP bar should show "100,000 / ∞ XP" and 100% fill.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bottom sheet modal | Custom slide-up drawer logic | Adapt existing Modal.tsx + CSS animation | Modal.tsx already handles backdrop, keyboard events, body scroll lock. Just change positioning (absolute bottom-0 instead of center) and animation (slideUp instead of scaleIn). |
| Number formatting | Custom locale string logic | Native toLocaleString() | Already used in project (StatsPanel.tsx), handles thousands separators automatically. |
| XP breakdown calculation | Manual XP aggregation | Use getWeeklyXPBreakdown() from xpFormulas.ts | Phase 4 implemented this helper function specifically for UI tooltips/modals. Handles base XP, streak multiplier, status filtering. |
| Level-up detection | Manual XP threshold checking | Use checkRankUp() from ranks.ts | Phase 4 implemented this function. Compares previous XP to new XP, returns LevelUpEvent if rank changed. useXP hook already emits this. |
| Rank color logic | Switch statements on rank ID | Use rank.color property | RANKS array already has Tailwind color classes for each rank. Direct property access, no logic needed. |

**Key insight:** Phase 4 and 5 already built all the data structures and business logic. Phase 6 is pure presentation layer — consuming existing hooks (useXP, useWeek, useAllWeeks) and utility functions (getWeeklyXPBreakdown, checkRankUp). The only "new" code is JSX and CSS animations.

## Common Pitfalls

### Pitfall 1: Text Visibility on Empty Progress Bar

**What goes wrong:** When XP bar is nearly empty (0-5% fill), white XP text is hard to read against dark background (no red gradient fill behind it).

**Why it happens:** XP text is absolute-positioned over the bar. When fill width is small, text sits on dark background instead of red gradient.

**How to avoid:** Use text-shadow or drop-shadow to ensure text is always readable. Project already uses this pattern:
```css
drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]
```
Alternatively, consider minimum fill width of 5% to ensure some gradient always shows, or switch text color based on fill percentage.

**Warning signs:** User complaints about unreadable XP numbers when starting new rank, visual regression on low XP states.

### Pitfall 2: Infinite Render Loop with useEffect Dependencies

**What goes wrong:** XPBar component triggers infinite re-renders when watching non-primitive dependencies like `currentRank` object.

**Why it happens:** React compares dependency array values with `Object.is()`. New object references on each render cause useEffect to fire repeatedly.

**How to avoid:** Use PRIMITIVE dependencies only (currentRank.id, totalXP) not objects (currentRank). Reference from useXP hook implementation:
```typescript
// GOOD: Primitive dependencies
const currentRank: Rank = useMemo(() => getRankForXP(totalXP), [totalXP]);
const nextRank: Rank | null = useMemo(() => getNextRank(currentRank.id), [currentRank.id]);

// BAD: Object dependencies
useEffect(() => { ... }, [currentRank]); // Would cause infinite loop
```

**Warning signs:** Browser freezing, React DevTools showing thousands of renders, "Maximum update depth exceeded" error.

### Pitfall 3: Bottom Sheet Animation Race Condition

**What goes wrong:** Bottom sheet closes instantly instead of sliding down, or shows visual "jump" when opening.

**Why it happens:** React removes component from DOM before CSS animation completes. Need to delay unmount until animation finishes.

**How to avoid:** Use same pattern as AchievementToast and Toast components — track `isLeaving` state, apply exit animation class, delay onClose callback:
```typescript
const handleClose = () => {
  setIsLeaving(true);
  setTimeout(() => onClose(), 300); // Match CSS animation duration
};
```

**Warning signs:** Modal disappears instantly instead of sliding down, users report "jumpy" animations.

### Pitfall 4: Level-Up Toast Overlapping Achievement Toast

**What goes wrong:** If user unlocks achievement and ranks up simultaneously (achievement grants +100 XP, pushes over rank threshold), two toasts render on top of each other.

**Why it happens:** AchievementToast and LevelUpToast both use `fixed top-4` positioning. No toast queue system exists yet.

**How to avoid:** For v1.1, prioritize level-up toast over achievement toast (level-up is rarer, more important). In Tracker.tsx, conditionally render only LevelUpToast if levelUpEvent exists, otherwise render AchievementToast. Alternative: delay level-up toast by 5 seconds (achievement toast duration).

**Warning signs:** User reports missing notifications, overlapping text in screenshots, GitHub issues about "toast spam".

### Pitfall 5: Max Rank Edge Case (Doom Slayer)

**What goes wrong:** XP bar shows "100,000 / 0 XP" or crashes when user reaches max rank (nextRank is null).

**Why it happens:** Division by zero in percentage calculation, or missing null checks on nextRank.

**How to avoid:** Always check `nextRank !== null` before accessing properties. When null, display special "max rank" state:
```typescript
const nextRankXP = nextRank?.xpThreshold || totalXP; // Fallback to current XP
const displayXP = nextRank ? nextRankXP.toLocaleString() : '∞';
const fillPercent = nextRank ? calculatePercentage() : 100;
```

**Warning signs:** Console error "Cannot read property 'xpThreshold' of null", broken UI for long-term users.

## Code Examples

Verified patterns from project codebase:

### DOOM Panel with Progress Bar (Existing Pattern)

```typescript
// Source: Tracker.tsx lines 110-135
<div className="doom-panel p-3">
  <div className="flex justify-between items-center mb-2">
    <span className="text-gray-500 text-[8px]">LABEL TEXT</span>
    <span className="text-doom-green text-[10px] font-bold">VALUE</span>
  </div>
  <div className="progress-bar h-3 rounded overflow-hidden">
    <div
      className="progress-fill h-full transition-all duration-300"
      style={{ width: `${percent}%` }}
    />
  </div>
</div>
```

### Toast Component Pattern (Existing)

```typescript
// Source: AchievementToast.tsx lines 10-68
export default function MyToast({ data, onDismiss }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      setShowConfetti(true);
    }, 100);

    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(data.id), 300);
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [data.id, onDismiss]);

  return (
    <>
      <Confetti trigger={showConfetti} />
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 doom-panel p-4 border-2 border-doom-gold transition-all duration-300 ${
          isVisible && !isLeaving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {/* Toast content */}
      </div>
    </>
  );
}
```

### useXP Hook Integration (Phase 5 Complete)

```typescript
// Source: useXP.ts lines 27-249
const {
  totalXP,           // Number
  currentRank,       // Rank object
  nextRank,          // Rank | null
  xpToNextRank,      // Number (0 if max rank)
  levelUpEvent,      // LevelUpEvent | null
  dismissLevelUp,    // () => void
} = useXP(weeks, currentStreak, unlockedAchievementCount, weeksLoading);

// Level-up event structure:
interface LevelUpEvent {
  previousRank: Rank;
  newRank: Rank;
  totalXP: number;
  timestamp: Date;
}
```

### Rank Color Tiers (Phase 4 Complete)

```typescript
// Source: ranks.ts lines 7-113
// Ranks 1-2: Gray tier (text-gray-400, text-gray-300)
// Ranks 3-4: Green tier (text-green-400, text-green-300)
// Ranks 5-6: Blue tier (text-blue-400, text-blue-300)
// Ranks 7-8: Purple tier (text-purple-400, text-purple-300)
// Ranks 9-10: Yellow tier (text-yellow-400, text-yellow-300)
// Ranks 11-12: Orange tier (text-orange-400, text-orange-300)
// Ranks 13-14: Red tier (text-red-400, text-red-300)
// Rank 15: Gold tier (text-doom-gold) + special glow

const currentRank = RANKS.find(r => r.id === 15); // Doom Slayer
console.log(currentRank.color); // 'text-doom-gold'
```

### XP Breakdown Calculation (Phase 4 Complete)

```typescript
// Source: xpFormulas.ts lines 110-135
import { getWeeklyXPBreakdown } from '../lib/xpFormulas';

const breakdown = getWeeklyXPBreakdown(
  workoutCount,    // 4
  streakWeeks,     // 12
  weekStatus       // 'normal'
);

console.log(breakdown);
// {
//   baseXP: 50,
//   streakMultiplier: 1.75,
//   totalXP: 88,
//   achievementBonus: undefined // Set in Phase 5
// }
```

### CSS Animation Transition Pattern

```css
/* Source: index.css line 157 */
.progress-fill {
  background: linear-gradient(90deg,
    #22c55e 0%,
    #22c55e 60%,
    #d4af37 60%,
    #d4af37 80%,
    #b91c1c 80%,
    #b91c1c 100%
  );
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

/* For XP bar, use DOOM red gradient instead: */
.xp-fill {
  background: linear-gradient(90deg, #7a1a1a 0%, #b91c1c 100%);
  transition: width 0.5s ease-out;
  box-shadow: 0 0 10px rgba(185, 28, 28, 0.5);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Center modals for all interactions | Bottom sheets for mobile-first UX | Industry shift 2020-2023 | Better thumb ergonomics, less intrusive, follows iOS/Android native patterns |
| External animation libraries (Framer Motion, React Spring) | CSS transitions + keyframes | Project decision (Phase 4) | Zero dependencies, simpler bundle, better performance for simple animations |
| Manual toast queuing systems | Single toast at a time | Project standard (v1.0-1.6) | Simpler implementation, avoid notification spam, prioritize important events |
| Separate progress bar libraries | Native CSS gradients + transitions | Modern CSS capability | Pixel-perfect control, DOOM aesthetic customization, no library overhead |

**Deprecated/outdated:**
- `react-spring`: Popular in 2020-2022, but project uses CSS-only animations (CLAUDE.md decision)
- Center-only modals: Mobile web best practice shifted to bottom sheets (Material Design 3, iOS HIG updates)
- Toast libraries (react-toastify, react-hot-toast): Project has custom toast system matching DOOM theme

## Open Questions

1. **Rank name abbreviation strategy**
   - What we know: User left to Claude's discretion, should balance readability vs space
   - What's unclear: Which ranks need abbreviation? "Corporal" → "CPL", "Sergeant" → "SGT", "Lieutenant" → "LT"?
   - Recommendation: Test on mobile viewport (375px width). If full name fits comfortably (6-8 characters), use full. Otherwise abbreviate military ranks (Private → PVT, Corporal → CPL, etc.) but keep fantasy ranks full (Knight, Sentinel, Hellwalker).

2. **Confetti intensity for level-up**
   - What we know: Existing Confetti.tsx generates 30 pieces. Achievement unlocks use this.
   - What's unclear: Should level-up confetti be MORE intense (bigger accomplishment) or same intensity?
   - Recommendation: Use same intensity (30 pieces) for consistency. Level-up already gets toast + gold border highlighting. More confetti risks feeling spammy.

3. **Two-step fill animation pause duration**
   - What we know: User wants fill to 100% → pause → reset to new level percentage
   - What's unclear: How long should the pause be? Too short feels jarring, too long delays feedback.
   - Recommendation: 800ms pause matches achievement XP grant delay (Phase 5 decision). Gives user moment to register "100% filled" before dramatic reset. Total sequence: 500ms fill + 800ms pause + 500ms reset = 1.8s total.

4. **Very low fill percentage text visibility**
   - What we know: Claude's discretion on handling when bar is nearly empty (0-5% fill)
   - What's unclear: Text color inversion, minimum fill width, or stronger drop shadow?
   - Recommendation: Combine strategies: (1) Strong drop shadow `drop-shadow-[0_2px_4px_rgba(0,0,0,1)]`, (2) Minimum 8% fill width (visual indicator even at 0 XP). Avoid color inversion (more complex, inconsistent UX).

## Validation Architecture

> Skipped — workflow.nyquist_validation is not configured in .planning/config.json

## Sources

### Primary (HIGH confidence)

- **Project CLAUDE.md** - React component patterns, TypeScript conventions, DOOM styling guide
- **Existing components** - AchievementToast.tsx, Confetti.tsx, Modal.tsx, Toast.tsx, Tracker.tsx (lines 110-135)
- **Phase 4 outputs** - ranks.ts (Rank definitions), xpFormulas.ts (XP calculation logic)
- **Phase 5 outputs** - useXP.ts (XP state management hook, levelUpEvent emission)
- **index.css** - Progress bar classes, animation keyframes, DOOM panel styling
- **types/index.ts** - Rank, LevelUpEvent, WeeklyXPBreakdown interfaces

### Secondary (MEDIUM confidence)

- **Material Design 3 guidelines** - Bottom sheet UX patterns (mobile-first modal alternative)
- **iOS Human Interface Guidelines** - Sheet presentation patterns (thumb-friendly positioning)

### Tertiary (LOW confidence)

None — all findings verified against project codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Zero new dependencies, all patterns exist in codebase
- Architecture: HIGH - Direct reference to existing toast/modal/progress patterns
- Pitfalls: HIGH - Derived from React best practices + project's existing component patterns

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (30 days — stable domain, no fast-moving dependencies)
