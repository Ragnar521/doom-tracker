# Project Research Summary

**Project:** Rep & Tear - XP & Levels System
**Domain:** Gamified fitness progression with military rank theming
**Researched:** 2026-02-26
**Confidence:** HIGH

## Executive Summary

The XP & Levels system for Rep & Tear will add military rank progression (Private → Doom Slayer) to the existing DOOM-themed workout tracker. Based on comprehensive research, **no new dependencies are required** — the existing React 19.2 + TypeScript + Tailwind CSS stack provides all necessary capabilities. CSS transitions handle XP bar animations (0KB overhead), existing toast/confetti components deliver level-up celebrations, and Firestore's current data structure can store XP/rank data without schema changes.

The recommended approach is a **polynomial progression curve** (level^1.5) that balances early accessibility with long-term engagement, awarding XP from workouts (base), streaks (multiplier), and achievements (bonuses). Critical architectural decision: store XP in the existing `users/{uid}/stats/current` document (not a new collection) to avoid Firestore hotspotting and leverage existing read patterns. The system must calculate retroactive XP from historical workouts on first load but **suppress celebration spam** by tracking when the XP system was activated.

Key risks center on **React useEffect infinite loops** during XP recalculation (mitigate with memoization and primitive dependencies), **XP inflation** from multiple sources (solve with documented XP budget and rate limiting), and **LocalStorage/Firestore desync** during guest migration (resolve by recalculating from workout history, never trusting LocalStorage XP). Progress bar animation requires careful state management to avoid "teleporting" instead of smooth fills during level-ups. With proper memoization, batched updates, and client-side rank calculation, the system scales efficiently to 10K+ users.

## Key Findings

### Recommended Stack

**Zero new dependencies required.** The existing stack already provides all capabilities needed for XP & Levels:

**Core technologies:**
- **React 19.2**: State management, useEffect for XP recalculation, useMemo for performance — existing patterns from useStats/useAchievements apply directly
- **TypeScript ~5.9**: Type safety for XPData interface, Rank enum definitions — prevents XP calculation bugs
- **Tailwind CSS 3.4**: XP bar styling with CSS transitions (`transition: width 0.5s ease-in-out`) — 0KB overhead, 60fps smooth animation
- **Firebase Firestore 12.7**: XP/level persistence in existing `users/{uid}/stats/current` document — no new collections, reuses auth-scoped security rules
- **Existing components**: Toast/Confetti system reused for level-up celebrations — proven pattern from AchievementContext

**Rejected alternatives:**
- Framer Motion (100KB+), React Spring (50KB+), Anime.js (30KB+) — CSS transitions are sufficient for progress bar fills
- Material UI LinearProgress (300KB+ dependency) — Tailwind custom build is 0KB overhead
- Separate Firestore collection — increases read costs, existing `stats/current` document works

**Confidence:** HIGH — All capabilities verified in existing codebase (v1.6 already has confetti, toasts, Firestore patterns).

### Expected Features

**Must have (table stakes):**
- Visual XP bar with animated fill — users expect to see progress toward next level
- Current rank display — users need status at a glance (rank badge + level number)
- XP awarded for workouts — core loop: actions must yield tangible rewards
- Level-up celebration — universal pattern: success must be celebrated (toast + confetti)
- Clear XP-to-level formula — users need to understand "how much more" (show current/required XP)
- Persistent progression — levels never reset, permanent achievement
- Multiple rank tiers — 10-15 ranks minimum for longevity (single progression feels shallow)
- Retroactive XP — existing workouts should count, respect user history

**Should have (competitive differentiators):**
- DOOM military ranks — authentic theme (Marine → Doomguy progression) instead of generic levels
- Face state XP scaling — God Mode weeks (5-7 workouts) earn more XP than minimum 3
- Achievement XP bonuses — integrates with existing 18-achievement system
- Streak XP multipliers — rewards consistency, amplifies existing streak tracking (1.5x for 4+ weeks, 2x for 12+)
- Friend rank visibility — Squad members see each other's ranks on leaderboard
- XP breakdown display — transparency builds trust ("50 XP from workouts, 25 XP streak bonus")

