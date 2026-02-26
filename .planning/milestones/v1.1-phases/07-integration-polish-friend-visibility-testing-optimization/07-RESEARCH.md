---
phase: 07-integration-polish-friend-visibility-testing-optimization
type: research
status: complete
researched: 2026-02-26
---

# Phase 7: Integration & Polish - Research

**Research Question:** What do I need to know to PLAN this phase well?

**Phase Goal:** Integrate XP system with Squad features, validate performance, and optimize for production.

## 1. System Architecture Analysis

### Current XP System (Phases 4-6 Complete)

**Data Layer:**
- `src/hooks/useXP.ts` - XP state management, Firestore persistence, retroactive calculation
- `src/lib/xpFormulas.ts` - Pure XP calculation functions (base XP, streak multiplier)
- `src/lib/ranks.ts` - 15 DOOM military ranks with exponential XP thresholds (0→100,000 XP)

**UI Layer:**
- `src/components/XPBar.tsx` - Progress bar with animated fill, rank display (abbreviated on mobile)
- `src/components/XPBreakdownModal.tsx` - Bottom sheet showing XP breakdown (This Week / All Time tabs)
- `src/components/LevelUpToast.tsx` - Rank-up celebration with confetti (assumed, not read)

**Storage:**
- Firestore: `users/{uid}/stats/current` - Contains `{ totalXP, currentRankId, achievementXP, lastRankUpAt }`
- Guest users: Excluded from XP system (no LocalStorage XP)

**Key Mechanics:**
- Non-linear XP scaling: 0→0, 1→5, 2→15, 3→30, 4→50, 5→80, 6-7→100 XP
- Streak multipliers: 1x base, 1.5x (4 weeks), 1.75x (12 weeks), 2x (26 weeks), 2.5x (52 weeks, capped)
- Achievement bonus: +100 XP per achievement
- Retroactive XP: Calculated on first load when `totalXP` is undefined in Firestore
- Level-up toasts: Suppressed during retroactive grant (silent mode)

### Current Squad System (v1.1+, v1.2+)

**Data Layer:**
- `src/hooks/useFriends.ts` - Friend list loading, add/remove operations
- Firestore structure:
  - `users/{uid}/profile/info` - Contains `{ friendCode, displayName, photoURL, createdAt }`
  - `users/{uid}/friends/{friendUid}` - Contains `{ addedAt }`

**UI Layer:**
- `src/pages/Squad.tsx` - Friend management, add friend form
- `src/components/WeeklyLeaderboard.tsx` - Current week ranking by workout count
  - Shows rank badges (gold/silver/bronze for top 3)
  - Shows workout count (X/7) and face state (critical→godmode)
  - Top 10 display, current user highlighted

**Friend Data Display:**
- Friend list cards show: displayName, photoURL, friendCode, workout count, face state, current week days
- Leaderboard entries show: rank badge, workout count, face state
- **NO rank/XP data currently visible** - this is what Phase 7 adds

### Testing Infrastructure (v1.6, Feb 25, 2026)

**Framework:** Playwright 1.58+
**Current Coverage:** 45+ tests across 5 browsers (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)

**Existing Tests:**
- `tests/e2e/auth.spec.ts` - 9 tests (login, register, validation)
- `tests/e2e/achievements.spec.ts` - Achievement display tests
- `tests/e2e/navigation.spec.ts` - Page navigation tests

**Test Utilities:**
- `tests/utils/setup.ts` - Helper functions (clearStorage, waitForAppReady, getFaceState, toggleWorkoutDay, getWorkoutCount)
- `tests/utils/firebaseEmulator.ts` - Emulator start/stop for authenticated tests
- `tests/utils/mockAuth.ts` - Auth mocking utilities
- `tests/setup/globalSetup.ts` - Starts emulators before all tests
- `tests/setup/globalTeardown.ts` - Stops emulators after all tests

**Emulator Configuration:**
- Firebase emulators configured in `firebase.json`
- Auth Emulator: `localhost:9099`
- Firestore Emulator: `localhost:8080`
- Emulator UI: `localhost:4000`
- CI: Uses `actions/setup-java@v4` with Java 21 for emulator runtime
- Currently: Tests run on Chromium only (fast mode with emulators)

**Test Patterns:**
- `test.beforeEach()` clears storage for isolation
- Semantic selectors preferred (text, roles) over CSS
- Helper functions centralized in `tests/utils/setup.ts`
- HTML report + videos on failure uploaded as CI artifacts

## 2. Integration Requirements

