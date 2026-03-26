# Feature Landscape: Rank Showcase

**Domain:** Rank/Level Showcase Display in Gamification Apps
**Researched:** 2026-03-26
**Context:** Adding rank showcase display to Achievements page for existing XP system (v1.1)

---

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes | Dependencies |
|---------|--------------|------------|-------|--------------|
| **All ranks visible in vertical list** | Standard in competitive games (VALORANT, Overwatch, Mobile Legends) - users expect to see the full progression ladder | Low | Data already exists in RANKS array (15 ranks) | None (RANKS array exists) |
| **XP threshold displayed per rank** | Core gamification pattern - users need to know what they're working toward (GamiPress, Level Up XP, brainCloud all show thresholds) | Low | Already defined in RANKS array as xpThreshold | None (data exists) |
| **Current rank highlighted/emphasized** | Universal pattern across all ranking systems - users must quickly identify "you are here" | Medium | Needs visual treatment (glow, border, different background) | useXP hook for current rank data |
| **Earned ranks fully visible** | Badge systems show completed achievements fully visible (BadgeOS, Steam) | Low | Ranks where totalXP >= xpThreshold | useXP hook for totalXP |
| **Unearned ranks dimmed/grayed** | Standard locked state pattern - reduces opacity or saturation to show "not yet achieved" (BadgeOS uses reduced opacity for unearned badges) | Low | CSS opacity/grayscale for locked ranks | None (CSS only) |
| **Rank name + tagline** | Already exists in RANKS array - users expect to see both title and flavor text | Low | Both fields already defined in data | None (data exists) |
| **Placement above achievements** | Users expect rank/level systems to be prominent - should be first thing they see on glory/achievements page | Low | Component ordering in Achievements.tsx | None (layout change) |

---

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes | Dependencies |
|---------|-------------------|------------|-------|--------------|
| **Color-coded rank tiers with progression theme** | DOOM aesthetic + visual hierarchy - gray (starting ranks) → green (learning) → blue (veteran) → purple (elite) → yellow (sentinel) → orange (crusader) → red (slayer) → gold (max rank) | Low | Colors already defined in RANKS array, matches DOOM lore progression (UAC marines → Night Sentinels → Argent warriors) | None (data exists in RANKS array) |
| **Rank abbreviations (PVT, CPL, SGT, etc.)** | Space-saving for compact displays, military authenticity | Low | Already implemented in abbreviateRank() function | None (function exists) |
| **"Progress to next rank" indicator** | Shows XP needed to advance from current rank - motivates grinding | Medium | Calculate next rank threshold minus current XP, display as "+XXX XP to [Next Rank]" | getXPToNextRank() function exists |
| **Golden glow effect on max rank (Doom Slayer)** | Special treatment for ultimate achievement - already used for god mode face, reinforces prestige | Low | CSS glow animation (similar to .god-mode-glow class) | None (CSS pattern exists) |
| **Scrollable rank ladder with "scroll to current rank"** | For mobile optimization - immediately jump to user's position in long list | Medium | Auto-scroll on mount to current rank, smooth scroll behavior | None (JS scrollIntoView) |
| **Rank number display (1-15)** | Shows position in hierarchy - "10. SENTINEL" makes progression tangible | Low | Iterate with index, display rank.id | None (data exists) |
| **Compact mobile-optimized cards** | 3-line cards (name, tagline, XP) fit 5-6 ranks on screen without scrolling | Low | Responsive design, small text (10-12px name, 8px details) | None (CSS only) |

---

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Rank icons/badges for each tier** | Would require 15 new icon assets (not in doom-assets/ folder), significant design work, project uses text-based ranks everywhere else (Tracker XP bar, Squad leaderboard) | Use color-coded text with taglines - already established pattern, consistent with existing UI |
| **Interactive rank cards (click to expand details)** | Over-engineering a simple display - users just want to see the ladder, not dig into each rank's backstory | Static list with all info visible at once - faster scanning, simpler implementation |
| **Individual rank animations on scroll** | Performance cost, visual noise, distracts from current rank highlight | Single animation on current rank (glow effect) - focuses attention where it matters |
| **"Days until next rank" prediction** | Requires complex calculation based on recent XP rate, misleading if user changes workout frequency | Show XP needed in absolute terms - clearer, no false promises |
| **Rank unlock dates/timestamps** | Firestore doesn't store historical rank changes, would need new collection + migration, adds complexity for minimal value | Show only current rank - focus on present status, not historical audit trail |
| **Collapsible rank sections (earned vs unearned)** | Hides information user came to see, extra clicks, breaks "see full ladder" expectation | Always show all 15 ranks in one scrollable list - simple, complete view |
| **Rank comparison with friends** | Feature creep - Squad page already shows friend ranks in leaderboard, would duplicate existing functionality | Link to Squad page if user wants to compare ranks - avoid redundancy |
| **XP progress bars per rank** | Clutters UI, adds visual noise - current rank progress already shown on Tracker page XP bar | Show XP threshold as static text (e.g., "11,000 XP") - cleaner, simpler |