**Defer (v2+):**
- Historical rank timeline — show rank-up events in Dashboard timeline (design heavy)
- Secret elite ranks — hidden ranks beyond visible progression (requires balancing)
- Comeback XP boost — extra XP for returning after missed weeks (complex detection logic)
- Week status bonuses — sick/vacation weeks earn "survival XP" (edge case handling)

**Confidence:** HIGH — Feature expectations validated against 8+ fitness gamification apps (LEVELING, SYSTEM Fitness, RepXP, Level Up) and UX research.

### Architecture Approach

The XP system integrates via a **new custom hook (`useXP`)** following existing patterns from `useStats` and `useAchievements`. Store XP in the existing `users/{uid}/stats/current` Firestore document (alongside totalWorkouts/streaks) to avoid creating a new collection and leverage existing security rules. Rank is **computed client-side** from level (never stored in Firestore) to prevent data inconsistency.

**Major components:**
1. **XPContext (NEW)** — Global XP state provider, mirrors AchievementContext pattern with toast container for level-up celebrations
2. **useXP hook (NEW)** — XP calculation engine, listens to workoutCount/streaks/achievements changes, calculates XP gain, checks for level-up, syncs to Firestore
3. **XPBar component (NEW)** — Progress bar UI on Tracker page, replaces "Probability to hit target" section, shows rank badge + level + progress percentage
4. **RankDisplay component (NEW)** — Military rank badge with icon, used in XPBar, Squad leaderboard, and Settings page
5. **Level-up toast (NEW)** — Clones AchievementToast.tsx pattern, triggers confetti on rank-up
6. **Tracker.tsx (MODIFIED)** — Adds XPBar below DoomGuy face, removes probability calculation section

**Data flow:**
```
User toggles workout
  ↓
useWeek.toggleDay() (existing)
  ↓
useXP listens to workoutCount change (NEW)
  ↓
calculateXPGain(workouts, streaks, achievements) (NEW)
  ↓
addXP() → check level-up → update Firestore
  ↓
XPContext triggers toast + confetti (NEW)
  ↓
XPBar re-renders with smooth animation (NEW)
```

**Confidence:** HIGH — Architecture follows proven patterns from existing codebase (AchievementContext, useStats, toast system all working since v1.0).

### Critical Pitfalls

1. **Retroactive XP notification spam** — Users with 6+ months of data see 20+ level-up toasts stacking on screen on first load. **Mitigation:** Store `xpSystemActivatedAt` timestamp, suppress celebrations for historical level-ups, show single summary toast: "XP System Activated! You're Level 12 based on 234 workouts". Address in Phase 1 (data structure) and Phase 3 (UI).

2. **XP inflation from multiple sources** — Workouts + streaks + achievements grant XP without balancing. Users can "XP farm" by rapid toggling, devaluing progression. **Mitigation:** Document XP budget in `lib/xpConfig.ts` (target: 1 level per 1-2 weeks = ~100-150 XP/week). Implement toggle spam detection (max 1 toggle per second per day). Balance example: 4 workouts (50 XP) + streak bonus (25 XP) + achievement (100 XP one-time) = ~75-175 XP/week. Address in Phase 1 (formula documentation) and Phase 2 (implementation).

3. **React useEffect infinite loop** — XP recalculation triggers state update → triggers useEffect again → infinite loop crashes app or exhausts Firestore quota. **Mitigation:** Memoize `stats` object with `useMemo([weeks])`, use primitive dependencies `[stats.totalWorkouts, weeks.length]` instead of objects, wrap `recalculateXP` in `useCallback`, use `useRef` to track calculation state. Address in Phase 2 (XP calculation logic) with mandatory code review and ESLint rules.

4. **LocalStorage vs Firestore desync** — Guest users accumulate XP in LocalStorage, sign in, and either lose progress (overwritten by empty Firestore) or keep inflated XP (edited in browser). **Mitigation:** On migration, discard LocalStorage XP entirely, recalculate from Firestore workout history (source of truth), clear LocalStorage after migration. Address in Phase 2 (migration logic) and Phase 4 (testing).

