# Architecture Research

**Domain:** Rank Showcase Integration (Achievements Page Enhancement)
**Researched:** 2026-03-26
**Confidence:** HIGH

## Integration Overview

### Existing Architecture (Achievements Page)

```
┌─────────────────────────────────────────────────────────────┐
│                    Achievements.tsx (Page)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Header Panel (doom-panel)                          │    │
│  │  - Title, count, loading state                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Category Sections (doom-panel × 4)                  │    │
│  │  - STREAK, PERFORMANCE, SPECIAL, HIDDEN              │    │
│  │  - AchievementCard components                        │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ useAchievements  │  │ AchievementContext│                 │
│  │ (hook)           │  │ (provider)        │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### New Architecture (with Rank Showcase)

```
┌─────────────────────────────────────────────────────────────┐
│                    Achievements.tsx (Page)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Header Panel (doom-panel)                          │    │
│  │  - Title: "GLORY" or "ACHIEVEMENTS"                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  RankShowcase Component (NEW)                        │    │
│  │  - All 15 ranks in grid                              │    │
│  │  - Current rank highlighted                          │    │
│  │  - Earned/unearned states                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Achievement Categories (existing)                   │    │
│  │  - STREAK, PERFORMANCE, SPECIAL, HIDDEN              │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ useXP            │  │ useAchievements  │                 │
│  │ (from App.tsx)   │  │ (existing hook)  │                 │
│  └──────────────────┘  └──────────────────┘                 │
│           │                       │                          │
│           ↓                       ↓                          │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ RANKS array      │  │ AchievementContext│                 │
│  │ (lib/ranks.ts)   │  │ (existing)        │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### New Component: RankShowcase.tsx

**Location:** `src/components/RankShowcase.tsx`

**Responsibility:** Display all 15 DOOM military ranks with visual distinction between earned/unearned and current rank highlight.

**Props Interface:**
```typescript
interface RankShowcaseProps {
  currentRank: Rank;
  totalXP: number;
  loading?: boolean;
}
```

**Component Structure:**
```typescript
export default function RankShowcase({ currentRank, totalXP, loading }: RankShowcaseProps) {
  // 3a. Import RANKS from lib/ranks.ts
  // 3b. No local state needed (all derived from props)
  // 3c. Calculate earned/unearned status for each rank
  // 3d. Render grid layout with rank cards
}
```

**Key Features:**
- **Grid Layout:** Responsive grid (2 cols mobile, 3 cols tablet, 5 cols desktop)
- **Rank States:**
  - **Current:** Highlighted with glow effect (similar to god-mode-glow)
  - **Earned:** Full opacity, full color
  - **Unearned:** Dimmed (opacity: 0.4), desaturated (filter: grayscale(0.5))
- **Card Content:**
  - Rank name (abbreviated on mobile, full on desktop)
  - XP threshold
  - Color-coded text (matches rank.color from RANKS array)
  - Optional: tagline on hover/desktop
- **Loading State:** Skeleton placeholders (similar to XPBar loading)

### Child Component: RankCard (inline or separate)

**Recommendation:** Inline within RankShowcase.tsx (similar to AchievementCard pattern)

**Props Interface:**
```typescript
interface RankCardProps {
  rank: Rank;
  isCurrent: boolean;
  isEarned: boolean;
}
```

**Styling Strategy:**
- Reuse `.doom-panel` for base card
- New class: `.rank-card` for specific styling
- Conditional classes:
  - `.rank-current` → applies glow animation
  - `.rank-earned` → full visibility
  - `.rank-locked` → dimmed/grayscale (reuse `.achievement-card.locked` pattern)

## Data Flow

### XP Data Propagation

```
App.tsx (XP Data Source)
    │
    │ useXP hook provides:
    │ - totalXP: number
    │ - currentRank: Rank
    │ - loading: boolean
    │
    ↓
Achievements.tsx (Page)
    │
    │ Props passed to RankShowcase:
    │ - currentRank
    │ - totalXP
    │ - loading
    │
    ↓
RankShowcase Component
    │
    │ Derives:
    │ - isEarned = rank.xpThreshold <= totalXP
    │ - isCurrent = rank.id === currentRank.id
    │
    ↓
RankCard Components (map over RANKS array)
```