---

## Feature Dependencies

```
Rank Showcase Component
  ├─ RANKS array (lib/ranks.ts) ✓ EXISTS
  ├─ getRankForXP(totalXP) ✓ EXISTS
  ├─ getNextRank(currentRankId) ✓ EXISTS
  ├─ getXPToNextRank(totalXP, currentRank) ✓ EXISTS
  ├─ useXP hook (totalXP, currentRank) ✓ EXISTS
  ├─ Current rank highlighting → NEW CSS (glow/border)
  ├─ Locked rank styling → NEW CSS (opacity/grayscale)
  └─ Placement on Achievements page → MODIFY Achievements.tsx
```

---

## MVP Recommendation

### Phase 1: Core Showcase (Minimum Viable)

**Prioritize (Table Stakes):**
1. Vertical list of all 15 ranks (name, tagline, XP threshold)
2. Current rank highlighted with visual treatment (border + subtle glow)
3. Earned ranks normal opacity, unearned ranks dimmed (50% opacity + grayscale)
4. Placement above achievement categories on Achievements page
5. Use existing rank colors from RANKS array for text

**Rationale:** Establishes complete rank visibility. Users see where they are and what's ahead.

### Phase 2: Polish (Add Differentiators)

**Add after core works:**
1. "Progress to next rank" indicator (+XXX XP to [Next Rank])
2. Auto-scroll to current rank on page load (mobile optimization)
3. Special golden glow for Doom Slayer (max rank) when earned
4. Rank number display (1-15) for clear hierarchy

**Rationale:** Enhances UX without adding complexity. Uses existing utilities.

### Defer to Future
- Rank icons/badges → Requires asset creation, not critical for MVP
- Rank unlock timestamps → Requires data migration, low value
- Any interactive features → Keep it simple, static display
- Detailed rank lore/descriptions → Out of scope, tagline is sufficient

---

## Visual Design Patterns (From Research)

### Current Rank Highlighting

**Common Patterns:**
- **Border + Background:** League of Legends uses thick border + different background color
- **Glow Effect:** Many mobile games use subtle glow/shadow to emphasize current tier
- **Size Difference:** Some systems make current rank slightly larger (avoid - breaks grid alignment)
- **Animation:** Pulsing glow or subtle scale animation (subtle if used)

**Recommendation for Rep & Tear:**
- Thick gold border (2px) matching doom-gold theme
- Subtle golden glow (box-shadow with doom-gold color, less intense than god-mode-glow)
- Slightly brighter background (bg-gray-800 vs bg-gray-900 for locked)
- Small indicator text "CURRENT RANK" in tiny font (8px) above rank name

### Locked vs Unlocked States

**Common Patterns:**
- **Opacity Reduction:** BadgeOS uses reduced opacity (50-60%) for unearned badges
- **Grayscale Filter:** Steam/gaming badges often show locked badges in grayscale + low opacity
- **Lock Icon Overlay:** Some systems add padlock icon (avoid - clutters minimal DOOM aesthetic)
- **Dashed Border:** Indicates "not yet earned" (alternative to opacity)

**Recommendation for Rep & Tear:**
- **Locked ranks:** `opacity-50 grayscale` (50% opacity + CSS grayscale filter)
- **Earned ranks:** Full color, normal opacity, solid border
- **Current rank:** Full color, doom-gold border + glow
- **No lock icons** (keep minimal DOOM retro aesthetic)

### Layout Structure