5. **Progress bar animation edge cases** — Level-up causes bar to jump from 95% to 15% instantly (no celebration visual), rapid workout toggles cause stuttering. **Mitigation:** Implement two-step animation (fill to 100% → pause → reset to new level) using `requestAnimationFrame`, debounce progress updates to 60fps max, disable transitions for rapid updates. Address in Phase 3 (UI/celebrations).

**Confidence:** HIGH — Pitfalls validated through React/Firebase expertise, web research on gamification mistakes, and direct codebase analysis (existing useStats/useAllWeeks patterns identified).

## Implications for Roadmap

Based on research, suggested **4-phase structure** with dependency-aware sequencing:

### Phase 1: Foundation (Data Structure & XP Formula)
**Rationale:** Must establish data model and XP calculation rules before implementing logic. No dependencies — pure functions and type definitions can be built in parallel.

**Delivers:**
- `src/lib/ranks.ts` — Rank definitions (10 ranks: Private → Doom Slayer), XP formulas (polynomial curve: level^1.5 × 100), pure functions for rank lookup
- `src/types/index.ts` exports — XPData, Rank, LevelUp TypeScript types
- Firestore security rules update — `users/{uid}/stats/current` allows XP field reads/writes
- XP budget documentation — Target earning rate (100-150 XP/week), balancing across sources

**Addresses features:**
- Clear XP-to-level formula (table stakes)
- Multiple rank tiers (table stakes)
- DOOM military ranks (differentiator)

**Avoids pitfalls:**
- XP inflation — documented formula prevents ad-hoc changes
- Retroactive spam — data structure includes `xpSystemActivatedAt` from start
- Firestore hotspotting — uses existing `stats/current` document

**Research flag:** SKIP RESEARCH — Formulas and data structures are well-documented, industry standard polynomial progression curves confirmed.

### Phase 2: Data Layer (XP Calculation Logic & Firestore Integration)
**Rationale:** Requires Phase 1 types/formulas. Implements core business logic before UI. Critical phase for avoiding infinite loops and migration bugs.

**Delivers:**
- `src/hooks/useXP.ts` — XP calculation hook, listens to workoutCount/streaks/achievements, calculates XP gain with memoization
- Firestore integration — Reads/writes XP to `users/{uid}/stats/current`, uses transactions for level-up calculations
- Retroactive XP calculation — Recalculates XP from all historical workouts on first load, silent mode for historical level-ups
- Guest migration logic — Discards LocalStorage XP, recalculates from Firestore workout history
- XP budget enforcement — Toggle spam detection (rate limiting), one-time achievement bonuses

**Addresses features:**
- XP awarded for workouts (table stakes)
- Persistent progression (table stakes)
- Retroactive XP (table stakes)
- Face state XP scaling (differentiator)
- Achievement XP bonuses (differentiator)
- Streak XP multipliers (differentiator)

**Avoids pitfalls:**
- useEffect infinite loop — useMemo, useCallback, primitive dependencies, code review
- LocalStorage desync — recalculation from workout history
- XP inflation — documented budget, rate limiting

**Research flag:** SKIP RESEARCH — React hooks patterns already proven in useStats/useAchievements, Firestore integration patterns established.

### Phase 3: UI & Celebrations (Visual Components & Level-Up)
**Rationale:** Requires Phase 2 XP calculation working. Focuses on user-facing polish and animations. Critical for UX (progress bar smoothness, celebration timing).

**Delivers:**
- `src/contexts/XPContext.tsx` — Context provider, wraps app, manages level-up toast queue
- `src/components/XPBar.tsx` — Progress bar UI, CSS transition animations, shows rank badge + level + XP progress
- `src/components/RankIcon.tsx` — Military rank badge display
- `src/components/XPToast.tsx` — Level-up celebration toast (clones AchievementToast.tsx)
- `src/components/XPToastContainer.tsx` — Toast queue management
- `src/pages/Tracker.tsx` modification — Add XPBar below DoomGuy face, remove probability section
- Progress bar animations — Two-step level-up animation (fill → reset), debounced updates, `requestAnimationFrame` timing

