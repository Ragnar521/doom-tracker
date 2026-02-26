# Architecture Patterns: XP & Levels System

**Domain:** Workout tracker with gamification (XP/rank progression)
**Researched:** 2026-02-26

## Recommended Architecture

### System Overview

The XP & Levels system integrates into existing Rep & Tear architecture by:
1. Adding XP calculation logic as a **new custom hook** (`useXP`)
2. Storing XP/rank data in **new Firestore subcollection** (`users/{uid}/xp/current`)
3. Creating **new UI components** for XP bar and level-up celebrations
4. **Modifying Tracker page** to display XP bar (removing probability calculation)
5. Reusing existing **toast/confetti system** for level-up celebrations

```
User completes workout
    ↓
useWeek.toggleDay() (EXISTING)
    ↓
useXP.calculateXPGain() (NEW)
    ↓
Firestore users/{uid}/xp/current (NEW)
    ↓
useXP detects level-up (NEW)
    ↓
XPContext triggers toast + confetti (NEW, pattern from AchievementContext)
    ↓
XPBar component re-renders (NEW)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **XPContext** (NEW) | Global XP state, level-up events | useXP hook, XPToastContainer |
| **useXP** (NEW) | XP calculation, rank determination, Firestore sync | AuthContext, useWeek, useStats, useAchievements |
| **XPBar** (NEW) | Display current XP, level, progress bar | XPContext |
| **XPToast** (NEW) | Level-up celebration notification | XPContext |
| **XPToastContainer** (NEW) | Manage level-up toast queue | XPContext |
| **RankDisplay** (NEW) | Show current rank with icon | XPContext |
| **Tracker.tsx** (MODIFIED) | Add XPBar, remove probability section | useXP |

### Data Flow

**XP Earning Flow:**
```typescript
// 1. User toggles workout (EXISTING)
toggleDay(dayIndex)

// 2. XP hook listens for workout count changes (NEW)
useEffect(() => {
  const newXP = calculateXPGain(workoutCount, currentStreak, achievements)
  addXP(newXP)
}, [workoutCount, currentStreak, achievements])

// 3. Check for level-up (NEW)
if (currentXP >= xpForNextLevel) {
  levelUp()
  triggerLevelUpCelebration()
}

// 4. Save to Firestore (NEW)
setDoc(doc(db, 'users', uid, 'xp', 'current'), {
  currentXP,
  totalXP,
  level,
  rank,
  updatedAt: serverTimestamp()
})
```

**Level-Up Celebration Flow:**
```typescript
// XPContext (mirrors AchievementContext pattern)
const [newLevelUps, setNewLevelUps] = useState<LevelUp[]>([])

// Trigger level-up
const levelUp = (newLevel, newRank) => {
  setNewLevelUps(prev => [...prev, { level: newLevel, rank: newRank }])
}

// XPToastContainer (mirrors AchievementToastContainer)
// Shows toast + confetti, auto-dismisses after 4s
<XPToastContainer levelUps={newLevelUps} onDismiss={dismissLevelUp} />
```

## Patterns to Follow

### Pattern 1: XP Calculation Hook
**What:** Custom hook manages XP state, calculations, Firestore sync
**When:** Following existing pattern (useStats, useAchievements)
**Example:**
```typescript
// src/hooks/useXP.ts
export interface XPData {
  currentXP: number;      // XP in current level (0 to xpForNextLevel)
  totalXP: number;        // Lifetime XP
  level: number;          // Current level (1-50)
  rank: Rank;             // Current rank (calculated from level)
  updatedAt: Date | null;
}