**Vertical Ladder Pattern (Industry Standard):**
```
[RANK SHOWCASE HEADER]
┌─────────────────────────┐
│ 15. Doom Slayer (locked)│ ← Top rank first (ascending order feels more aspirational)
│     100,000 XP          │
├─────────────────────────┤
│ 14. Slayer (locked)     │
│     50,000 XP           │
├─────────────────────────┤
│ ...                     │
├═════════════════════════┤
│ 3. Sergeant (CURRENT) ✓ │ ← Highlighted with glow
│    300 XP               │
├═════════════════════════┤
│ 2. Corporal (earned)    │
│    100 XP               │
├─────────────────────────┤
│ 1. Private (earned)     │
│    0 XP                 │
└─────────────────────────┘
```

**Design Decision: Highest Rank First (Doom Slayer → Private)**
- **Pros:** Users see aspirational tiers immediately, mobile users see "goal" without scrolling
- **Cons:** Feels "backwards" compared to ascending XP
- **Alternative:** Private → Doom Slayer (ascending order matches XP growth)
- **Recommendation:** **Descending order (15→1)** - Most competitive games (VALORANT, Overwatch) show highest rank first

### Information Density

**Per Rank Card (Mobile-First):**
```
┌──────────────────────────┐
│ 10. SENTINEL             │ ← Rank number + name (color-coded)
│ Argent warrior           │ ← Tagline (gray text, smaller)
│ 11,000 XP                │ ← Threshold (doom-gold if earned, gray if locked)
└──────────────────────────┘
```

**Compact card (3 lines), scannable, uses existing data, no new assets needed.**

**Optional 4th line for current rank only:**
```
┌──────────────────────────┐
│ CURRENT RANK             │ ← Small label (8px, doom-gold)
│ 3. SERGEANT              │ ← Rank number + name (color-coded)
│ Getting stronger         │ ← Tagline (gray text)
│ 300 XP                   │ ← Threshold (doom-gold)
└──────────────────────────┘
```

---

## User Scenarios

### Scenario 1: New User (Private, 50 XP)
**Expectation:** See where they are, what's next
- All ranks visible (Doom Slayer → Private)
- Private highlighted as current rank
- Corporal (100 XP) is next visible target ("+50 XP to Corporal" indicator)
- Only Private is in full color, rest are dimmed
- Auto-scrolls to bottom (Private) on page load

### Scenario 2: Mid-Tier User (Captain, 1,500 XP)
**Expectation:** See progress within military ranks, what's ahead
- All ranks visible
- Captain highlighted as current rank
- Ranks 1-5 (Private → Captain) in full color (earned)
- Ranks 6-15 (Major → Doom Slayer) dimmed (locked)
- Auto-scrolls to Captain (middle of list) on page load
- Can see "next up" is Major (2,000 XP) with "+500 XP to Major" indicator

### Scenario 3: End-Game User (Doom Slayer, 100K+ XP)
**Expectation:** Show off max rank achievement
- All ranks in full color (all earned)
- Doom Slayer at top highlighted with special golden glow (ultra-god-glow intensity)
- No "next rank" indicator (already at max)
- Message: "MAX RANK ACHIEVED - RIP & TEAR!"
- Pride in seeing full ladder completed

### Scenario 4: Mobile User (Any Rank)
**Expectation:** Quick scan, no excessive scrolling
- Compact cards (3 lines each, ~40px height)
- Auto-scroll to current rank (lands in view immediately)
- Smooth scroll to top/bottom (highest/lowest ranks)
- Touch-friendly spacing (no accidental taps)
- 5-6 ranks visible on screen (iPhone 12 viewport: ~667px height)

---

## Integration Points

### Existing Components to Modify

**1. Achievements.tsx** (src/pages/Achievements.tsx)
- Add `<RankShowcase />` component before achievement categories section
- Update page header to "GLORY & RANKS" or keep separate "RANK PROGRESSION" section
- Maintain existing doom-panel styling for consistency

**Current structure:**
```tsx
<div className="space-y-3">
  {/* Header */}
  <div className="doom-panel p-3 text-center">...</div>

  {/* Achievement Categories */}
  {CATEGORY_ORDER.map(category => ...)}
</div>
```

**New structure:**
```tsx
<div className="space-y-3">
  {/* Header */}
  <div className="doom-panel p-3 text-center">...</div>

  {/* NEW: Rank Showcase */}
  <RankShowcase currentRank={currentRank} totalXP={totalXP} />

  {/* Achievement Categories */}
  {CATEGORY_ORDER.map(category => ...)}
</div>
```

### Existing Hooks to Use

**useXP Hook** (src/hooks/useXP.ts) - Already provides:
- `totalXP: number` - Total XP earned
- `currentRank: Rank` - Current rank object
- `xpToNextRank: number` - XP needed to next rank
- **No changes needed** - just consume in new component

