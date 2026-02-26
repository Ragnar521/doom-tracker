# Roadmap: Rep & Tear

## Milestones

- ✅ **v1.0 Enhanced Analytics** - Phases 1-3 (shipped 2026-02-25)
- 🚧 **v1.1 XP & Levels** - Phases 4-7 (in progress)

## Phases

<details>
<summary>✅ v1.0 Enhanced Analytics (Phases 1-3) - SHIPPED 2026-02-25</summary>

Enhanced Rep & Tear's analytics capabilities by fixing the confusing color scheme, removing the 12-week timeline limitation, and adding monthly/yearly summaries with trend indicators.

- [x] **Phase 1: Health Bar Color Foundation** (1/1 plans) — completed 2026-02-25
- [x] **Phase 2: Expandable Timeline & Summaries** (5/5 plans) — completed 2026-02-25
- [x] **Phase 3: Trend Indicators & Comparisons** (2/2 plans) — completed 2026-02-25

**Delivered:**
- Health bar color paradigm (green=best, yellow=moderate, red=critical)
- Expandable timeline with lazy loading (year/month sections)
- Period summaries (monthly/yearly stats)
- Trend indicators (vs previous period, vs all-time average)
- Dual visual encoding (status borders + health backgrounds)
- Performance optimization for 100+ weeks of data

**See:** `.planning/milestones/v1.0-ROADMAP.md` for full details

</details>

### 🚧 v1.1 XP & Levels (In Progress)

**Milestone Goal:** Add XP and military rank progression system that rewards workouts, streaks, and achievements with DOOM-themed leveling.

- [x] **Phase 4: Foundation** - Data structures and XP formulas
- [x] **Phase 5: Data Layer** - XP calculation logic and Firestore integration
- [x] **Phase 6: UI & Celebrations** - Visual components and level-up animations
- [ ] **Phase 7: Integration & Polish** - Friend visibility, testing, and optimization

## Phase Details

### Phase 4: Foundation (Data Structures & XP Formulas)
**Goal**: Establish data model, rank definitions, and XP calculation rules
**Depends on**: Nothing (first phase of v1.1)
**Requirements**: XP-01, XP-03, RANK-01
**Success Criteria** (what must be TRUE):
  1. All 15 DOOM military ranks are defined with clear XP thresholds (Private → Doom Slayer)
  2. XP formula calculates workout rewards based on face state scaling (1 workout = 5 XP, 6-7 workouts = 100 XP)
  3. Streak bonus multiplier applies to weekly XP (1.5x for 4+ weeks, 2x for 12+ weeks)
  4. TypeScript types exist for XPData, Rank, and LevelUp structures
  5. Firestore security rules allow authenticated users to read/write XP field in stats/current document
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md — TypeScript types and 15 DOOM military rank definitions (2 tasks, 91s)
- [x] 04-02-PLAN.md — XP formula functions (non-linear scaling + streak multipliers) (2 tasks, 131s)

### Phase 5: Data Layer (XP Calculation Logic & Firestore Integration)
**Goal**: Implement XP calculation engine and persistent storage with retroactive XP support
**Depends on**: Phase 4
**Requirements**: XP-02, XP-04, XP-05, RANK-03
**Success Criteria** (what must be TRUE):
  1. User earns XP when toggling workouts with correct face state scaling
  2. User earns 100 XP bonus when unlocking achievements
  3. Existing users receive retroactive XP from all historical workouts on first load
  4. Retroactive XP calculation completes silently without triggering level-up toasts
  5. Guest users' XP migrates correctly when signing in (recalculated from Firestore history, LocalStorage XP discarded)
  6. XP persists in Firestore stats/current document for authenticated users
  7. useXP hook prevents infinite loops through proper memoization and primitive dependencies
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — useXP hook with Firestore persistence and retroactive XP calculation (2 tasks, 118s)
- [x] 05-02-PLAN.md — Workout toggle XP delta and achievement XP bonus integration (2 tasks, 186s)

### Phase 6: UI & Celebrations (Visual Components & Level-Up)
**Goal**: Create XP bar, rank displays, and level-up celebration animations
**Depends on**: Phase 5
**Requirements**: RANK-02, UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. XP progress bar appears on Tracker page below DoomGuy face
  2. Progress bar shows current rank badge and numerical XP (current/required for next rank)
  3. Progress bar animates smoothly when XP increases with CSS transition
  4. User sees level-up celebration (toast + confetti) when reaching new rank
  5. User can tap XP bar to see XP breakdown modal (base workout XP, streak bonus, achievement bonuses)
  6. "Probability to hit target" section is removed from Tracker page
  7. Level-up animation uses two-step fill (100% → pause → reset to new level) to avoid jarring jumps
**Plans**: 2 plans

Plans:
- [x] 06-01-PLAN.md — XP progress bar, LevelUpToast, CSS animations, and Tracker page integration (2 tasks, 194s)
- [x] 06-02-PLAN.md — XP breakdown bottom sheet modal with "This Week" / "All Time" tabs (2 tasks, 160s)

### Phase 7: Integration & Polish (Friend Visibility, Testing, Optimization)
**Goal**: Integrate XP system with Squad features, validate performance, and optimize for production
**Depends on**: Phase 6
**Requirements**: None (integration phase)
**Success Criteria** (what must be TRUE):
  1. Friend rank badges appear on Squad page leaderboard
  2. Rank information denormalized to profile/info document for friend queries
  3. E2E tests validate XP gain, level-up, retroactive calculation, and guest migration
  4. App performs smoothly with 100+ weeks of historical data during XP recalculation
  5. XP system works on low-end mobile devices (iPhone SE, Android emulator)
  6. Firebase read/write operations stay within free tier limits (batched updates, debouncing)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 4 → 5 → 6 → 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Health Bar Color Foundation | v1.0 | 1/1 | Complete | 2026-02-25 |
| 2. Expandable Timeline & Summaries | v1.0 | 5/5 | Complete | 2026-02-25 |
| 3. Trend Indicators & Comparisons | v1.0 | 2/2 | Complete | 2026-02-25 |
| 4. Foundation | v1.1 | 1/2 | In progress | - |
| 5. Data Layer | v1.1 | 0/2 | Not started | - |
| 6. UI & Celebrations | v1.1 | 0/2 | Not started | - |
| 7. Integration & Polish | v1.1 | 0/2 | Not started | - |