### Integration with Existing Context

**AchievementContext:** No changes needed. RankShowcase is XP-driven, not achievement-driven.

**XP Hook:** Already available in App.tsx, needs to be passed down via props.

**Data Source:** `RANKS` array from `src/lib/ranks.ts` (static data, no Firestore queries).

## Modified Files

### File 1: src/pages/Achievements.tsx (MODIFIED)

**Changes:**
1. Import `RankShowcase` component
2. Import XP-related props from parent (if passed via route context or props)
3. Add `RankShowcase` component between header and achievement sections
4. Pass `currentRank`, `totalXP`, `loading` props

**Current Structure:**
```typescript
export default function Achievements() {
  const { achievements, unlockedCount, loading } = useAchievements();
  // ...
  return (
    <div className="space-y-3">
      {/* Header */}
      {/* Achievement Categories */}
    </div>
  );
}
```

**New Structure:**
```typescript
export default function Achievements() {
  const { achievements, unlockedCount, loading: achievementsLoading } = useAchievements();

  // TODO: Get XP data from parent route context or props
  // const { totalXP, currentRank, loading: xpLoading } = useXPContext() || getFromRoute();

  return (
    <div className="space-y-3">
      {/* Header */}

      {/* NEW: Rank Showcase */}
      <RankShowcase
        currentRank={currentRank}
        totalXP={totalXP}
        loading={xpLoading}
      />

      {/* Achievement Categories (existing) */}
    </div>
  );
}
```

**Note:** XP data needs to flow from App.tsx → Achievements.tsx. Options:
1. **React Context** (create XPContext, wrap App, consume in Achievements)
2. **Route Context** (use React Router's data loaders)
3. **Props drilling** (pass via route element props)

**Recommendation:** Option 1 (XPContext) for consistency with AchievementContext pattern.

### File 2: src/components/RankShowcase.tsx (NEW)

**Purpose:** Display rank grid with current/earned/unearned states

**Estimated Lines:** ~150 lines (component + inline RankCard)

**Key Imports:**
- `RANKS` from `../lib/ranks`
- `abbreviateRank` from `../lib/ranks`
- `type Rank` from `../types`

**Skeleton Pattern (for loading state):**
```typescript
if (loading) {
  return (
    <div className="doom-panel p-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="rank-card-skeleton animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### File 3: src/index.css (MODIFIED)

**New CSS Classes:**

```css
/* Rank Showcase Styles */
.rank-card {
  background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #3a3a3a;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 0.25rem;
  text-align: center;
}

.rank-card.rank-current {
  border-color: #d4af37;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
  animation: pulse-rank-glow 2s ease-in-out infinite;
}

.rank-card.rank-earned {
  opacity: 1;
  filter: none;
}

.rank-card.rank-locked {
  opacity: 0.4;
  filter: grayscale(0.5);
}

@keyframes pulse-rank-glow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
  }
  50% {
    box-shadow: 0 0 25px rgba(212, 175, 55, 0.8);
  }
}
```

**Estimated Lines:** ~30 lines added to existing `index.css`

### File 4: src/contexts/XPContext.tsx (NEW, OPTIONAL)

**Purpose:** Provide XP data to all pages without prop drilling

**Estimated Lines:** ~50 lines

**Pattern:**
```typescript
import { createContext, useContext, type ReactNode } from 'react';
import type { Rank } from '../types';

interface XPContextType {
  totalXP: number;
  currentRank: Rank;
  nextRank: Rank | null;
  xpToNextRank: number;
  loading: boolean;
}

const XPContext = createContext<XPContextType | null>(null);

interface XPProviderProps {
  children: ReactNode;
  value: XPContextType;
}

export function XPProvider({ children, value }: XPProviderProps) {
  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
}

export function useXPContext() {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error('useXPContext must be used within an XPProvider');
  }
  return context;
}
```

**App.tsx Changes:**
```typescript
// Wrap entire app with XPProvider
const xpData = useXP(weeks, currentStreak, unlockedAchievementCount, weeksLoading);