### Existing Utilities to Use

**ranks.ts** (src/lib/ranks.ts) - Already provides:
- `RANKS: Rank[]` - All 15 ranks with xpThreshold, color, tagline
- `getRankForXP(totalXP)` - Get rank for given XP
- `getNextRank(currentRankId)` - Get next rank in progression
- `getXPToNextRank(totalXP, currentRank)` - Calculate XP to next rank
- **No changes needed**

---

## New Component Structure

### RankShowcase Component

**File:** `src/components/RankShowcase.tsx`

```typescript
import { useRef, useEffect } from 'react';
import { RANKS } from '../lib/ranks';
import type { Rank } from '../types';

interface RankShowcaseProps {
  currentRank: Rank;
  totalXP: number;
  xpToNextRank: number;
}

export default function RankShowcase({ currentRank, totalXP, xpToNextRank }: RankShowcaseProps) {
  const currentRankRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current rank on mount
  useEffect(() => {
    if (currentRankRef.current) {
      currentRankRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, []);

  // Render ranks in descending order (Doom Slayer → Private)
  const ranksDescending = [...RANKS].reverse();

  return (
    <div className="doom-panel p-3">
      {/* Header */}
      <h2 className="text-doom-gold text-[12px] font-bold text-center mb-3">
        RANK PROGRESSION
      </h2>

      {/* Rank List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {ranksDescending.map(rank => {
          const isEarned = totalXP >= rank.xpThreshold;
          const isCurrent = rank.id === currentRank.id;
          const isMaxRank = rank.id === 15;

          return (
            <div
              key={rank.id}
              ref={isCurrent ? currentRankRef : null}
              className={`
                rank-card p-2 rounded border
                ${isCurrent ? 'current-rank' : ''}
                ${isEarned ? 'earned' : 'locked'}
                ${isMaxRank && isEarned ? 'max-rank' : ''}
              `}
            >
              {isCurrent && (
                <p className="text-doom-gold text-[8px] mb-1">CURRENT RANK</p>
              )}
              <p className={`text-[10px] font-bold ${rank.color}`}>
                {rank.id}. {rank.name.toUpperCase()}
              </p>
              <p className="text-gray-400 text-[8px]">{rank.tagline}</p>
              <p className={`text-[8px] ${isEarned ? 'text-doom-gold' : 'text-gray-500'}`}>
                {rank.xpThreshold.toLocaleString()} XP
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress to Next Rank */}
      {currentRank.id < 15 && (
        <div className="mt-3 text-center">
          <p className="text-gray-400 text-[8px]">
            +{xpToNextRank.toLocaleString()} XP to{' '}
            <span className="text-doom-gold">{RANKS[currentRank.id].name}</span>
          </p>
        </div>
      )}

      {currentRank.id === 15 && (
        <div className="mt-3 text-center">
          <p className="text-doom-gold text-[10px] font-bold">
            MAX RANK ACHIEVED - RIP & TEAR!
          </p>
        </div>
      )}
    </div>
  );
}
```

**CSS additions to `src/index.css`:**

```css
/* Rank Showcase Styles */
.rank-card {
  transition: all 0.3s ease;
}

.rank-card.locked {
  opacity: 0.5;
  filter: grayscale(100%);
  border-color: rgba(156, 163, 175, 0.3); /* gray-400 with opacity */
}

.rank-card.earned {
  opacity: 1;
  filter: none;
  border-color: rgba(156, 163, 175, 0.5); /* gray-400 */
}

.rank-card.current-rank {
  opacity: 1;
  filter: none;
  border-color: #d4af37; /* doom-gold */
  background: rgba(31, 41, 55, 0.8); /* bg-gray-800 with opacity */
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3); /* Subtle gold glow */
}

.rank-card.max-rank.earned {
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.6); /* Intense gold glow (like ultra-god-glow) */
}

/* Scrollbar styling for rank list */
.rank-card::-webkit-scrollbar {
  width: 4px;
}

.rank-card::-webkit-scrollbar-track {
  background: rgba(17, 24, 39, 0.5); /* bg-gray-900 */
}

.rank-card::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5); /* gray-400 */
  border-radius: 2px;
}

.rank-card::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.7); /* doom-gold */
}
```

---

## Technical Complexity Estimates