export function useXP() {
  const { user } = useAuth()
  const { workoutCount } = useWeek()
  const { stats } = useStats()
  const { unlockedCount } = useAchievementContext()

  const [xpData, setXPData] = useState<XPData>(defaultXPData)
  const [loading, setLoading] = useState(true)

  // Load from Firestore or localStorage
  useEffect(() => {
    loadXPData()
  }, [user])

  // Calculate XP gain from workouts
  const calculateXPGain = useCallback(() => {
    const baseXP = workoutCount * 10
    const streakBonus = stats.currentStreak * 5
    const achievementBonus = unlockedCount * 25
    return baseXP + streakBonus + achievementBonus
  }, [workoutCount, stats.currentStreak, unlockedCount])

  // Add XP and check for level-up
  const addXP = useCallback(async (xp: number) => {
    // Implementation
  }, [])

  return { xpData, loading, addXP, calculateXPGain }
}
```

### Pattern 2: Context Provider with Toast Container
**What:** Context manages XP state globally, toast container handles celebrations
**When:** Reuse existing AchievementContext pattern
**Example:**
```typescript
// src/contexts/XPContext.tsx
export function XPProvider({ children }: { children: ReactNode }) {
  const { xpData, loading, addXP, calculateXPGain } = useXP()
  const [newLevelUps, setNewLevelUps] = useState<LevelUp[]>([])

  return (
    <XPContext.Provider value={{ xpData, loading, addXP, calculateXPGain }}>
      {children}
      <XPToastContainer levelUps={newLevelUps} onDismiss={dismissLevelUp} />
    </XPContext.Provider>
  )
}
```

### Pattern 3: Client-Side Rank Calculation
**What:** Rank is derived from level using pure function (not stored separately)
**When:** Always calculate on read, never store in Firestore
**Example:**
```typescript
// src/lib/ranks.ts
export type Rank =
  | 'MARINE'           // Levels 1-5
  | 'CORPORAL'         // Levels 6-10
  | 'SERGEANT'         // Levels 11-15
  | 'LIEUTENANT'       // Levels 16-20
  | 'CAPTAIN'          // Levels 21-25
  | 'MAJOR'            // Levels 26-30
  | 'COLONEL'          // Levels 31-35
  | 'COMMANDER'        // Levels 36-40
  | 'DOOMGUY'          // Levels 41-45
  | 'DOOM SLAYER'      // Levels 46-50

export function getLevelForRank(rank: Rank): number {
  const levels = { MARINE: 1, CORPORAL: 6, SERGEANT: 11, ... }
  return levels[rank]
}

export function getRankFromLevel(level: number): Rank {
  if (level <= 5) return 'MARINE'
  if (level <= 10) return 'CORPORAL'
  // ... etc
  return 'DOOM SLAYER'
}

export function getXPForLevel(level: number): number {
  // Exponential curve: level^2 * 100
  // Level 1 → 100 XP, Level 10 → 10,000 XP, Level 50 → 250,000 XP
  return Math.pow(level, 2) * 100
}
```

### Pattern 4: XP Bar Component Integration
**What:** XP bar replaces probability section on Tracker page
**When:** Same location, similar visual style (doom-panel with progress bar)
**Example:**
```typescript
// src/components/XPBar.tsx
export default function XPBar() {
  const { xpData } = useXPContext()

  const progressPercent = (xpData.currentXP / getXPForLevel(xpData.level + 1)) * 100

  return (
    <div className="doom-panel p-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <RankIcon rank={xpData.rank} />
          <span className="text-doom-gold text-[10px] font-bold">{xpData.rank}</span>
        </div>
        <span className="text-gray-500 text-[8px]">
          LEVEL {xpData.level}
        </span>
      </div>

      <div className="xp-bar h-3 rounded overflow-hidden bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-doom-gold to-yellow-600 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between mt-1 text-[8px] text-gray-500">
        <span>{xpData.currentXP.toLocaleString()} XP</span>
        <span>{getXPForLevel(xpData.level + 1).toLocaleString()} XP</span>
      </div>
    </div>
  )
}
```

### Pattern 5: Level-Up Toast (Reuse Achievement Pattern)
**What:** Toast appears at top center, auto-dismisses, confetti animation
**When:** Identical to achievement unlocks (proven pattern)
**Example:**
```typescript
// src/components/XPToast.tsx
export default function XPToast({ levelUp, onDismiss }: XPToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true)
      setShowConfetti(true)
    }, 100)

    const dismissTimer = setTimeout(() => {
      onDismiss(levelUp.level)
    }, 4000)

    return () => clearTimeout(dismissTimer)
  }, [levelUp, onDismiss])

  return (
    <>
      <Confetti trigger={showConfetti} />
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 doom-panel p-4 border-2 border-doom-gold">
        <div className="flex items-center gap-3">
          <RankIcon rank={levelUp.rank} className="animate-bounce" />
          <div>
            <p className="text-doom-gold text-[10px] tracking-widest">RANK UP!</p>
            <p className="text-white text-sm font-bold">LEVEL {levelUp.level}</p>
            <p className="text-gray-400 text-[8px]">{levelUp.rank}</p>
          </div>
        </div>
      </div>
    </>
  )
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Computed Values
**What:** Storing rank separately from level in Firestore
**Why bad:** Creates data inconsistency risk, wastes storage
**Instead:** Always compute rank from level on read

