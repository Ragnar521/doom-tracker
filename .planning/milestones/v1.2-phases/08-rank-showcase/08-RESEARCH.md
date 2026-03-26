# Phase 8: Rank Showcase - Research

**Researched:** 2026-03-26
**Domain:** React UI component design, CSS animations, responsive layout
**Confidence:** HIGH

## Summary

Phase 8 implements a rank showcase component on the Achievements page, displaying all 15 DOOM military ranks with clear visual distinction between earned, current, and locked states. The implementation reuses existing v1.1 XP infrastructure (useXP hook, RANKS array, CSS animations) with zero new dependencies.

**Primary technical focus:** React component composition, CSS state styling (earned/current/locked), responsive layout, and guest user authentication checks.

**Primary recommendation:** Build RankShowcase as a self-contained presentational component that receives XP data via props from Achievements.tsx, reuse .achievement-card CSS pattern with rank-specific color theming, and apply .god-mode-glow for current rank emphasis.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Card layout & density:**
- Card style per rank (small card, not compact row or grid)
- Each card shows: rank number (#1-#15), rank name, tagline, and XP threshold
- XP threshold displayed as raw number (no comma formatting) — e.g., "5000 XP" not "5,000 XP"
- Earned ranks display name in their theme color (text-green-400, text-blue-400, etc. from RANKS array)
- Locked/unearned ranks display name in gray
- Reuse .achievement-card styling pattern for card backgrounds

**Current rank emphasis:**
- Gold border + subtle pulsing glow effect (reuse existing .god-mode-glow CSS animation)
- Progress indicator appears inside the current rank card as a third line: "+XXX XP to [NEXT RANK]"
- Max rank (Doom Slayer) shows "MAX RANK ACHIEVED" instead of progress

**Scroll & section placement:**
- Rank showcase is always visible above achievements section (not collapsible)
- Ascending order: #1 Private at top, #15 Doom Slayer at bottom
- No auto-scroll to current rank (user scrolls manually)
- Section has its own doom-panel header (like the ACHIEVEMENTS header) with title and subtitle

**Guest user handling:**
- Guest users (not signed in) see no rank showcase — XP is authenticated-only (per existing v1.1 decision)
- Requirement RANK-07 specifies "SIGN IN TO UNLOCK RANK PROGRESSION" message

### Claude's Discretion

- Header panel title and subtitle text (e.g., "RANK PROGRESSION" / "CLIMB THE LADDER")
- Exact spacing, padding, and typography sizing within cards
- Whether all 15 rank cards are in one doom-panel or each is its own panel
- Earned vs locked card opacity/grayscale values (can reference .achievement-card.locked pattern: opacity 0.5, grayscale 0.8)
- Guest user message styling and placement

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RANK-01 | User can see all 15 DOOM military ranks listed on the Achievements page | RANKS array in src/lib/ranks.ts provides complete data (id, name, tagline, xpThreshold, color) for all 15 ranks |
| RANK-02 | Each rank shows its name, tagline, and XP threshold | RANKS array structure already contains all required fields; component maps over array and displays properties |
| RANK-03 | User's current rank is highlighted with gold border and glow effect | useXP hook provides currentRank; .god-mode-glow CSS class (pulse-gold keyframe, 1.5s infinite) can be applied to current rank card |
| RANK-04 | Earned ranks appear at full opacity, unearned ranks are dimmed and grayed out | .achievement-card.locked pattern (opacity 0.5, grayscale 0.8) is existing pattern; compare rank.id <= currentRank.id to determine earned state |
| RANK-05 | Rank list appears above the achievements section | Achievements.tsx structure is linear; insert RankShowcase component before CATEGORY_ORDER.map() loop (line 115) |
| RANK-06 | User can see progress to next rank ("+XXX XP to [Next Rank]") | useXP hook provides xpToNextRank and nextRank; conditional rendering shows progress text or "MAX RANK ACHIEVED" for Doom Slayer |
| RANK-07 | Guest users see no rank showcase (XP is authenticated-only) | useAuth hook provides user state; conditional rendering shows message instead of RankShowcase when !user |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2 | Component rendering | Already used throughout project (Tracker.tsx, Achievements.tsx) |
| TypeScript | ~5.9 | Type safety | All components typed; Rank interface already defined in src/types |
| Tailwind CSS | 3.4 | Utility styling | All existing components use Tailwind (achievement cards, doom panels) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None needed | - | - | All required capabilities exist in current stack |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Props drilling | React Context for XP | Over-engineering for single-page feature; props are simpler and more explicit |
| New CSS classes | Inline Tailwind | Existing .achievement-card and .god-mode-glow already provide needed patterns |

**Installation:**
```bash
# No new dependencies required
# All capabilities exist in current stack
```

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   └── RankShowcase.tsx      # New component for rank display
└── pages/
    └── Achievements.tsx       # Modified to integrate RankShowcase
```

### Pattern 1: Presentational Component with Props
**What:** RankShowcase receives all data via props (currentRank, totalXP, xpToNextRank, nextRank) instead of calling useXP directly.

**When to use:** When component needs to be testable in isolation and parent already has the data.

**Example:**
```typescript
// Source: Existing pattern from Achievement card components
interface RankShowcaseProps {
  currentRank: Rank;
  totalXP: number;
  xpToNextRank: number;
  nextRank: Rank | null;
}

export default function RankShowcase({ currentRank, totalXP, xpToNextRank, nextRank }: RankShowcaseProps) {
  return (
    <div className="doom-panel p-3">
      <h2 className="text-doom-gold text-lg font-bold">RANK PROGRESSION</h2>
      <p className="text-gray-500 text-[8px]">CLIMB THE LADDER</p>

      <div className="space-y-2 mt-3">
        {RANKS.map((rank) => {
          const isEarned = rank.id <= currentRank.id;
          const isCurrent = rank.id === currentRank.id;

          return (
            <div
              key={rank.id}
              className={`achievement-card p-3 rounded ${
                isCurrent ? 'god-mode-glow border-doom-gold' :
                !isEarned ? 'locked' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-[10px] font-bold ${isEarned ? rank.color : 'text-gray-600'}`}>
                    #{rank.id} {rank.name}
                  </p>
                  <p className="text-[8px] text-gray-400">{rank.tagline}</p>
                  {isCurrent && nextRank && (
                    <p className="text-[7px] text-doom-gold mt-1">
                      +{xpToNextRank} XP to {nextRank.name}
                    </p>
                  )}
                  {isCurrent && !nextRank && (
                    <p className="text-[7px] text-doom-gold mt-1">MAX RANK ACHIEVED</p>
                  )}
                </div>
                <p className="text-[9px] text-gray-500">{rank.xpThreshold} XP</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Pattern 2: Conditional Guest User Rendering
**What:** Check authentication state before rendering feature-specific components.

**When to use:** When feature is authenticated-only (XP system requires sign-in).

**Example:**
```typescript
// Source: Existing pattern from src/pages/Tracker.tsx (XPBar conditional rendering)
export default function Achievements() {
  const { user } = useAuth();
  const { achievements, unlockedCount, loading } = useAchievements();

  // XP data (only if authenticated)
  const { weeks, stats: allWeeksStats, loading: allWeeksLoading } = useAllWeeks();
  const { unlockedCount: achCount } = useAchievementContext();
  const {
    totalXP,
    currentRank,
    nextRank,
    xpToNextRank,
    loading: xpLoading,
  } = useXP(weeks, allWeeksStats.currentStreak, achCount, allWeeksLoading);

  if (loading || (user && (allWeeksLoading || xpLoading))) {
    return <LoadingSpinner size="lg" text="LOADING GLORY..." />;
  }

  return (
    <div className="space-y-3">
      {/* Rank Showcase - Authenticated Only */}
      {user ? (
        <RankShowcase
          currentRank={currentRank}
          totalXP={totalXP}
          xpToNextRank={xpToNextRank}
          nextRank={nextRank}
        />
      ) : (
        <div className="doom-panel p-4 text-center">
          <p className="text-gray-400 text-sm">SIGN IN TO UNLOCK RANK PROGRESSION</p>
        </div>
      )}

      {/* Header */}
      <div className="doom-panel p-3 text-center">
        <h2 className="text-doom-gold text-lg font-bold">ACHIEVEMENTS</h2>
        {/* ... rest of achievements header ... */}
      </div>

      {/* Achievement Categories */}
      {/* ... existing achievement rendering ... */}
    </div>
  );
}
```

### Pattern 3: Reuse Existing CSS Classes
**What:** Apply existing CSS classes (.achievement-card, .god-mode-glow, .locked) to new components for visual consistency.

**When to use:** When new feature should match existing DOOM aesthetic (panels, animations, state styling).

**Example:**
```css
/* Source: src/index.css lines 257-271 */

/* Existing classes to reuse (no modifications needed): */
.achievement-card {
  background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #3a3a3a;
  transition: all 0.2s ease;
}

.achievement-card.unlocked {
  border-color: #d4af37;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
}

.achievement-card.locked {
  opacity: 0.5;
  filter: grayscale(0.8);
}

.god-mode-glow {
  animation: pulse-gold 1.5s ease-in-out infinite;
}

@keyframes pulse-gold {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6),
                0 0 40px rgba(255, 215, 0, 0.4),
                0 0 60px rgba(255, 215, 0, 0.2),
                inset 0 0 0 2px #3a2a1a;
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8),
                0 0 60px rgba(255, 215, 0, 0.6),
                0 0 90px rgba(255, 215, 0, 0.4),
                inset 0 0 0 2px #5a4a2a;
  }
}
```

### Anti-Patterns to Avoid
- **Calling useXP multiple times:** Use shared XP state from parent; useXP uses useMemo and writes to Firestore, multiple calls create redundant calculations and writes
- **Creating new CSS animations:** Reuse .god-mode-glow (1.5s pulse-gold); new keyframes bloat CSS and violate DOOM aesthetic consistency
- **Fetching RANKS data:** RANKS is a static array exported from src/lib/ranks.ts; no async fetching needed, just import and map
- **Auto-scrolling on desktop:** Mobile-only consideration (requirement RANK-08 is out of scope for v1.2); desktop has enough viewport height to show all ranks

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rank color theming | Custom color logic per rank tier | RANKS array `color` field (text-green-400, text-blue-400, etc.) | Already defined in src/lib/ranks.ts lines 12-112; consistent with existing design |
| XP state management | Local useState for totalXP/currentRank | useXP hook from src/hooks/useXP.ts | Existing hook handles Firestore persistence, retroactive calculation, level-up events; tested and deployed since v1.1 |
| Earned vs locked state | Manual XP threshold comparison | Compare rank.id <= currentRank.id | Simple ID comparison is safer than XP math (handles edge cases, future-proof if thresholds change) |
| Authentication check | Custom Firebase auth check | useAuth hook from AuthContext | Existing context provides user state, handles sign-in/sign-out events, used across entire app |
| Card styling | New CSS classes for rank cards | .achievement-card with state modifiers (.locked, .unlocked, .god-mode-glow) | Visual consistency with achievements section; users already understand these patterns |

**Key insight:** v1.1 XP system provides complete infrastructure for rank display. The only new code needed is UI rendering (mapping RANKS array to card components). All data, styling, and state management already exist.

## Common Pitfalls

### Pitfall 1: useXP Dependency Chain Causing Infinite Loops
**What goes wrong:** Calling useXP with non-primitive dependencies (like passing the entire `weeks` array without memoization) can cause infinite re-renders.

**Why it happens:** useXP uses useMemo internally (line 44-55 in useXP.ts) with dependencies `[user, weeks, weeksLoading, currentStreak, unlockedAchievementCount]`. If parent component creates new `weeks` array reference on every render, useMemo recalculates every time.

**How to avoid:**
- Use weeks from useAllWeeks hook (already memoized)
- Don't destructure/transform weeks array before passing to useXP
- Let useXP handle all XP calculations internally

**Warning signs:**
- Console warning: "Maximum update depth exceeded"
- Page freezes/becomes unresponsive
- Firestore quota exhausted (excessive writes)

### Pitfall 2: Locked Rank Cards Showing Wrong Opacity
**What goes wrong:** Locked ranks appear too dark (opacity too low) or not grayed out (grayscale filter missing).

**Why it happens:** Applying only `opacity: 0.5` without `filter: grayscale(0.8)` makes cards transparent but colorful; applying only grayscale without opacity makes them gray but too prominent.

**How to avoid:**
- Use existing `.achievement-card.locked` class (combines both: opacity 0.5 + grayscale 0.8)
- Apply class conditionally: `className={!isEarned ? 'locked' : ''}`
- Test with colorblind mode to verify locked state is clearly distinguishable

**Warning signs:**
- Locked ranks blend with earned ranks (not visually distinct)
- Users report confusion about which ranks are unlocked
- Color-only distinction (fails accessibility)

### Pitfall 3: Current Rank Glow Interfering with Scrolling Performance
**What goes wrong:** Pulsing animation on current rank card causes frame rate drops during scrolling, especially on mobile.

**Why it happens:** `.god-mode-glow` uses box-shadow animation (GPU-intensive); when scrolling container, browser repaints on every frame.

**How to avoid:**
- Use CSS `will-change: box-shadow` on `.god-mode-glow` to hint GPU optimization
- Ensure only ONE element has `.god-mode-glow` (not all earned ranks)
- Test on low-end mobile devices (iPhone SE, budget Android)

**Warning signs:**
- Scrolling feels janky (below 60fps)
- DevTools performance profile shows "Paint" warnings
- Mobile users report lag when viewing ranks

### Pitfall 4: Guest User Message Appearing After Authenticated Content
**What goes wrong:** Authenticated users briefly see "SIGN IN TO UNLOCK" message before XP data loads (flash of incorrect content).

**Why it happens:** useXP hook has loading state; if you check `!user` but not `xpLoading`, there's a race condition between auth state and XP data.

**How to avoid:**
- Check both `!user` AND ensure XP data is loaded before rendering RankShowcase
- Show LoadingSpinner while `user && xpLoading` is true
- Only show guest message when `!user && !loading`

**Warning signs:**
- Flickering UI on page load
- Console errors about undefined currentRank
- User reports seeing "sign in" message after they're already signed in

### Pitfall 5: Rank Color Classes Not Applying (Tailwind Purging)
**What goes wrong:** Rank name colors (text-green-400, text-blue-400, etc.) don't appear, showing default text color instead.

**Why it happens:** Tailwind purges unused classes at build time; if color class is only referenced in RANKS array (not in template), it gets removed.

**How to avoid:**
- Use Tailwind safelist in tailwind.config.js to preserve rank color classes
- OR: Apply classes via `className={rank.color}` (dynamic class names are preserved if they match existing patterns)
- Verify all 15 rank colors appear correctly in production build

**Warning signs:**
- Colors work in dev (npm run dev) but not in production (npm run build)
- All rank names show same color (white or gray)
- Browser DevTools shows no color class in computed styles

## Code Examples

Verified patterns from existing codebase:

### Integration Point: Achievements.tsx
```typescript
// Source: src/pages/Achievements.tsx (modified for rank showcase integration)
import { useAchievements } from '../hooks/useAchievements';
import { useAuth } from '../contexts/AuthContext';
import { useXP } from '../hooks/useXP';
import { useAllWeeks } from '../hooks/useAllWeeks';
import { useAchievementContext } from '../contexts/AchievementContext';
import RankShowcase from '../components/RankShowcase';
import LoadingSpinner from '../components/LoadingSpinner';
import type { AchievementCategory } from '../lib/achievements';

export default function Achievements() {
  const { user } = useAuth();
  const { achievements, unlockedCount, loading } = useAchievements();

  // XP data (only if authenticated)
  const { weeks, stats: allWeeksStats, loading: allWeeksLoading } = useAllWeeks();
  const { unlockedCount: achCount } = useAchievementContext();
  const {
    currentRank,
    totalXP,
    xpToNextRank,
    nextRank,
    loading: xpLoading,
  } = useXP(weeks, allWeeksStats.currentStreak, achCount, allWeeksLoading);

  if (loading || (user && (allWeeksLoading || xpLoading))) {
    return <LoadingSpinner size="lg" text="LOADING GLORY..." />;
  }

  return (
    <div className="space-y-3">
      {/* Rank Showcase - Authenticated Only */}
      {user ? (
        <RankShowcase
          currentRank={currentRank}
          totalXP={totalXP}
          xpToNextRank={xpToNextRank}
          nextRank={nextRank}
        />
      ) : (
        <div className="doom-panel p-4 text-center">
          <p className="text-gray-400 text-sm">SIGN IN TO UNLOCK RANK PROGRESSION</p>
        </div>
      )}

      {/* Header (existing) */}
      <div className="doom-panel p-3 text-center">
        <h2 className="text-doom-gold text-lg font-bold">ACHIEVEMENTS</h2>
        <p className="text-gray-500 text-[8px]">GLORY AWAITS</p>
        {/* ... rest unchanged ... */}
      </div>

      {/* Achievement Categories (existing) */}
      {/* ... unchanged ... */}
    </div>
  );
}
```

### RankShowcase Component
```typescript
// Source: New component following Achievements.tsx patterns
import { RANKS } from '../lib/ranks';
import type { Rank } from '../types';

interface RankShowcaseProps {
  currentRank: Rank;
  totalXP: number;
  xpToNextRank: number;
  nextRank: Rank | null;
}

export default function RankShowcase({ currentRank, totalXP, xpToNextRank, nextRank }: RankShowcaseProps) {
  return (
    <div className="doom-panel p-3">
      {/* Header */}
      <div className="text-center mb-3">
        <h2 className="text-doom-gold text-lg font-bold">RANK PROGRESSION</h2>
        <p className="text-gray-500 text-[8px]">CLIMB THE LADDER</p>
      </div>

      {/* Rank Cards */}
      <div className="space-y-2">
        {RANKS.map((rank) => {
          const isEarned = rank.id <= currentRank.id;
          const isCurrent = rank.id === currentRank.id;

          return (
            <div
              key={rank.id}
              className={`achievement-card p-3 rounded ${
                isCurrent ? 'god-mode-glow border-doom-gold' :
                !isEarned ? 'locked' : ''
              }`}
              style={isCurrent ? { willChange: 'box-shadow' } : undefined}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className={`text-[10px] font-bold ${isEarned ? rank.color : 'text-gray-600'}`}>
                    #{rank.id} {rank.name}
                  </p>
                  <p className="text-[8px] text-gray-400 mt-0.5">{rank.tagline}</p>

                  {/* Progress indicator (current rank only) */}
                  {isCurrent && nextRank && (
                    <p className="text-[7px] text-doom-gold mt-1">
                      +{xpToNextRank} XP to {nextRank.name}
                    </p>
                  )}
                  {isCurrent && !nextRank && (
                    <p className="text-[7px] text-doom-gold mt-1">MAX RANK ACHIEVED</p>
                  )}
                </div>

                {/* XP Threshold */}
                <p className="text-[9px] text-gray-500">{rank.xpThreshold} XP</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Type Definitions (Already Exist)
```typescript
// Source: src/types/index.ts (no changes needed)
export interface Rank {
  id: number;
  name: string;
  xpThreshold: number;
  color: string;
  tagline: string;
}
```

### RANKS Data (Already Exists)
```typescript
// Source: src/lib/ranks.ts (no changes needed)
export const RANKS: Rank[] = [
  { id: 1, name: 'Private', xpThreshold: 0, color: 'text-gray-400', tagline: 'Fresh meat' },
  { id: 2, name: 'Corporal', xpThreshold: 100, color: 'text-gray-300', tagline: 'Learning the ropes' },
  { id: 3, name: 'Sergeant', xpThreshold: 300, color: 'text-green-400', tagline: 'Getting stronger' },
  { id: 4, name: 'Lieutenant', xpThreshold: 650, color: 'text-green-300', tagline: 'Leading by example' },
  { id: 5, name: 'Captain', xpThreshold: 1200, color: 'text-blue-400', tagline: 'Combat veteran' },
  { id: 6, name: 'Major', xpThreshold: 2000, color: 'text-blue-300', tagline: 'Proven warrior' },
  { id: 7, name: 'Colonel', xpThreshold: 3200, color: 'text-purple-400', tagline: 'Elite marine' },
  { id: 8, name: 'Commander', xpThreshold: 5000, color: 'text-purple-300', tagline: 'Squad leader' },
  { id: 9, name: 'Knight', xpThreshold: 7500, color: 'text-yellow-400', tagline: 'Night Sentinel initiate' },
  { id: 10, name: 'Sentinel', xpThreshold: 11000, color: 'text-yellow-300', tagline: 'Argent warrior' },
  { id: 11, name: 'Paladin', xpThreshold: 16000, color: 'text-orange-400', tagline: 'Holy crusader' },
  { id: 12, name: 'Warlord', xpThreshold: 23000, color: 'text-orange-300', tagline: 'Demon hunter' },
  { id: 13, name: 'Hellwalker', xpThreshold: 33000, color: 'text-red-400', tagline: 'Unchained predator' },
  { id: 14, name: 'Slayer', xpThreshold: 50000, color: 'text-red-300', tagline: 'The only thing they fear' },
  { id: 15, name: 'Doom Slayer', xpThreshold: 100000, color: 'text-doom-gold', tagline: 'Rip and tear, until it is done' },
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No rank visualization | Rank showcase on Achievements page | v1.2 (this phase) | Users can now see full progression ladder and understand XP goals |
| Text-only rank display (Tracker page) | Visual cards with theme colors + animations | v1.2 (this phase) | DOOM aesthetic reinforced, rank progression more engaging |
| Hidden progression ladder | All 15 ranks visible (earned + locked) | v1.2 (this phase) | Transparency about long-term goals improves motivation |

**Deprecated/outdated:**
- None — this is a new feature, no existing rank visualization to deprecate

## Open Questions

1. **Should locked rank cards show actual rank number or placeholder?**
   - What we know: CONTEXT.md specifies "rank number (#1-#15)" for all cards
   - What's unclear: Whether showing future rank numbers spoils progression surprise
   - Recommendation: Show all rank numbers (transparency > surprise, users want to know what's ahead)

2. **Should we add Tailwind safelist for rank color classes?**
   - What we know: Dynamic color classes (text-green-400, etc.) might be purged at build time
   - What's unclear: Whether Tailwind's JIT mode preserves dynamically applied classes from RANKS array
   - Recommendation: Test production build; add safelist if colors missing (safelist pattern: `/^text-(gray|green|blue|purple|yellow|orange|red)-(300|400)$/`)

3. **Should guest user message be a full doom-panel or just inline text?**
   - What we know: CONTEXT.md says "SIGN IN TO UNLOCK RANK PROGRESSION" message required
   - What's unclear: Visual prominence vs clutter tradeoff
   - Recommendation: Use full doom-panel (matches existing authenticated content weight, clearer call-to-action)

## Validation Architecture

> Nyquist validation is enabled in .planning/config.json workflow.nyquist_validation (not explicitly disabled).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58+ |
| Config file | playwright.config.ts |
| Quick run command | `npm run test:e2e` |
| Full suite command | `npm run test:e2e` (same — small test suite) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RANK-01 | User sees all 15 ranks listed on Achievements page | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts::test-all-ranks-visible -x` | ❌ Wave 0 |
| RANK-02 | Each rank shows name, tagline, XP threshold | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts::test-rank-details -x` | ❌ Wave 0 |
| RANK-03 | Current rank has gold border + glow effect | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts::test-current-rank-highlight -x` | ❌ Wave 0 |
| RANK-04 | Earned ranks full opacity, unearned dimmed/gray | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts::test-rank-states -x` | ❌ Wave 0 |
| RANK-05 | Rank list appears above achievements section | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts::test-rank-placement -x` | ❌ Wave 0 |
| RANK-06 | Progress shows "+XXX XP to [Next Rank]" or "MAX RANK ACHIEVED" | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts::test-rank-progress -x` | ❌ Wave 0 |
| RANK-07 | Guest users see "SIGN IN" message instead of ranks | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts::test-guest-user-message -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test:e2e` (full suite — small test base)
- **Per wave merge:** `npm run test:e2e` (same)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/e2e/rank-showcase.spec.ts` — covers RANK-01 through RANK-07 (7 test scenarios × 5 browsers = 35 tests)
- [ ] `tests/utils/setup.ts` — add helper functions:
  - `getRankCards(page)` — locator for all rank card elements
  - `getCurrentRankCard(page)` — locator for card with .god-mode-glow class
  - `getGuestMessage(page)` — locator for "SIGN IN TO UNLOCK" message
  - `getRankCardDetails(page, rankId)` — extract name, tagline, XP from specific rank card
- [ ] Firebase emulators required: Auth emulator for authenticated user testing (rank showcase requires sign-in)

## Sources

### Primary (HIGH confidence)
- RANKS array: src/lib/ranks.ts (lines 7-113) — all 15 rank definitions with exact colors and thresholds
- useXP hook: src/hooks/useXP.ts (lines 27-307) — XP state management, currentRank/nextRank/xpToNextRank calculation
- CSS animations: src/index.css (lines 75-90, 257-271) — .god-mode-glow and .achievement-card patterns
- Achievements page: src/pages/Achievements.tsx (lines 86-154) — integration point and existing UI patterns
- CONTEXT.md: .planning/phases/08-rank-showcase/08-CONTEXT.md — user decisions and constraints
- REQUIREMENTS.md: .planning/REQUIREMENTS.md (lines 10-19) — phase requirements RANK-01 through RANK-07

### Secondary (MEDIUM confidence)
- React 19.2 component patterns: Existing codebase conventions (Tracker.tsx, Squad.tsx)
- Tailwind CSS purge behavior: Official Tailwind docs (safelist for dynamic classes)
- Playwright testing patterns: tests/e2e/auth.spec.ts (existing test structure reference)

### Tertiary (LOW confidence)
- None — all findings verified with existing codebase or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All capabilities exist in current dependencies (React 19.2, Tailwind 3.4, TypeScript 5.9)
- Architecture: HIGH - Patterns verified from existing components (Achievement cards, XP integration in Tracker.tsx)
- Pitfalls: HIGH - Documented from existing XP system edge cases (useXP dependency chain, CSS animation performance)

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (30 days — stable stack, unlikely to change)
