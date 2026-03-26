# Stack Research: Rank Showcase Feature

**Project:** Rep & Tear v1.2
**Domain:** Rank display UI component (subsequent milestone)
**Researched:** 2026-03-26
**Confidence:** HIGH

## Executive Summary

**NO NEW DEPENDENCIES REQUIRED.** The rank showcase feature can be implemented entirely with existing validated capabilities from v1.1 (XP system). All required functionality is already in place:

- React 19.2 for list rendering
- Tailwind CSS for layout and responsive design
- Existing CSS animations (pulse-gold, glow effects) in index.css
- `useXP` hook provides current rank data
- RANKS array exported from `src/lib/ranks.ts`
- Existing `.achievement-card` patterns for dimmed/unlocked states

## Required Stack (Already Validated)

### Core Technologies

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | 19.2 | Component rendering, list mapping | ✓ Validated v1.1 |
| TypeScript | ~5.9 | Type safety for Rank interface | ✓ Validated v1.1 |
| Tailwind CSS | 3.4.19 | Utility classes, responsive layout | ✓ Validated v1.1 |

### Data & State

| Source | Location | Purpose | Status |
|--------|----------|---------|--------|
| `RANKS` array | `src/lib/ranks.ts` | All 15 rank definitions | ✓ Available |
| `useXP` hook | `src/hooks/useXP.ts` | Current rank, totalXP | ✓ Available |
| Rank type | `src/types/index.ts` | Type definitions | ✓ Available |

### Styling Capabilities

| Feature | Implementation | Location | Status |
|---------|---------------|----------|--------|
| Glow animation | `.god-mode-glow` keyframes | `index.css:76-94` | ✓ Reusable |
| Golden pulse | `pulse-gold` animation | `index.css:79-93` | ✓ Reusable |
| Dimmed state | `.achievement-card.locked` | `index.css:268-271` | ✓ Reusable pattern |
| Unlocked state | `.achievement-card.unlocked` | `index.css:263-266` | ✓ Reusable pattern |
| DOOM panel | `.doom-panel` gradient | `index.css:55-65` | ✓ Reusable |

## Implementation Approach

### Component Structure

```typescript
// New component: src/components/RankShowcase.tsx
import { RANKS } from '../lib/ranks';
import { useXP } from '../hooks/useXP';

// No new dependencies needed
// Uses existing Tailwind utilities + custom CSS classes
// Pattern matches existing Achievements page structure
```

### Styling Strategy

**Current Rank Highlight:**
- Apply existing `.god-mode-glow` class for golden pulse effect
- Border with `border-doom-gold` (Tailwind utility)
- Background with slight gold tint: `bg-doom-gold/10`

**Earned Ranks (below current):**
- Full opacity (100%)
- Color from `rank.color` (already defined: `text-gray-400`, `text-green-400`, etc.)
- Standard `.doom-panel` background

**Unearned Ranks (above current):**
- Dimmed: `opacity-40` or `opacity-50` (Tailwind utility)
- Grayscale filter: `filter grayscale(0.8)` (matches `.achievement-card.locked`)
- Lighter border to indicate locked state

### Layout Pattern

```tsx
<div className="doom-panel p-3">
  <h3 className="text-gray-400 text-[10px] mb-3 tracking-widest">
    RANK PROGRESSION
  </h3>
  <div className="space-y-2">
    {RANKS.map(rank => (
      <RankCard
        key={rank.id}
        rank={rank}
        isCurrent={rank.id === currentRank.id}
        isEarned={rank.xpThreshold <= totalXP}
      />
    ))}
  </div>
</div>
```

This matches the existing Achievements page pattern (lines 131-149 of `Achievements.tsx`).

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Framer Motion | Overkill for simple glow effect | Existing CSS keyframe animations |
| React Spring | Adds bundle size for animations | CSS transitions (already used) |
| CSS-in-JS (styled-components, emotion) | Project uses Tailwind + index.css | Continue existing pattern |
| Icon libraries | Only need rank names + XP | Text display, no icons needed |
| Chart libraries | Not displaying charts | Simple list layout |

## Integration Points

### With Achievements Page

Insert rank showcase ABOVE achievements section:

```tsx
// src/pages/Achievements.tsx (line ~103, after header)
<div className="space-y-3">
  {/* Header (existing) */}
  <div className="doom-panel p-3 text-center">...</div>

  {/* NEW: Rank Showcase */}
  <RankShowcase />

  {/* Achievement Categories (existing) */}
  {CATEGORY_ORDER.map(category => ...)}
</div>
```

### With useXP Hook

Already returns everything needed:

```typescript
const { totalXP, currentRank } = useXP(weeks, currentStreak, unlockedCount, weeksLoading);

// currentRank: Rank object with id, name, color, tagline, xpThreshold
// totalXP: number for comparison with rank.xpThreshold
```

No modifications to `useXP` required.

### With Type System

Existing types already sufficient:

```typescript
// src/types/index.ts (already exists)
export interface Rank {
  id: number;
  name: string;
  xpThreshold: number;
  color: string;       // Tailwind class: 'text-gray-400', etc.
  tagline: string;
}
```

## Responsive Considerations

Follow existing patterns from Achievements page:

- **Mobile (default):** Full-width cards, vertical stack
- **Desktop (640px+):** Same layout (list looks good at all sizes)
- **Font sizes:** Use existing scale (`text-[10px]`, `text-[8px]`)
- **Touch targets:** Minimum 44px height for mobile (if interactive)

Rank cards likely non-interactive (display only), so no special touch target considerations needed.

## Performance Notes

**Zero performance impact:**

- Rendering 15 rank items is trivial (< 100 DOM nodes)
- Static data from `RANKS` array (no Firestore reads)
- CSS animations are GPU-accelerated
- No external network requests
- No new dependencies to load

Existing Achievements page already renders 18 achievement cards without performance issues.

## CSS Additions Needed

**Option 1: Reuse Existing Classes (Recommended)**

No new CSS needed. Combine existing classes:

```tsx
<div className={`
  doom-panel p-3
  ${isCurrent ? 'god-mode-glow border-doom-gold bg-doom-gold/10' : ''}
  ${!isEarned ? 'opacity-50 grayscale' : ''}
`}>
```

**Option 2: Add Custom Class (If needed for clarity)**

Add to `index.css` under `@layer utilities`:

```css
.rank-card-current {
  animation: pulse-gold 1.5s ease-in-out infinite;
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.rank-card-locked {
  opacity: 0.5;
  filter: grayscale(0.8);
}
```

**Recommendation:** Option 1 (reuse existing) keeps CSS minimal and consistent.

## Migration Path

**No migrations needed:**

- Feature is pure UI (no data model changes)
- No Firestore schema changes
- No new environment variables
- No Firebase rules updates

## Testing Approach

**Manual testing sufficient:**

1. View Achievements page
2. Verify current rank has golden glow
3. Verify ranks below current are fully visible
4. Verify ranks above current are dimmed/grayed
5. Test at different XP levels (change workout history)
6. Test responsive layout (mobile, tablet, desktop)

**E2E tests (future):**

Could add Playwright tests if desired:

```typescript
test('should highlight current rank', async ({ page }) => {
  const currentRankCard = page.locator('.rank-card-current');
  await expect(currentRankCard).toHaveClass(/god-mode-glow/);
});
```

Not critical for v1.2 launch.

## Sources

- ✓ Existing codebase analysis (`src/lib/ranks.ts`, `src/hooks/useXP.ts`, `index.css`)
- ✓ React 19.2 official docs (list rendering patterns)
- ✓ Tailwind CSS 3.4 docs (utility classes for opacity, filters)
- ✓ Project conventions from `.claude/CLAUDE.md`

---

## Summary

**Zero new dependencies required.** This is a pure UI composition feature using:

1. Existing `RANKS` array for data
2. Existing `useXP` hook for current rank
3. Existing CSS animations for glow effect
4. Existing Tailwind utilities for dimming/layout
5. Existing component patterns from Achievements page

**Implementation estimate:** Single new component (`RankShowcase.tsx`) + integration into `Achievements.tsx`. No package.json changes needed.

**Risk level:** LOW - all capabilities validated in v1.1 XP system.

---
*Stack research for: Rank showcase feature (v1.2)*
*Researched: 2026-03-26*
*Confidence: HIGH (all capabilities pre-validated)*