return (
  <XPProvider value={xpData}>
    {/* existing routes */}
  </XPProvider>
);
```

**Alternative (Simpler):** Pass XP data directly to Achievements.tsx via route element props. Use this if XP data is ONLY needed in Achievements page.

## Architectural Patterns

### Pattern 1: Composition Over Prop Drilling

**What:** Instead of passing XP props through multiple levels, use React Context to provide XP data globally.

**When to use:** When data is needed in multiple pages/components (XP data is likely needed in Tracker, Achievements, Squad).

**Trade-offs:**
- **Pro:** Cleaner component signatures, no prop drilling
- **Pro:** Easier to add XP features to other pages later
- **Con:** More abstraction (harder to trace data flow for new devs)
- **Con:** Adds one more Context provider (already have Auth, Achievement, Boost)

**Example:**
```typescript
// App.tsx
<XPProvider value={xpData}>
  <AchievementProvider onXPGrant={xpData.addXP}>
    <Routes>
      <Route path="/glory" element={<Achievements />} />
    </Routes>
  </AchievementProvider>
</XPProvider>

// Achievements.tsx
const { totalXP, currentRank, loading } = useXPContext();
```

### Pattern 2: Static Data Iteration

**What:** `RANKS` array is static (never changes at runtime), so iterate over it directly in component.

**When to use:** When displaying predefined lists with dynamic state (earned/current status).

**Trade-offs:**
- **Pro:** No Firestore queries, instant rendering
- **Pro:** Deterministic order (ID 1-15)
- **Con:** Can't be customized per-user (acceptable for this use case)

**Example:**
```typescript
{RANKS.map(rank => {
  const isEarned = totalXP >= rank.xpThreshold;
  const isCurrent = rank.id === currentRank.id;

  return <RankCard key={rank.id} rank={rank} isEarned={isEarned} isCurrent={isCurrent} />;
})}
```

### Pattern 3: Derived State from Props

**What:** RankShowcase calculates earned/current status in render logic (no useState needed).

**When to use:** When all component state can be calculated from props.

**Trade-offs:**
- **Pro:** No state management bugs, pure function of props
- **Pro:** Easier to test (no internal state to mock)
- **Con:** Recalculates on every render (acceptable for simple boolean checks)

**Example:**
```typescript
// Inside RankShowcase component (no useState)
const ranksWithStatus = RANKS.map(rank => ({
  ...rank,
  isEarned: totalXP >= rank.xpThreshold,
  isCurrent: rank.id === currentRank.id,
}));
```

## Responsive Design Strategy

### Mobile-First Grid Layout

**Mobile (default):** 2 columns (compact, fits 15 ranks in ~8 rows)
```css
grid-cols-2
gap-2
```

**Tablet (640px+):** 3 columns (better visual balance)
```css
sm:grid-cols-3
sm:gap-3
```

**Desktop (1024px+):** 5 columns (all ranks fit in 3 rows)
```css
lg:grid-cols-5
lg:gap-4
```

### Text Responsiveness

**Rank Name:**
- Mobile: Abbreviated (`abbreviateRank(rank.name)`) → "PVT", "CPL", "SGT"
- Desktop: Full name → "Private", "Corporal", "Sergeant"

**XP Threshold:**
- Mobile: Compact formatting (`1.2K`, `50K`) via `toLocaleString()`
- Desktop: Full numbers (`1,200`, `50,000`)

**Implementation:**
```typescript
{/* Mobile: abbreviated */}
<span className="sm:hidden">{abbreviateRank(rank.name)}</span>