```typescript
// BAD
interface XPData {
  level: number
  rank: Rank  // ❌ Duplicates derived data
}

// GOOD
interface XPData {
  level: number
  // rank computed via getRankFromLevel(level)
}
```

### Anti-Pattern 2: Complex XP Formulas
**What:** XP calculation depends on too many variables (time of day, day of week, etc.)
**Why bad:** Confuses users, hard to understand progression
**Instead:** Simple formula: workouts + streaks + achievements

```typescript
// BAD
const xp = workoutCount * (isDayOfWeek('Monday') ? 15 : 10) +
           (hourOfDay < 12 ? 5 : 0) +
           (weatherIsRainy ? 20 : 0)  // ❌ Too complex

// GOOD
const xp = workoutCount * 10 +        // ✓ Clear base rate
           stats.currentStreak * 5 +   // ✓ Rewards consistency
           unlockedCount * 25          // ✓ Bonus for achievements
```

### Anti-Pattern 3: Separate Stats Document
**What:** Creating `users/{uid}/stats/xp` instead of `users/{uid}/xp/current`
**Why bad:** Conflicts with existing `stats/current` document (workout stats)
**Instead:** Use dedicated `xp` subcollection

```typescript
// BAD
users/{uid}/stats/current  // ❌ Existing workout stats
users/{uid}/stats/xp       // ❌ Confusing namespace collision

// GOOD
users/{uid}/stats/current  // ✓ Workout stats
users/{uid}/xp/current     // ✓ XP stats (separate concern)
```

### Anti-Pattern 4: XP Recalculation on Every Render
**What:** Calling `calculateXPGain()` in component render
**Why bad:** Performance issue, unnecessary Firestore writes
**Instead:** Calculate only when workoutCount changes

```typescript
// BAD
function XPBar() {
  const xp = calculateXPGain()  // ❌ Runs on every render
  return <div>{xp}</div>
}

// GOOD
useEffect(() => {
  const xp = calculateXPGain()  // ✓ Runs only when deps change
  addXP(xp)
}, [workoutCount, currentStreak])
```

### Anti-Pattern 5: Level-Down on Workout Removal
**What:** Subtracting XP when user removes workout
**Why bad:** Frustrating UX, punishes honest tracking
**Instead:** XP is cumulative, never decreases

```typescript
// BAD
const handleToggleDay = async (dayIndex: number) => {
  const wasCompleted = weekData.workouts[dayIndex]
  if (wasCompleted) {
    subtractXP(10)  // ❌ Penalizes user
  }
}

// GOOD
const handleToggleDay = async (dayIndex: number) => {
  // XP never decreases, only increases
  // Removing workout just means future XP is lower
}
```

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Firestore reads** | 1 read per login (xp/current) | Same (1 doc per user) | Same (efficient) |
| **Firestore writes** | 1 write per workout toggle | Same (batched updates) | Same (no N+1 queries) |
| **XP calculation** | Client-side (instant) | Client-side (no backend) | Client-side (scales) |
| **Rank lookup** | O(1) lookup table | O(1) lookup table | O(1) lookup table |
| **Level-up detection** | Simple comparison | Simple comparison | Simple comparison |

**Optimization Strategy:**
- Client-side rank calculation (no Firestore query)
- Single document write per workout session (batch XP updates)
- Memoized XP calculations (useMemo in useXP hook)
- No real-time listeners (load on mount, update on write)

## Integration Points

### New Files to Create

| File | Purpose | Depends On |
|------|---------|------------|
| `src/contexts/XPContext.tsx` | Global XP state provider | useXP hook |
| `src/hooks/useXP.ts` | XP data management, Firestore sync | AuthContext, useWeek, useStats |
| `src/lib/ranks.ts` | Rank definitions, XP formulas | None (pure functions) |
| `src/components/XPBar.tsx` | XP progress bar UI | XPContext |
| `src/components/RankIcon.tsx` | Rank badge/icon display | None |
| `src/components/XPToast.tsx` | Level-up celebration toast | Confetti (existing) |
| `src/components/XPToastContainer.tsx` | Manage level-up toast queue | XPToast |

### Files to Modify

