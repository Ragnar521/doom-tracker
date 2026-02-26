# Technology Stack - XP & Levels System

**Project:** Rep & Tear - XP & Levels Milestone (v1.1)
**Researched:** 2026-02-26

## Summary

**NO new dependencies required.** All XP & Levels features can be built with the existing React 19.2 + TypeScript + Tailwind CSS stack. The app already has confetti animations, toast notifications, and Firebase Firestore for data persistence. Use CSS transitions for XP bar animations, existing Firestore patterns for data storage, and pure CSS/React for level-up celebrations.

## Core Stack (UNCHANGED)

The existing stack already provides everything needed for XP & Levels:

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | 19.2.0 | UI components, state management | ✓ Already in use |
| TypeScript | ~5.9.3 | Type safety for XP/level data | ✓ Already in use |
| Tailwind CSS | 3.4.19 | XP bar styling, animations | ✓ Already in use |
| Firebase Firestore | 12.7.0 | XP/level data persistence | ✓ Already in use |
| Vite | 7.2.4 | Build tool | ✓ Already in use |

## New Capabilities (NO NEW DEPENDENCIES)

### XP Bar Animation
**What:** Smooth fill animation for XP progress bar
**How:** CSS `transition: width 0.5s ease-in-out`
**Why:** Native CSS transitions are lightweight (0KB), smooth (60fps), and performant (GPU-accelerated with `transform` property)

**Implementation Pattern:**
```css
.xp-bar-fill {
  transition: width 0.5s ease-in-out;
  will-change: transform; /* Hardware acceleration */
}
```