{/* Desktop: full name */}
<span className="hidden sm:inline">{rank.name}</span>
```

## Anti-Patterns

### Anti-Pattern 1: Fetching Rank Data from Firestore

**What people might do:** Store RANKS array in Firestore and query it per-user.

**Why it's wrong:**
- Ranks are universal (same for all users), not user-specific
- Wastes Firestore quota on static data
- Adds unnecessary loading time

**Do this instead:** Import `RANKS` from `lib/ranks.ts` directly (static import, bundled with code).

### Anti-Pattern 2: Storing "Earned Ranks" in Firestore

**What people might do:** Save array of earned rank IDs to Firestore.

**Why it's wrong:**
- Earned status is derivable from `totalXP >= rank.xpThreshold`
- Storing derived data creates sync issues (what if XP changes but earned ranks aren't updated?)
- Wastes Firestore writes

**Do this instead:** Calculate earned status in component: `const isEarned = totalXP >= rank.xpThreshold`.

### Anti-Pattern 3: Separate "Rank Page" Instead of Integrating into Achievements

**What people might do:** Create new route `/ranks` with separate page.

**Why it's wrong:**
- Fragments "glory" achievements (ranks and badges feel disconnected)
- Adds unnecessary navigation complexity
- Achievements page is underutilized (only shows badges, not progression)

**Do this instead:** Integrate RankShowcase into existing Achievements page (rename to "Glory" if needed).

## Scaling Considerations

| Scale | Impact | Mitigation |
|-------|--------|------------|
| 15 ranks (current) | Trivial (renders instantly) | None needed |
| 50+ ranks (future expansion) | Grid becomes long on mobile | Add pagination or "Show All" toggle |
| Real-time rank updates | Re-render on every XP change | Already optimized (React batches updates) |
| Loading skeleton | Good UX for slow XP calc | Implemented in RankShowcase |

**Performance Notes:**
- RANKS array is tiny (15 objects × ~100 bytes = 1.5KB)
- Derived calculations (`isEarned`, `isCurrent`) are O(n) with n=15 (negligible)
- No Firestore queries = no network latency
- Component re-renders only when `currentRank` or `totalXP` change (React memo not needed)

## Integration Checklist

### Phase 1: Create RankShowcase Component
- [ ] Create `src/components/RankShowcase.tsx`
- [ ] Implement props interface (`currentRank`, `totalXP`, `loading`)
- [ ] Implement grid layout (responsive cols)
- [ ] Implement RankCard rendering logic (map over RANKS)
- [ ] Implement earned/current state derivation
- [ ] Implement loading skeleton

### Phase 2: Add CSS Styles
- [ ] Add `.rank-card` base style to `index.css`
- [ ] Add `.rank-current` glow animation
- [ ] Add `.rank-earned` and `.rank-locked` states
- [ ] Test responsive breakpoints (mobile, tablet, desktop)

### Phase 3: Create XPContext (Optional)
- [ ] Create `src/contexts/XPContext.tsx`
- [ ] Implement provider and hook
- [ ] Wrap App.tsx with XPProvider
- [ ] Test context propagation

### Phase 4: Integrate into Achievements Page
- [ ] Import RankShowcase in `Achievements.tsx`
- [ ] Get XP data (via context or props)
- [ ] Insert RankShowcase between header and categories
- [ ] Handle loading states
- [ ] Test layout and spacing

### Phase 5: Testing & Polish
- [ ] Test all 15 rank states (current, earned, locked)
- [ ] Test responsive layout on mobile/tablet/desktop
- [ ] Test loading skeleton
- [ ] Test with guest users (XP disabled)
- [ ] Verify DOOM aesthetic consistency

## Build Order (Recommended Sequence)

1. **RankShowcase Component** → Build in isolation, import RANKS directly
2. **CSS Styles** → Add rank-card classes, test locally
3. **XPContext (if needed)** → Create context, wire up App.tsx
4. **Achievements Integration** → Import and place component
5. **Testing & Refinement** → Responsive checks, edge cases, polish

**Rationale:** Bottom-up approach allows testing each piece in isolation before integration. RankShowcase can be developed/tested independently using mock props.

## Sources

- Existing codebase architecture (`src/pages/Achievements.tsx`, `src/hooks/useXP.ts`)
- DOOM UI patterns (`src/index.css` achievement-card styles)
- React Context patterns (`src/contexts/AchievementContext.tsx`)
- XP data structures (`src/lib/ranks.ts`, `src/types/index.ts`)

---
*Architecture research for: Rank Showcase Integration*
*Researched: 2026-03-26*
*Confidence: HIGH (based on existing codebase patterns)*