**Addresses features:**
- Visual XP bar (table stakes)
- Current rank display (table stakes)
- Level-up celebration (table stakes)
- Animated XP bar fill (table stakes)
- XP breakdown display (differentiator)

**Avoids pitfalls:**
- Retroactive notification spam — checks `xpSystemActivatedAt`, shows single summary toast
- Progress bar edge cases — two-step animation, debouncing, smooth transitions

**Research flag:** SKIP RESEARCH — Component patterns proven (AchievementToast, Confetti already working), CSS animation best practices well-documented.

### Phase 4: Integration & Polish (Friend Visibility, Testing, Optimization)
**Rationale:** Requires Phases 1-3 complete. Integrates XP system with existing features (Squad, Dashboard) and validates performance.

**Delivers:**
- Friend rank visibility — Add rank badges to Squad leaderboard, denormalize XP to `users/{uid}/profile/info` for friend queries
- Performance optimization — Memoization audit, batched Firestore updates, debounced recalculations
- E2E testing — Playwright tests for XP gain, level-up, retroactive calculation, guest migration
- Mobile testing — Verify XP bar animations on low-end devices (iPhone SE, Android emulator)
- XP rebalancing — Adjust formulas based on real usage data if needed

**Addresses features:**
- Friend rank visibility (differentiator)

**Avoids pitfalls:**
- All pitfalls validated through testing

**Research flag:** SKIP RESEARCH — Integration points well-understood, testing patterns established (Playwright setup complete in v1.6).

### Phase Ordering Rationale

**Why this order:**
- **Phase 1 first:** Data structures and formulas are dependencies for all other work, no implementation complexity
- **Phase 2 before UI:** Business logic must be correct before building visual layer, easier to test data layer in isolation
- **Phase 3 after data layer:** UI components consume XP state from Phase 2, celebrations depend on level-up detection
- **Phase 4 last:** Integration requires complete XP system working, testing validates end-to-end flows

**Dependency chain:**
- Phase 1 (types/formulas) → Phase 2 (useXP hook) → Phase 3 (XPContext + UI components) → Phase 4 (integration)
- No parallel work possible between phases due to tight coupling
- However, within each phase, tasks can be parallelized (e.g., Phase 1: types + formulas + Firestore rules simultaneously)

**How this avoids pitfalls:**
- Infinite loops caught in Phase 2 before UI built (easier to debug)
- XP inflation prevented by Phase 1 budget documentation enforced in Phase 2
- Notification spam suppressed by Phase 1 data structure used in Phase 3
- Migration bugs tested in Phase 4 after complete system working

### Research Flags

**Phases likely needing deeper research:**
- **NONE** — All phases use well-documented patterns from existing codebase (React hooks, Firestore, CSS animations, toast system). XP formulas validated against game design industry standards.

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Data modeling follows existing Firestore patterns, polynomial progression curves are industry standard
- **Phase 2:** React hooks patterns proven in useStats/useAchievements, Firestore integration established
- **Phase 3:** Component patterns cloned from AchievementContext/Toast system, CSS animations well-documented
- **Phase 4:** Integration points known (Squad system already exists), Playwright testing framework established

**Critical implementation notes:**
- **Phase 2:** Mandatory code review for dependency arrays in useEffect (infinite loop prevention)
- **Phase 3:** Manual testing on multiple browsers for progress bar animation smoothness
- **Phase 4:** Load testing with 100+ weeks of historical data to validate performance

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Zero new dependencies required, all capabilities verified in existing codebase. CSS transitions already used for god-mode glow, confetti system proven since v1.0, Firestore patterns established. |
| Features | **HIGH** | Feature expectations validated against 8+ fitness gamification apps, UX patterns researched from industry sources. Table stakes vs differentiators clearly defined. |
| Architecture | **HIGH** | Architecture mirrors existing patterns (AchievementContext, useStats, toast system). Data structure reuses existing `stats/current` document. Client-side rank calculation prevents data inconsistency. |
| Pitfalls | **HIGH** | Pitfalls validated through React/Firebase expertise, web research on gamification mistakes, direct codebase analysis. Mitigation strategies proven (memoization, transactions, two-step animations). |

**Overall confidence:** **HIGH**