**Source:** [CSS Transitions Guide](https://www.joshwcomeau.com/animation/css-transitions/), [Josh Collinsworth's Transition Tips](https://joshcollinsworth.com/blog/great-transitions)

### Level-Up Celebration
**What:** Toast notification + confetti for rank-up
**How:** Reuse existing `AchievementToast.tsx` + `Confetti.tsx` components
**Why:** Already implemented, tested, and matches DOOM aesthetic

**Integration Points:**
- `src/components/AchievementToast.tsx` - Template for level-up toast
- `src/components/Confetti.tsx` - 30-piece confetti animation (3s duration)
- `src/components/Toast.tsx` - Toast container management

### XP Calculation
**What:** Determine XP earned per workout, streak, achievement
**How:** Pure TypeScript utility functions in new `src/lib/xpUtils.ts`
**Why:** No library needed - simple arithmetic calculations

**Recommended Formula (Polynomial Progression):**
```typescript
// XP required for level N
const xpForLevel = (level: number) => Math.floor(100 * Math.pow(level, 1.5));
```

**Rationale:**
- Polynomial (level^1.5) balances early progression (fast levels 1-5) with long-term engagement (slower levels 10+)
- More forgiving than exponential curves, avoids "grindy" feeling
- Industry standard for casual/fitness apps (not hardcore RPGs)

**Source:** [GameDesign Math: RPG Level-based Progression](https://www.davideaversa.it/blog/gamedesign-math-rpg-level-based-progression/), [Quantitative Design: XP Thresholds](https://www.gamedeveloper.com/design/quantitative-design---how-to-define-xp-thresholds-)

### Data Storage
**What:** Persist XP, current level, total XP earned
**How:** Add fields to existing Firestore `users/{uid}/profile/info` document
**Why:** Leverage existing auth-scoped data structure, no new collections needed

**Firestore Schema Addition:**
```typescript
users/{uid}/profile/info: {
  // Existing fields
  friendCode: string,
  displayName: string,
  photoURL: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp,

  // NEW XP fields
  xp: number,              // Current XP in level
  level: number,           // Current rank level (1-10)
  totalXP: number,         // Lifetime XP earned
}
```

**Why This Approach:**
- No new collection (avoids Firestore read cost increases)
- Already auth-scoped (security rules exist)
- Denormalized for fast reads (no joins needed)
- Atomic updates with Firestore transactions

**Source:** [Firestore Data Model Best Practices](https://firebase.google.com/docs/firestore/best-practices), [Advanced Firestore Data Modeling](https://fireship.io/lessons/advanced-firestore-nosql-data-structure-examples/)

## Alternatives Considered (REJECTED)

| Category | Considered | Why NOT |
|----------|------------|---------|
| Animation Library | Framer Motion | 30.7k stars, 3.6M downloads, but **adds 100KB+ to bundle**. CSS transitions already handle XP bar fills smoothly. Project constraint: "no new dependencies" |
| Animation Library | React Spring | 29k stars, 788k downloads, **adds 50KB+ to bundle**. Overkill for simple width transitions. |
| Animation Library | Anime.js | 66k stars, 319k downloads, **adds 30KB+ to bundle**. Not React-specific, CSS is lighter. |
| Progress Bar Component | Material UI LinearProgress | Pre-built component, but **adds 300KB+ dependency**. Tailwind custom build is 0KB overhead. |
| XP Formula Library | None exist | Custom formula is 5 lines of code, no library needed. |
| Data Storage | New Firestore collection | Increases read costs, requires new security rules. Existing `profile/info` is sufficient. |

**Sources:**
- [Comparing Best React Animation Libraries for 2026](https://blog.logrocket.com/best-react-animation-libraries/)
- [Top React Animation Libraries Comparison](https://www.syncfusion.com/blogs/post/react-animation-libraries-comparison)

## Installation

**NONE REQUIRED** - All capabilities exist in current stack.

Verify existing dependencies:
```bash
npm ls react react-dom firebase tailwindcss typescript
```

## Implementation Checklist

**Files to Create:**
- [ ] `src/lib/xpUtils.ts` - XP calculation formulas
- [ ] `src/hooks/useXP.ts` - XP/level state management hook
- [ ] `src/components/XPBar.tsx` - XP progress bar component
- [ ] `src/components/RankBadge.tsx` - Military rank display component
- [ ] `src/components/LevelUpToast.tsx` - Level-up celebration (clone `AchievementToast.tsx`)

**Files to Modify:**
- [ ] `src/types/index.ts` - Add XP/level TypeScript types
- [ ] `src/hooks/useProfile.ts` - Add XP fields to profile interface
- [ ] `src/pages/Tracker.tsx` - Integrate XP bar, remove probability
- [ ] `firestore.rules` - Security rules for XP fields (read/write own XP only)

**Firestore Updates:**
- [ ] Migrate existing users: Add `xp: 0, level: 1, totalXP: 0` to profiles
- [ ] Update write operations: Use Firestore transactions for XP updates (prevent race conditions)

## Performance Considerations

### CSS Animation Performance
- Use `transition` on `width` property (triggers layout but acceptable for single bar)
- Add `will-change: transform` for GPU acceleration
- Keep animation duration ≤ 500ms for smooth 60fps
- Respect `prefers-reduced-motion` media query

**Source:** [How to Create Smooth CSS Animations](https://blog.pixelfreestudio.com/how-to-create-smooth-css-animations-best-practices/), [CSS Animations Performance Guide](https://design.dev/guides/css-animations/)

### Firestore Read Optimization
- Batch XP updates: Don't write to Firestore on every workout toggle
- Update on page unload or after 5-second debounce
- Cache XP locally in React state, sync to Firestore periodically
- Use transactions for level-up calculations to avoid race conditions

**Source:** [Firestore Query Performance Best Practices](https://estuary.dev/blog/firestore-query-best-practices/)

### React Rendering Optimization
- Memoize XP calculations with `useMemo`
- Debounce XP bar width updates (avoid re-render on every XP change)
- Use `React.memo` for `XPBar` component (only re-render when XP changes)

## Integration Points

### Existing Components to Reuse

**1. Toast System**
- `src/components/Toast.tsx` - Toast notification system
- `src/components/AchievementToast.tsx` - Template for level-up toast
- Pattern: Create `LevelUpToast.tsx` by copying `AchievementToast.tsx`

**2. Confetti Animation**
- `src/components/Confetti.tsx` - 30-piece confetti (3s duration, 5 colors)
- Trigger: `<Confetti trigger={leveledUp} />`

**3. Data Persistence**
- `src/hooks/useProfile.ts` - Profile data CRUD operations
- Pattern: Add `updateXP()` method to existing hook

**4. Custom Hooks Pattern**
- `src/hooks/useWeek.ts` - Example of data layer hook
- Pattern: Create `useXP.ts` following same structure

### New XP Sources

Calculate XP from these existing systems:

| Source | Hook/Context | XP Award |
|--------|-------------|----------|
| Workout toggle | `useWeek.ts` | +10 XP per workout |
| Week completion (3+ workouts) | `useStats.ts` | +50 XP bonus |
| Streak milestone | `useStats.ts` | +100 XP per streak tier |
| Achievement unlock | `useAchievements.ts` | +200 XP per achievement |

## Confidence Assessment

| Area | Confidence | Rationale |
|------|-----------|-----------|
| CSS Animations | **HIGH** | CSS transitions are well-documented, widely used, existing codebase already uses CSS animations (god-mode glow, confetti) |
| XP Formula | **HIGH** | Industry-standard polynomial progression, verified by GameDev community sources |
| Data Storage | **HIGH** | Firestore patterns already validated in app (profile, weeks, achievements), denormalization is documented best practice |
| Component Reuse | **HIGH** | Existing AchievementToast/Confetti components are proven, just need cloning for level-up |
| Zero Dependencies | **HIGH** | All capabilities confirmed available in current stack, no external libraries needed |

## Risks & Mitigations

### Risk: XP Bar Animation Jank
**Impact:** Poor UX if bar stutters during fill
**Mitigation:** Use `transition: width` with `ease-in-out`, add `will-change: transform`, keep duration ≤ 500ms
**Validation:** Test on low-end mobile devices

### Risk: Firestore Race Conditions
**Impact:** XP could be lost if two writes happen simultaneously
**Mitigation:** Use Firestore transactions for XP updates, batch writes with debouncing
**Validation:** Test rapid workout toggles (edge case)

### Risk: Scope Creep (Adding Unnecessary Dependencies)
**Impact:** Bundle size increases, violates project constraint
**Mitigation:** Stick to CSS-first approach, reject animation libraries
**Validation:** Run `npm ls` after implementation to verify no new dependencies

## References

### XP System Design
- [GameDesign Math: RPG Level-based Progression](https://www.davideaversa.it/blog/gamedesign-math-rpg-level-based-progression/)
- [Quantitative Design: XP Thresholds](https://www.gamedeveloper.com/design/quantitative-design---how-to-define-xp-thresholds-)
- [Example Level Curve Formulas](https://www.designthegame.com/learning/courses/course/fundamentals-level-curve-design/example-level-curve-formulas-game-progression)

### CSS Animations
- [CSS Transitions Interactive Guide](https://www.joshwcomeau.com/animation/css-transitions/)
- [Ten Tips for Better CSS Transitions](https://joshcollinsworth.com/blog/great-transitions)
- [How to Create Smooth CSS Animations](https://blog.pixelfreestudio.com/how-to-create-smooth-css-animations-best-practices/)
- [CSS Animations Performance Guide](https://design.dev/guides/css-animations/)

### React Animation Libraries (Rejected)
- [Comparing Best React Animation Libraries for 2026](https://blog.logrocket.com/best-react-animation-libraries/)
- [Top React Animation Libraries Comparison](https://www.syncfusion.com/blogs/post/react-animation-libraries-comparison)

### Firestore Data Modeling
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Choose a Data Structure](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Advanced Firestore Data Modeling](https://fireship.io/lessons/advanced-firestore-nosql-data-structure-examples/)
- [Firestore Query Performance Best Practices](https://estuary.dev/blog/firestore-query-best-practices/)

---

**Key Takeaway:** Zero new dependencies needed. Existing React 19.2 + TypeScript + Tailwind CSS + Firestore stack already provides all capabilities for XP & Levels system. Use CSS transitions (0KB overhead) instead of animation libraries (30-100KB overhead). Leverage existing toast/confetti components for celebrations.