### Friend Rank Display (SOCIAL-01 Requirement - Future)

**Scope for Phase 7 (from 07-CONTEXT.md):**
- Rank appears in **leaderboard entries** on Squad page (not friend list cards)
- Display format: Abbreviated rank name text (e.g., "PVT", "SGT", "CPL") below or beside display name
- Color-coded by tier: doom-gold (top ranks), doom-green (mid-tier), gray (low ranks)
- Fallback: "RCT" (Recruit) when friend has no rank data

**Denormalization Strategy (from 07-CONTEXT.md):**
- Store **rank abbreviation** and **numeric level** in `profile/info` document
- Do NOT store XP progress or XP-to-next-rank (changes too frequently)
- Sync `profile/info` only on **rank change** (not every XP update) to minimize writes
- Use Firestore batch write to update `stats/current` and `profile/info` atomically on rank change

**Implementation Approach:**
1. Update `useXP.ts` `addXP()` function to detect rank change
2. When rank changes: batch write to both `stats/current` and `profile/info`
3. Update `FriendProfile` type to include `currentRankId` and `currentRankAbbrev`
4. Update `useFriends.ts` to load rank data from `profile/info`
5. Update `WeeklyLeaderboard.tsx` to display rank below display name
6. Apply tier-based color coding (gold/green/gray)

**Rank Abbreviation Mapping:**
- Already exists in `XPBar.tsx` `abbreviateRank()` function
- Extract to shared utility for reuse (e.g., `src/lib/rankUtils.ts`)
- Abbreviations: Private→PVT, Corporal→CPL, Sergeant→SGT, Lieutenant→LT, Captain→CPT, Major→MAJ, Colonel→COL, Commander→CDR
- Higher ranks: Knight→KNT, Sentinel→SNL, Paladin→PDN, Warlord→WRL, Hellwalker→HLW, Slayer→SLR, Doom Slayer→DSL