| File | Changes | Reason |
|------|---------|--------|
| `src/App.tsx` | Wrap app in `<XPProvider>` | Provide XP context globally |
| `src/pages/Tracker.tsx` | Add `<XPBar />`, remove probability section | Display XP progression |
| `firestore.rules` | Add `xp/{docId}` rules | Secure XP data |
| `src/types/index.ts` | Export XP types | Type definitions |

### Files NOT to Modify

| File | Why Leave Unchanged |
|------|---------------------|
| `src/hooks/useWeek.ts` | XP calculation happens in useXP, not useWeek |
| `src/hooks/useStats.ts` | Stats calculation is separate from XP |
| `src/hooks/useAchievements.ts` | Achievements trigger XP bonus, but don't store XP |
| `src/components/StatsPanel.tsx` | Stats panel shows streaks/workouts, not XP |
| `src/lib/achievements.ts` | Achievement definitions unchanged |

### Firestore Schema Changes

**New Subcollection:**
```
users/{uid}/xp/current
  {
    currentXP: number,       // XP in current level (resets on level-up)
    totalXP: number,         // Lifetime XP (never resets)
    level: number,           // Current level (1-50)
    updatedAt: Timestamp     // Last update timestamp
  }
```

**Security Rules:**
```javascript
// firestore.rules (ADD THIS)
match /users/{userId} {
  match /xp/{docId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

**LocalStorage (Guest Mode):**
```typescript
localStorage.setItem('doom-tracker-xp', JSON.stringify({
  currentXP: 450,
  totalXP: 12450,
  level: 12,
  updatedAt: '2026-02-26T...'
}))
```

## Build Order (Suggested Dependency-Aware Sequence)

### Phase 1: Foundation (No Dependencies)
1. **Create `src/lib/ranks.ts`** - Pure functions (rank lookup, XP formulas)
2. **Create `src/types/index.ts`** exports - XPData, Rank, LevelUp types
3. **Add Firestore rules** - Security for xp subcollection

### Phase 2: Data Layer (Depends on Phase 1)
4. **Create `src/hooks/useXP.ts`** - XP management hook
5. **Create `src/contexts/XPContext.tsx`** - Context provider (uses useXP)
6. **Modify `src/App.tsx`** - Wrap in XPProvider

### Phase 3: UI Components (Depends on Phase 2)
7. **Create `src/components/RankIcon.tsx`** - Icon display component
8. **Create `src/components/XPBar.tsx`** - Progress bar (uses XPContext)
9. **Create `src/components/XPToast.tsx`** - Level-up celebration
10. **Create `src/components/XPToastContainer.tsx`** - Toast queue management

### Phase 4: Integration (Depends on Phase 3)
11. **Modify `src/pages/Tracker.tsx`** - Add XPBar, remove probability
12. **Update `src/contexts/XPContext.tsx`** - Wire toast container
13. **Test XP flow end-to-end** - Workout → XP gain → Level-up → Toast

**Rationale:**
- Phase 1: No dependencies, can be done in parallel
- Phase 2: Needs Phase 1 types/functions
- Phase 3: Needs Phase 2 context/hooks
- Phase 4: Final integration after all components exist

## Sources

**Fitness App Gamification Patterns:**
- [Top Gamified Fitness Apps of 2025](https://www.workoutquestapp.com/top-gamified-fitness-apps-of-2025)
- [Fitocracy Alternatives (2025)](https://the-titan-life.com/2025/09/04/fitocracy-alternatives-in-2025-the-best-apps-for-gamified-fitness/)
- [Strava App Engagement Strategies](https://www.strivecloud.io/blog/app-engagement-strava)
- [Top 10 Fitness Gamification Examples (2026)](https://yukaichou.com/gamification-examples/fitness-gamification-examples/)

**DOOM Lore & Ranks:**
- [DOOM Marine Wiki](https://doom.fandom.com/wiki/Marine)
- [Doomguy Rank Discussion](https://www.doomworld.com/forum/topic/60758-doomguys-rank/)
- [DOOM Slayer Wiki](https://doom.fandom.com/wiki/Doom_Slayer)

**UI/UX Design Patterns:**
- [Fitness App Design Best Practices](https://www.zfort.com/blog/How-to-Design-a-Fitness-App-UX-UI-Best-Practices-for-Engagement-and-Retention)
- [Custom Progress Bar in React (2026)](https://thelinuxcode.com/how-i-build-a-custom-progress-bar-component-in-react-2026-edition/)
- [Material UI React Progress Components](https://mui.com/material-ui/react-progress/)