| Component | Complexity | Effort | Reason |
|-----------|------------|--------|--------|
| Rank list rendering | **LOW** | 1 hour | Map over RANKS array, basic conditional styling |
| Current rank highlighting | **LOW** | 30 min | CSS border + box-shadow, conditional class |
| Locked rank styling | **LOW** | 30 min | CSS opacity + filter: grayscale() |
| Progress to next rank | **LOW** | 30 min | getXPToNextRank() already exists, simple string formatting |
| Auto-scroll to current rank | **MEDIUM** | 1 hour | useEffect + useRef + scrollIntoView, test on mobile |
| Golden glow for max rank | **LOW** | 15 min | Copy existing glow CSS, apply conditionally |
| Integration into Achievements page | **LOW** | 30 min | Import component, pass props from useXP |

**Total Estimated Effort: 4-5 hours**

**Overall: LOW complexity** - Primarily a presentation layer feature using existing data/hooks. No new Firestore collections, no complex calculations, minimal new CSS.

---

## Edge Cases

### No Authenticated User (Guest Mode)
- **Issue:** useXP hook only works for authenticated users (guest users excluded from XP system per PROJECT.md)
- **Solution:** Don't render RankShowcase component if user is guest (check `user` in Achievements.tsx before rendering)

### Retroactive XP Calculation in Progress
- **Issue:** User might see "Private" briefly while retroactive XP calculates (first load)
- **Solution:** useXP hook already handles this (calculates on first load), show loading state if needed

### Max Rank Achieved
- **Issue:** No "next rank" to display
- **Solution:** Show "MAX RANK ACHIEVED - RIP & TEAR!" message instead of "+XXX XP to [Next Rank]"

### Very Low XP (0 XP, never worked out)
- **Issue:** Still at Private, no progress to show
- **Solution:** Perfectly valid state - highlight Private, show "100 XP to Corporal"

### Mobile Scrolling Performance
- **Issue:** 15 rank cards might cause scroll jank on older devices
- **Solution:** Use `max-h-[400px]` container with overflow-y-auto, CSS will-change: transform for smooth scrolling

---

## Performance Considerations

### Render Performance
- **List Size:** 15 ranks (small, no virtualization needed)
- **Render Cost:** Minimal (static data, no API calls)
- **Re-render Triggers:** Only when totalXP changes (workout added/removed)
- **Optimization:** React.memo on RankShowcase if needed (likely not necessary)

### Mobile Optimization
- **Auto-scroll:** Uses native `scrollIntoView` (hardware accelerated)
- **Compact Layout:** 3-line cards (~40px height), max 400px container
- **Touch Targets:** No interactive elements (static display only), no accidental tap issues

### Browser Compatibility
- **CSS Grayscale:** Supported in all modern browsers (Chrome 18+, Firefox 35+, Safari 9.1+)
- **scrollIntoView with smooth behavior:** Supported in modern browsers, fallback to instant scroll gracefully
- **Box Shadow (glow):** Supported everywhere

---

## Accessibility Considerations

### Color Alone
- **Issue:** Don't rely only on color for locked/unlocked distinction
- **Solution:** Use opacity + grayscale filter (multi-sensory encoding)

### Text Contrast
- **Locked Ranks:** 50% opacity may fail WCAG AA contrast ratio
- **Acceptable:** Non-essential content (aspirational ranks), current/earned ranks meet standards

### Semantic HTML
- **Use:** `<ol>` (ordered list) with proper `<li>` items for rank cards
- **Benefits:** Screen readers announce "List of 15 items" and position within list

### Keyboard Navigation
- **Out of Scope:** Static display, no interactive elements
- **Future:** If adding rank detail modals, ensure keyboard accessible

---

## Sources