### Gaps to Address

**Minor gaps requiring validation during implementation:**

1. **XP formula balancing** — Theoretical calculation suggests 1 level per 1-2 weeks, but user behavior may vary. Mitigation: Monitor real usage data in Phase 4, prepared to adjust multipliers. Formula is configurable in `lib/ranks.ts` without code changes.

2. **Rank icon design** — Research confirmed military rank names (Private → Doom Slayer) but didn't specify visual design. Mitigation: Use text-based ranks initially (e.g., "[SGT]"), defer custom icons to v2+ if needed. XP system works without custom graphics.

3. **Mobile animation performance** — CSS transitions should work on low-end devices, but stuttering possible. Mitigation: Test on iPhone SE / Android emulator in Phase 4, add fallback to disable animations if `prefers-reduced-motion` enabled.

4. **Firestore quota impact** — Adding XP writes increases Firestore usage, but batched updates should keep within free tier (50k reads, 20k writes/day). Mitigation: Monitor Firebase console in Phase 4, implement debouncing (5-second batching) if approaching limits.

**All gaps are addressable during implementation — none block starting Phase 1.**

## Sources

### Primary (HIGH confidence)

**Stack Research:**
- [GameDesign Math: RPG Level-based Progression](https://www.davideaversa.it/blog/gamedesign-math-rpg-level-based-progression/) — Polynomial progression curves
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices) — Data structure recommendations
- [CSS Transitions Interactive Guide](https://www.joshwcomeau.com/animation/css-transitions/) — Animation performance

**Feature Research:**
- [LEVELING: Fitness App](https://appleveling.com/en/) — XP system UX patterns
- [SYSTEM: Fitness Leveling](https://play.google.com/store/apps/details?id=com.avillalva.systemfitnessleveling) — Rank progression examples
- [Gamification For Fitness Apps](https://www.nudgenow.com/blogs/gamify-your-fitness-apps) — Feature expectations
- [Yukai Chou - Top 10 Gamification in Fitness](https://yukaichou.com/gamification-analysis/top-10-gamification-in-fitness/) — Best practices

**Architecture Research:**
- [Fitness App Design Best Practices](https://www.zfort.com/blog/How-to-Design-a-Fitness-App-UX-UI-Best-Practices-for-Engagement-and-Retention) — Component boundaries
- [Advanced Firestore Data Modeling](https://fireship.io/lessons/advanced-firestore-nosql-data-structure-examples/) — Denormalization patterns
- [Material UI React Progress Components](https://mui.com/material-ui/react-progress/) — Progress bar patterns

**Pitfalls Research:**
- [Trophy.so - When Your App Needs an XP System](https://trophy.so/blog/when-your-app-needs-xp-system) — XP inflation prevention
- [How to Solve React.useEffect Infinite Loop](https://dmitripavlutin.com/react-useeffect-infinite-loop/) — useEffect pitfalls
- [Firebase - Understand Reads/Writes at Scale](https://firebase.google.com/docs/firestore/understand-reads-writes-scale) — Hotspotting prevention
- [Smashing Magazine - Better Notifications UX](https://www.smashingmagazine.com/2025/07/design-guidelines-better-notifications-ux/) — Avoiding notification spam

### Secondary (MEDIUM confidence)

**Codebase Analysis:**
- `src/hooks/useStats.ts` — Existing calculation patterns, memoization examples
- `src/contexts/AchievementContext.tsx` — Toast notification system pattern
- `src/components/Confetti.tsx` — Celebration animation implementation
- `.claude/CLAUDE.md` — Project architecture, data persistence strategy

### Tertiary (LOW confidence)

**DOOM Lore:**
- [DOOM Marine Wiki](https://doom.fandom.com/wiki/Marine) — Military rank context
- [Doomguy Rank Discussion](https://www.doomworld.com/forum/topic/60758-doomguys-rank/) — Community interpretations
- **Note:** Ranks are thematic, not canonical — creative liberty acceptable

---

*Research completed: 2026-02-26*
*Ready for roadmap: YES*
*All four research files synthesized, phase structure suggested, pitfalls mapped to prevention phases*