**Color Tier Breakpoints (Claude's Discretion):**
- **Gray (low tier):** Private, Corporal (ranks 1-2)
- **Green (mid tier):** Sergeant, Lieutenant, Captain, Major (ranks 3-6)
- **Gold (top tier):** Colonel, Commander, Knight, Sentinel, Paladin, Warlord, Hellwalker, Slayer, Doom Slayer (ranks 7-15)

### Firestore Write Optimization

**Problem:** Frequent XP updates could exceed free tier limits
- Free tier: 20,000 writes/day
- Current workflow: Every workout toggle → XP update → Firestore write
- Rapid toggling (user changing mind) → multiple writes/second

**Solution (from 07-CONTEXT.md):** Debounce XP writes
- Timing: 500-1000ms after last toggle (Claude's discretion)
- Implementation: `useWeek.ts` already has `options.onXPDelta` callback
- Add debouncing layer before calling `addXP()`
- Use `setTimeout` + `clearTimeout` pattern
- Optimistic UI update (immediate), debounced Firestore write

**Additional Optimization:**
- Rank denormalization: Only write to `profile/info` on rank change (not every XP update)
- Batch writes: Use Firestore `writeBatch()` when updating multiple documents atomically
- Achievement XP: Already delayed by 800ms (Phase 5 decision)

## 3. Testing Strategy

### Test Coverage Scope (from 07-CONTEXT.md)

**Core Flows to Test:**
1. ✅ XP gain from workout toggle
2. ✅ Level-up toast display
3. ✅ Rank progression (visible in UI)
4. ❌ Retroactive XP calculation (skip - complex, slow)
5. ❌ Guest-to-auth migration (skip - not core XP flow)
6. ❌ Achievement XP bonus (skip - covered by achievement tests)

**Testing Approach:**
- Use Firebase emulators (Auth + Firestore) for authenticated tests
- Run on Chromium only (not all 5 browsers) to keep CI fast
- Visual verification: Assert level-up toast renders with correct rank name
- E2E test file: `tests/e2e/xp-system.spec.ts` (new file)

### Test Scenarios

**Scenario 1: XP Gain from Workout Toggle**
```typescript
test('should gain XP when toggling workout day', async ({ page }) => {
  // Setup: Authenticate user, start at 0 XP
  // Act: Toggle Monday workout (0→1 workout)
  // Assert: XP bar updates (0 → 5 XP), rank stays "Private"
});
```

**Scenario 2: Level-Up Toast Display**
```typescript
test('should show level-up toast when reaching new rank', async ({ page }) => {
  // Setup: Authenticate user, set XP to 95 (near Corporal threshold at 100)
  // Act: Toggle workout to gain 5+ XP
  // Assert: Level-up toast appears with "CORPORAL" rank name
});
```

**Scenario 3: XP Bar Animation**
```typescript
test('should animate XP bar fill on XP gain', async ({ page }) => {
  // Setup: Authenticate user, start at 0 XP
  // Act: Toggle workout to gain XP
  // Assert: XP bar fill width increases (check style attribute)
});
```

**Scenario 4: Rank Progression Display**
```typescript
test('should display current rank in XP bar', async ({ page }) => {
  // Setup: Authenticate user at different XP levels
  // Assert: Rank name matches XP amount (Private→Corporal→Sergeant)
});
```

**Scenario 5: XP Breakdown Modal**
```typescript
test('should show XP breakdown when clicking XP bar', async ({ page }) => {
  // Setup: Authenticate user with workouts + streak
  // Act: Click XP bar
  // Assert: Modal shows base XP + streak bonus breakdown
});
```

### Test Helper Functions (New)

Add to `tests/utils/setup.ts`:

```typescript
// Get current XP from XP bar text
async function getCurrentXP(page: Page): Promise<number>

// Get current rank name from XP bar
async function getCurrentRank(page: Page): Promise<string>

// Wait for level-up toast to appear
async function waitForLevelUpToast(page: Page, expectedRank: string): Promise<void>

// Set user XP in Firestore (for test setup)
async function setUserXP(page: Page, xp: number): Promise<void>
```

### Test Data Setup

**Firebase Emulator Seeding:**
- Create test user: `test@example.com` / `password123`
- Set initial XP via Firestore emulator API
- Create historical weeks for streak testing
- Use Firestore Admin SDK in test setup for direct data manipulation

**Emulator Data Isolation:**
- Each test clears emulator data in `beforeEach` (via Firestore Admin SDK `clearFirestoreData()`)
- No persistence between tests (fresh emulator state)

## 4. Performance Optimization

### Retroactive XP Calculation Performance

**Target (from 07-CONTEXT.md):** Under 2 seconds for 100+ weeks

**Current Implementation:**
- `useXP.ts` Effect 2: Retroactive calculation on first load
- Iterates through all weeks, calculates XP, sums total
- Single Firestore write at end (atomic)

**Optimization Strategies:**
1. **Client-side calculation:** Already implemented (no Firestore queries needed)
2. **Skeleton loading state:** Show placeholder in XP bar during calculation
3. **Calculation algorithm:** O(n) linear time, already optimal
4. **Testing:** Measure performance with 100+ weeks in test suite

**Skeleton Loading State Design (Claude's Discretion):**
- Options:
  - Pulsing gray bar in XP bar area
  - Spinning loader icon with "Calculating XP..." text
  - Skeleton rank name + progress bar
- Trigger: When `loading === true` in `useXP()`
- Duration: 0-2 seconds (target)

### Debouncing Implementation

**Pattern:**
```typescript
// In useWeek.ts or Tracker.tsx
const [xpDebounceTimer, setXPDebounceTimer] = useState<NodeJS.Timeout | null>(null);

const handleWorkoutToggle = (dayIndex: number) => {
  // 1. Optimistic UI update (immediate)
  toggleWorkout(dayIndex);

  // 2. Clear previous debounce timer
  if (xpDebounceTimer) {
    clearTimeout(xpDebounceTimer);
  }

  // 3. Set new debounce timer (500-1000ms)
  const timer = setTimeout(() => {
    // Calculate XP delta and persist
    const delta = calculateXPDelta(oldWorkouts, newWorkouts);
    addXP(delta);
  }, 750); // Claude's discretion: 750ms

  setXPDebounceTimer(timer);
};
```

**Considerations:**
- **Optimistic XP display:** Update local XP state immediately, debounce Firestore write
- **Race condition:** User navigates away before debounce fires → XP not saved
  - Solution: Flush debounce on component unmount (`useEffect` cleanup)
- **Multiple toggles:** Each toggle resets debounce timer (only last action triggers write)

### Low-End Device Testing

**Target (from 07-CONTEXT.md):** Manual spot-check with Chrome DevTools throttling

**Throttling Settings:**
- Network: Slow 3G (download 500 Kbps, upload 500 Kbps, latency 400ms)
- CPU: 4x slowdown (simulates low-end mobile CPU)

**Test Workflow:**
1. Open Chrome DevTools → Performance tab
2. Enable CPU throttling (4x slowdown)
3. Enable network throttling (Slow 3G)
4. Test workout toggle → XP update → UI animation
5. Verify: No UI lag, animations smooth, XP bar updates within 200ms

**Acceptance Criteria:**
- XP bar animation renders at 30+ FPS (smooth)
- Workout toggle responds within 100ms (perceived instant)
- Level-up toast appears within 500ms of rank change

## 5. Firestore Schema Updates

### Profile Info Document (Denormalization)

**Current Schema:**
```typescript
users/{uid}/profile/info: {
  friendCode: string,
  displayName: string,
  photoURL: string | null,
  createdAt: Timestamp,
  updatedAt?: Timestamp
}
```

**New Schema (Phase 7):**
```typescript
users/{uid}/profile/info: {
  friendCode: string,
  displayName: string,
  photoURL: string | null,
  createdAt: Timestamp,
  updatedAt?: Timestamp,
  // NEW: Denormalized rank data
  currentRankId?: number,           // e.g., 5 (Captain)
  currentRankAbbrev?: string,       // e.g., "CPT"
  lastRankUpAt?: Timestamp          // Last rank change time
}
```

**Migration Strategy:**
- No migration needed (fields are optional)
- Existing users: Fields populated on next rank change
- New users: Fields populated on first rank attainment
- Fallback: Display "RCT" (Recruit) when fields are undefined

### Security Rules Update

**Current Rules:** Already allow authenticated users to read other users' profiles (for friend discovery)

**Phase 7 Changes:** No changes needed (rank data is public, same as displayName)

## 6. TypeScript Type Updates

### FriendProfile Type Extension

**Current:**
```typescript
export interface FriendProfile {
  uid: string;
  friendCode: string;
  displayName: string;
  photoURL: string | null;
  addedAt: Date;
}
```

**Phase 7:**
```typescript
export interface FriendProfile {
  uid: string;
  friendCode: string;
  displayName: string;
  photoURL: string | null;
  addedAt: Date;
  // NEW: Rank data
  currentRankId?: number;
  currentRankAbbrev?: string;
  lastRankUpAt?: Date;
}
```

### LeaderboardEntry Type Update

**Current (in WeeklyLeaderboard.tsx):**
```typescript
interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  workoutCount: number;
  faceState: string;
  rank: number;           // Position in leaderboard (1st, 2nd, 3rd)
  isCurrentUser: boolean;
}
```

**Phase 7:**
```typescript
interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  workoutCount: number;
  faceState: string;
  rank: number;                // Position in leaderboard (1st, 2nd, 3rd)
  isCurrentUser: boolean;
  // NEW: DOOM rank
  doomRankId?: number;         // e.g., 5 (Captain)
  doomRankAbbrev?: string;     // e.g., "CPT"
}
```

## 7. UI Design Decisions

### Rank Display in Leaderboard

**Layout Options:**

**Option A: Below display name (Vertical Stack)**
```
[Rank Badge] [Photo] [Display Name]     [X/7]
                      [SGT] [HEALTHY]
```

**Option B: Beside display name (Horizontal Row)**
```
[Rank Badge] [Photo] [Display Name • SGT]  [X/7]
                      [HEALTHY]
```

**Option C: Color-coded badge**
```
[Rank Badge] [Photo] [SGT] [Display Name]  [X/7]
                            [HEALTHY]
```

**Recommended:** Option A (vertical stack)
- Clearer visual hierarchy
- Consistent with face state display
- Easier to scan at small font sizes

### Rank Color Tiers

**Tier Mapping:**
- **Gray (Recruit-level):** Private (1), Corporal (2) → `text-gray-400`
- **Green (Veteran-level):** Sergeant (3), Lieutenant (4), Captain (5), Major (6) → `text-doom-green`
- **Gold (Elite-level):** Colonel (7), Commander (8), Knight (9), Sentinel (10), Paladin (11), Warlord (12), Hellwalker (13), Slayer (14), Doom Slayer (15) → `text-doom-gold`

**Rationale:**
- Matches existing DOOM theme colors
- Clear visual progression (gray → green → gold)
- Gold feels prestigious (reserved for rank 7+)

### Skeleton Loading State

**Design:**
```
┌─────────────────────────────────┐
│ [~~~~~] CALCULATING XP...       │
│ ▓▓▓░░░░░░░░░░░░░░░░░░░░░░       │ ← Pulsing gray bar
│ ░░░░ / ░░░░ XP                  │
└─────────────────────────────────┘
```

**Implementation:**
- CSS animation: `@keyframes skeleton-pulse` (already exists in project)
- Trigger: `if (loading) return <SkeletonXPBar />;`
- Text: "CALCULATING XP..." in gray-600
- Duration: 0-2 seconds (performance target)

## 8. File Modification Map

### New Files

1. **`tests/e2e/xp-system.spec.ts`**
   - XP gain tests (workout toggle → XP update)
   - Level-up toast tests (rank progression)
   - XP bar animation tests
   - XP breakdown modal tests

2. **`src/lib/rankUtils.ts`** (optional, extracted utility)
   - `abbreviateRank(rankName: string): string`
   - `getRankColorTier(rankId: number): string`
   - Shared by `XPBar.tsx` and `WeeklyLeaderboard.tsx`

### Modified Files

1. **`src/hooks/useXP.ts`**
   - Add rank denormalization: Batch write to `profile/info` on rank change
   - Update `addXP()` to detect rank change and sync profile

2. **`src/hooks/useFriends.ts`**
   - Load rank data from `profile/info` (currentRankId, currentRankAbbrev)
   - Pass rank data to Friend objects

3. **`src/components/WeeklyLeaderboard.tsx`**
   - Display rank abbreviation below display name
   - Apply color tier based on rank ID
   - Handle missing rank data (fallback to "RCT")

4. **`src/components/XPBar.tsx`** (optional)
   - Extract `abbreviateRank()` to shared utility (or keep local)
   - Add skeleton loading state when `loading === true`

5. **`src/pages/Tracker.tsx`** (or `src/hooks/useWeek.ts`)
   - Add debouncing layer for XP writes (500-1000ms after last toggle)
   - Flush debounce on component unmount

6. **`src/types/index.ts`**
   - Extend `FriendProfile` with rank fields
   - Update `LeaderboardEntry` (if extracted to types file)

7. **`tests/utils/setup.ts`**
   - Add XP-related helper functions (getCurrentXP, getCurrentRank, waitForLevelUpToast, setUserXP)

## 9. Testing Execution Plan

### Test File Structure

**`tests/e2e/xp-system.spec.ts`:**
```typescript
test.describe('XP System', () => {
  test.beforeEach(async ({ page }) => {
    // Clear emulator data
    // Authenticate test user
    // Navigate to Tracker page
  });

  test.describe('XP Gain', () => {
    test('should gain 5 XP when toggling first workout');
    test('should gain 15 XP when toggling second workout');
    test('should apply streak multiplier to XP gain');
  });

  test.describe('Level-Up', () => {
    test('should show level-up toast when reaching new rank');
    test('should update rank display in XP bar after level-up');
    test('should trigger confetti animation on level-up');
  });

  test.describe('XP Bar UI', () => {
    test('should animate XP bar fill on XP gain');
    test('should display numerical XP progress (X / Y XP)');
    test('should show skeleton loading during retroactive calculation');
  });

  test.describe('XP Breakdown Modal', () => {
    test('should open modal when clicking XP bar');
    test('should show base XP + streak bonus breakdown');
    test('should display rank progression to next rank');
  });
});
```

### CI Configuration Updates

**Current:** Tests run on Chromium only (Phase 7 decision)

**Phase 7 Changes:**
- Increase timeout for XP tests (retroactive calculation may take 2s)
- Ensure Java 21 is installed in CI (for Firebase emulators)
- Add emulator health check before running XP tests

**`.github/workflows/playwright.yml` updates:**
```yaml
- name: Setup Java
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '21'

- name: Run E2E Tests
  run: npm run test:e2e
  timeout-minutes: 15  # Increase for emulator tests
```

## 10. Performance Benchmarking

### Benchmarking Approach

**Retroactive XP Calculation:**
1. Create test user with 100 weeks of workout data in emulator
2. Measure time from page load to XP bar display (fully calculated)
3. Assert: Total time < 2000ms (2 seconds)
4. Record: Log calculation time to console for monitoring

**Debounced XP Writes:**
1. Simulate rapid workout toggles (5 toggles in 1 second)
2. Assert: Only 1 Firestore write occurs (after debounce delay)
3. Monitor: Firestore usage in emulator UI (verify write count)

**Low-End Device Simulation:**
1. Manual test in Chrome DevTools (CPU 4x slowdown, Slow 3G)
2. Record: Frame rate of XP bar animation (target: 30+ FPS)
3. Verify: No UI freezing, smooth transitions

### Acceptance Criteria

- ✅ Retroactive XP calculation completes in <2 seconds for 100+ weeks
- ✅ Debouncing reduces Firestore writes by 80%+ during rapid toggling
- ✅ XP bar animations run at 30+ FPS on low-end devices (4x CPU throttle)
- ✅ Friend rank badges appear on Squad page leaderboard
- ✅ Rank data denormalized to profile/info (only updated on rank change)
- ✅ E2E tests validate XP gain, level-up, and rank progression
- ✅ All tests pass on CI with Firebase emulators

## 11. Risk Analysis

### Potential Issues

**Risk 1: Firestore Emulator Flakiness in CI**
- **Probability:** Medium (Java version issues, port conflicts)
- **Impact:** High (tests fail intermittently)
- **Mitigation:** Pre-test emulator health check, retry failed tests, increase timeout

**Risk 2: Debouncing Race Condition**
- **Probability:** Low (user navigates away before XP saves)
- **Impact:** Medium (lost XP update)
- **Mitigation:** Flush debounce on component unmount, add retry logic

**Risk 3: Retroactive Calculation Performance**
- **Probability:** Low (algorithm is O(n), tested with 100+ weeks)
- **Impact:** Medium (slow load for power users)
- **Mitigation:** Skeleton loading state, monitor performance metrics

**Risk 4: Rank Denormalization Data Inconsistency**
- **Probability:** Low (batch writes are atomic)
- **Impact:** Medium (friend rank displays outdated rank)
- **Mitigation:** Use Firestore batch writes, test rank sync in E2E tests

### Testing Gaps

**Skipped in Phase 7 (Deferred to Future):**
- Retroactive XP calculation tests (complex setup, slow execution)
- Guest-to-auth migration tests (edge case, not core flow)
- Achievement XP bonus tests (covered by achievement tests)
- Multi-device sync tests (requires emulator data sync)

**Rationale:** Focus on core XP flows that users interact with daily (workout toggle, level-up). Complex edge cases deferred to avoid scope creep.

## 12. Summary: What to Plan

### Must-Have Features

1. **Friend Rank Display**
   - Add rank abbreviation + color tier to WeeklyLeaderboard entries
   - Extract rank abbreviation utility (or keep local)
   - Handle missing rank data (fallback to "RCT")

2. **Rank Denormalization**
   - Update useXP.ts to batch write profile/info on rank change
   - Add currentRankId, currentRankAbbrev to profile/info schema
   - Update useFriends.ts to load rank data

3. **XP Write Debouncing**
   - Add debounce layer (500-1000ms) for XP writes
   - Flush debounce on component unmount
   - Optimistic UI update (immediate XP display)

4. **E2E Test Coverage**
   - Create tests/e2e/xp-system.spec.ts
   - Test XP gain, level-up toast, rank progression
   - Add XP helper functions to tests/utils/setup.ts

5. **Skeleton Loading State**
   - Show pulsing placeholder in XP bar during retroactive calculation
   - Trigger when loading === true in useXP()

### Performance Targets

- Retroactive XP calculation: <2 seconds for 100+ weeks
- Debouncing: 80%+ reduction in Firestore writes
- Low-end device: 30+ FPS animations (4x CPU throttle)

### File Changes Summary

**New Files (2):**
- `tests/e2e/xp-system.spec.ts` - XP system E2E tests
- `src/lib/rankUtils.ts` - Shared rank utilities (optional)

**Modified Files (7):**
- `src/hooks/useXP.ts` - Rank denormalization
- `src/hooks/useFriends.ts` - Load rank data
- `src/components/WeeklyLeaderboard.tsx` - Display rank badges
- `src/components/XPBar.tsx` - Skeleton loading state
- `src/pages/Tracker.tsx` - XP write debouncing
- `src/types/index.ts` - Extend FriendProfile type
- `tests/utils/setup.ts` - Add XP helper functions

### Open Questions for Planning

1. **Debounce timing:** 500ms, 750ms, or 1000ms? (Sweet spot between responsiveness and write reduction)
2. **Skeleton design:** Pulsing bar, spinning loader, or skeleton text? (UX preference)
3. **Rank color tiers:** Gray (1-2), Green (3-6), Gold (7-15) - confirm breakpoints
4. **Test timeout:** How long to wait for retroactive calculation in CI? (2s target + 1s buffer = 3s timeout?)
5. **Emulator health check:** Add pre-test check or rely on global setup retry logic?

---

**Research Complete:** All architectural, technical, and testing context gathered. Ready for planning phase.