### Gamification Rank Display Patterns
- [Gamification UI Design Meets Game Design (Medium)](https://medium.com/@incharaprasad/game-on-ui-design-meets-gamification-a27d3a6de6b1) - Overview of gamification elements including level systems
- [Mockplus Gamification UI/UX Guide](https://www.mockplus.com/blog/post/gamification-ui-ux-design-guide) - Level systems and progress tracking patterns
- [GamiPress Progress Add-on](https://gamipress.com/add-ons/gamipress-progress/) - Progress bars and level display features
- [Beam.gg - Gamifying with XP, Levels, and Ranks](https://medium.com/beam-community-blog/gamifying-the-online-community-experience-xp-levels-and-ranks-23e2e7cbf7f3) - Community gamification with rank systems (10 levels, 1 rank per 10 levels)

### XP Thresholds and Display
- [Skillsoft Percipio XP System](https://documentation.skillsoft.com/en_us/percipio/Content/A_Administrator/admn_engagement_xp.htm) - XP levels and point thresholds configuration
- [brainCloud Gamification XP Levels](https://help.getbraincloud.com/en/articles/9105678-app-design-gamification-xp-levels) - Minimum points and level requirements
- [Moodle Level Up XP Plugin](https://moodle.org/plugins/block_xp) - Display current level, progress to next, leaderboards
- [Growth Engineering - Experience Points Guide](https://www.growthengineering.co.uk/gamification-experience-points/) - Leveling up and XP collection mechanics

### Locked vs Unlocked Badge States
- [BadgeOS - Grey Out Unearned Badges](https://badgeoslive.qa.wooninjas.com/support/forums/topic/grey-out-unearned-badges/) - Unearned badges displayed as "grayed out (less opacity)"
- [Meta Quest Platform Achievements](https://developers.meta.com/horizon/documentation/unreal/ps-achievements/) - Locked icon for unearned, unlocked icon for earned achievements
- [Steam Achievement Showcase Guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2031430267) - Achievement display patterns
- [Cogmind Achievement UI Implementation](https://www.gridsagegames.com/blog/2018/05/achievements-ui-design-implementation/) - Achievement grid layout and visual states

### Vertical Rank Ladder Displays
- [VALORANT Ranks 2026](https://www.gamsgo.com/blog/valorant-ranks) - 9-tier system (Iron → Radiant), 3 divisions per rank
- [Overwatch Ranks 2026](https://www.dexerto.com/wikis/overwatch/overwatch-ranks-explained/) - 5 divisions per rank (Bronze → Grandmaster)
- [Mobile Legends Rank List 2026](https://www.lapakgaming.com/blog/en-my/mobile-legends-rank-list/) - 8 core ranks + 3 advanced tiers
- [Fortnite Ranks 2026](https://gametree.me/blog/fortnite-ranks/) - Bronze → Unreal tier progression
- [Schedule 1 All Ranks & Unlocks](https://www.thegamer.com/schedule-1-all-ranks-upgrades-new-regions-unlock-ingredients-stations-how-to-guide/) - 74 levels across 11 tiered ranks, locked/unlocked progression

### Visual Design and UI Patterns
- [Video Game Level Design Color Gradients](https://www.nuclino.com/articles/level-design) - Color indicates progression (cool blues/greens → warm oranges/reds)
- [Synty Military Combat HUD](https://syntystore.com/products/interface-military-combat-hud) - Customizable badge system for rank up/level up
- [TierMaker - Tier List Creation](https://tiermaker.com/) - Ranking system UI patterns (A/B/C tiers, color coding)
- [League of Legends Rank System](https://leagueoflegends.fandom.com/wiki/Rank_(League_of_Legends)) - Tiers with divisions (roman numerals), crest transforms with division

---

## Confidence Assessment

| Area | Confidence | Source Quality | Notes |
|------|------------|----------------|-------|
| **Table stakes features** | **HIGH** | Verified across 5+ competitive games (VALORANT, Overwatch, Mobile Legends) | All major ranking systems show full ladder, highlight current rank, dim locked ranks |
| **Visual design patterns** | **HIGH** | Direct examples from BadgeOS, Steam, League of Legends | Opacity + grayscale for locked states is industry standard |
| **Layout structure** | **MEDIUM-HIGH** | Competitive games use descending order, but ascending also valid | Recommendation: descending (15→1) matches aspirational psychology |
| **Integration complexity** | **HIGH** | Direct access to codebase confirms all needed data/hooks exist | No new dependencies, minimal CSS, uses existing patterns |
| **Mobile optimization** | **MEDIUM** | Standard scrollIntoView API, but need real device testing | Auto-scroll may need adjustment for different screen sizes |
| **Accessibility** | **MEDIUM** | WCAG guidelines applied, but locked rank contrast may fail AA | Acceptable - non-essential content (aspirational future ranks) |

**Overall Research Confidence: HIGH**
- Clear industry patterns for rank showcases
- All required data/utilities already exist in codebase
- Low technical risk, straightforward implementation
- Mobile optimization main uncertainty (need testing)

---

*Last updated: March 26, 2026*
*Research mode: Ecosystem (feature patterns for rank showcase)*
*Downstream: Roadmap creation (milestone v1.2)*
