# Pitfalls Research: XP & Level System for Fitness Tracker

**Domain:** Adding XP/Level progression to existing DOOM-themed workout tracker
**Researched:** 2026-02-26
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Retroactive XP Calculation Notification Spam

**What goes wrong:**
When implementing XP for existing users with workout history, the system calculates all historical XP on first load. Users who have months or years of data suddenly receive dozens of level-up notifications simultaneously, creating a jarring and frustrating experience.

**Why it happens:**
Developers calculate retroactive XP correctly but fail to suppress celebration UI for historical achievements. The notification system treats each level-up as a fresh event, even though they all occurred in the past from the XP calculation logic's perspective.

**How to avoid:**
- Implement a "silent mode" flag for XP calculation during initial migration/calculation
- Only show celebrations for NEW levels gained after the system is implemented
- Store a `xpSystemActivatedAt` timestamp in user profile
- Suppress notifications/confetti for level-ups that theoretically occurred before this timestamp
- Consider showing a single summary toast: "XP System Activated! You're now Level 12 based on your 234 workouts"

**Warning signs:**
- Multiple achievement toasts stacking on screen during development
- Test users reporting "too many popups" on first login after XP implementation
- Confetti animations overlapping or causing performance degradation

**Phase to address:**
Phase 1 (Data Structure) - Must design the data model to include `xpSystemActivatedAt` from the start. Phase 3 (Level-Up Celebrations) must check this field before triggering UI.

---

### Pitfall 2: XP Inflation from Multiple Sources

**What goes wrong:**
Users gain XP from workouts, streaks, AND achievements. Without careful balancing, certain activities become "XP farms" where users can rapidly gain levels through grinding low-effort actions, devaluing the entire progression system.

**Why it happens:**
Each feature team (workouts, streaks, achievements) assigns XP values independently without considering the total earning rate. Adding new XP opportunities later reduces existing rewards proportionally, but developers forget this step.

**How to avoid:**
- Set a target total earning rate (e.g., "active user should gain ~1 level per 2 weeks")
- Calculate XP per source based on total budget: `XP_BUDGET = TARGET_XP_PER_WEEK`
- Document XP formula clearly: "100 XP per level, target = 150 XP/week → 1.5 weeks per level"
- When adding new XP sources, reduce existing awards proportionally
- Avoid endless-repeat actions (e.g., toggling workouts on/off shouldn't farm XP)
- Example balance:
  - Workout toggle: +5 XP (max 7 per week = 35 XP)
  - Weekly streak bonus: +50 XP (only on week completion)
  - Achievement unlock: +20-100 XP (one-time only)
  - Total possible: ~85-185 XP per week (1-2 levels)

**Warning signs:**
- Test users gaining multiple levels per day
- Users "gaming" the system by toggling workouts repeatedly
- Long-term users feeling progression is too fast/too slow compared to new users
- Internal playtesting shows levels 1-5 taking minutes instead of weeks

**Phase to address:**
Phase 1 (Data Structure) - Define XP formula and document it. Phase 2 (XP Calculation Logic) - Implement safeguards against XP farming (toggle spam detection, one-time bonuses).

---

### Pitfall 3: React useEffect Infinite Loop During XP Recalculation

**What goes wrong:**
XP recalculation triggers a state update, which triggers useEffect again, which recalculates XP, which updates state... infinite loop crashes the app or burns through Firestore read quota.

**Why it happens:**
Objects/arrays in useEffect dependency array use reference equality. When `stats` or `weeks` objects are recreated (even with same values), React sees them as "changed" and re-runs the effect. This is especially problematic when combining `useStats`, `useAllWeeks`, and a new `useXP` hook that all depend on each other.

**How to avoid:**
- **Memoize objects with useMemo:** Wrap `stats` calculation in `useMemo([weeks])` to maintain stable reference
- **Use primitive dependencies:** Instead of `[stats, weeks]`, use `[stats.totalWorkouts, weeks.length]`
- **Empty dependency array for one-time calculation:** Use `useEffect(() => { calculateXP(); }, [])` with manual refresh triggers
- **useCallback for functions:** Memoize `recalculateXP` function with `useCallback` to prevent re-creation
- **useRef for tracking:** Use `const isCalculating = useRef(false)` to prevent concurrent calculations
- Rep & Tear specific: `useStats` already has `recalculateStats` - XP calculation should piggyback on this, not create a separate effect loop

**Warning signs:**
- Browser tab freezes during development
- Firestore console shows thousands of reads per second
- React DevTools profiler shows useEffect running 100+ times
- Console error: "Maximum update depth exceeded"

**Phase to address:**
Phase 2 (XP Calculation Logic) - Critical to get dependency array and memoization correct from the start. Add linter rules to catch missing dependencies.

---

### Pitfall 4: LocalStorage vs Firestore XP Desync (Guest to Authenticated Migration)

**What goes wrong:**
Guest users accumulate XP in LocalStorage, then sign in and expect their progress to persist. However, the system either:
- Overwrites LocalStorage XP with empty Firestore data (losing guest progress)
- Keeps LocalStorage XP but doesn't sync to Firestore (future logins lose data)
- Syncs XP but not the underlying workout data used to calculate it (XP values don't match reality)

**Why it happens:**
Rep & Tear already has this pattern for workouts/stats, but XP adds complexity because it's *derived* from workouts. The migration must:
1. Migrate workout history (already handled)
2. Recalculate XP from migrated workouts (new requirement)
3. Handle edge case where guest XP > recalculated XP (user might have gamed the system)

LocalStorage doesn't provide atomic operations or conflict resolution. If a user has the app open on two devices (one offline, one online), they can desync their XP state.

**How to avoid:**
- **On sign-in migration:**
  1. Migrate all workout data from LocalStorage to Firestore (existing logic)
  2. DISCARD LocalStorage XP value entirely
  3. Trigger `recalculateXP()` from Firestore workout history (source of truth)
  4. Clear LocalStorage XP after successful migration
- **Conflict resolution:** Last-write-wins for Firestore (default behavior is acceptable for fitness tracker)
- **Atomic updates:** Use Firestore transactions for XP updates if implementing competitive features later
- **Document the limitation:** Guest users who switch devices lose progress (encourage early sign-in)

**Warning signs:**
- Test scenario: Guest user → sign in → XP resets to 0
- Test scenario: Guest user → sign in → XP is higher than possible from workout count
- User reports: "Lost my progress when I logged in"
- Firestore security rules violations (trying to write XP without authentication)

**Phase to address:**
Phase 1 (Data Structure) - Plan migration strategy. Phase 2 (XP Calculation Logic) - Implement recalculation on migration. Test thoroughly in Phase 4 (Testing & Polish).

---

### Pitfall 5: Hotspotting on Firestore User Document During High-Traffic Level-Ups

**What goes wrong:**
If all XP data is stored in a single user document (e.g., `users/{uid}/profile`), and multiple workouts/achievements update XP rapidly, Firestore experiences "hotspotting" - high write contention on a single document causing latency spikes or errors.

**Why it happens:**
Firestore can handle sustained writes to a single document at ~1 write per second. Rep & Tear is unlikely to hit this (workout tracking is manual, not automated), but the risk exists if implementing:
- Real-time friend XP updates (friend completes workout → your UI updates)
- Rapid achievement unlocks (unlocking 5 achievements in 2 seconds)
- Background recalculation on app focus (multiple tabs open)

**How to avoid:**
- **Separate XP document:** Store XP in `users/{uid}/stats/xp` instead of main profile doc
- **Use existing stats document:** Rep & Tear already has `users/{uid}/stats/current` for totalWorkouts/streaks - add XP fields here (efficient)
- **Batch updates:** When multiple achievements unlock, batch all XP updates into one Firestore write
- **Optimistic UI:** Update XP in state immediately, sync to Firestore in background
- **Debounce recalculation:** Don't recalculate XP on every workout toggle - debounce 500ms or trigger on week completion

**Warning signs:**
- Firestore console shows latency spikes (>200ms) on user document writes
- Error logs: "Too many concurrent modifications"
- XP bar animation stutters during rapid workout toggles
- Friends' XP updates lag by several seconds in real-time view

**Phase to address:**
Phase 1 (Data Structure) - Store XP in `users/{uid}/stats/current` alongside existing stats. Phase 2 (XP Calculation Logic) - Implement batching and debouncing.

---

### Pitfall 6: Progress Bar Animation Edge Cases (0→100% Jump, Rapid Updates)

**What goes wrong:**
XP progress bar animations break in edge cases:
- User levels up: Bar should fill to 100%, celebrate, then reset to new level's progress (e.g., 15%)
- Instead: Bar jumps from 95% back to 15% instantly (no celebration visual)
- Rapid updates: Toggling workouts quickly causes bar to "skip" intermediate values or freeze
- Parent component updates XP too fast (30+ times per second) → animation doesn't complete

**Why it happens:**
CSS transitions need a "change of values" to trigger. If you update `width` from 95% to 15% in a single render, there's no intermediate state, so the browser skips the animation. React batch updates can also cause the bar to only render the final value.

**How to avoid:**
- **Two-step animation for level-up:**
  1. Animate to 100%: `setProgress(100)` + wait for animation (200ms)
  2. Reset to new level: `setProgress(currentXP / nextLevelXP * 100)`
  3. Use `requestAnimationFrame` to ensure browser paints intermediate state
- **Disable transition for rapid updates:**
  ```css
  .xp-bar-fast { transition: none; } /* for >30 updates/sec */
  ```
- **Debounce updates:** Don't update progress bar on every XP change - throttle to 60fps max
- **Loading state:** If recalculating XP, show loading skeleton instead of jumpy bar
- **Minimum animation duration:** Set `transition: width 200ms` to ensure visible change

**Warning signs:**
- Progress bar teleports instead of animates
- Level-up celebration triggers but bar is already at new level (no 0→100% visual)
- Bar "stutters" during rapid workout toggles
- Browser DevTools performance profiler shows layout thrashing

**Phase to address:**
Phase 3 (Level-Up Celebrations & UI) - Critical for UX. Requires careful state management and animation timing.

---

### Pitfall 7: Unclear Rank Progression (Military Ranks Without XP Context)

**What goes wrong:**
Users see "Rank: Sergeant" but don't understand:
- How many XP to next rank?
- What rank comes next?
- How does rank relate to level number?
- Do ranks ever reset or are they permanent?

This leads to confusion and reduced engagement - the gamification feels arbitrary instead of motivating.

**Why it happens:**
Developers focus on technical implementation (XP calculation) and forget to surface progression context in the UI. DOOM military ranks are thematic but unfamiliar to users who don't know the hierarchy (Marine → Private → Sergeant → Lieutenant → Captain → Doomguy).

**How to avoid:**
- **Always show rank + level number:** "Sergeant (Level 12)" not just "Sergeant"
- **Show XP to next rank:** "650 / 1000 XP to Lieutenant"
- **Show rank hierarchy:** Tooltip or Settings page listing all ranks
- **Visual feedback:** Progress bar fills smoothly, celebrations on rank-up
- **Contextual hints:** "Complete 3 more workouts to reach Lieutenant!" (translate XP to actions)
- **Persistent visibility:** XP bar always visible on Tracker page (don't hide in submenu)

**Warning signs:**
- Test users ask "What's after Sergeant?"
- Users don't notice they ranked up
- Confusion between "Level 12" and "Rank 5" (different numbering systems)
- Low engagement with XP system compared to existing achievement system

**Phase to address:**
Phase 3 (Level-Up Celebrations & UI) - Design XP bar, rank display, and progression hints. Phase 4 (Testing & Polish) - Usability testing with real users.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing XP in LocalStorage only (no Firestore field) | Faster development, no schema changes | XP doesn't sync across devices, lost on browser cache clear | Never - defeats purpose of cloud sync |
| Hardcoding XP values in component (no config file) | Quick to implement | Impossible to rebalance without code changes, no A/B testing | Never - use `lib/xpConfig.ts` |
| Skipping retroactive XP calculation (new users only) | Avoids migration complexity | Existing users revolt, feel punished for early adoption | Never - existing users are most valuable |
| Using `totalWorkouts * 10` instead of XP events | Simple calculation, no new data storage | Can't reward streaks/achievements differently, can't rebalance | Only for MVP proof-of-concept |
| Single global XP pool (no separation by activity type) | One progress bar, simple UX | Can't add per-activity XP bars later (workout XP vs social XP) | Acceptable for v1 - Rep & Tear is focused on workouts only |
| No XP decay / level down | Users never lose progress, always motivating | No mechanism to re-engage lapsed users | Acceptable - fitness trackers rarely punish users for breaks |

## Integration Gotchas

Common mistakes when connecting XP system to existing features.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Achievement System | Unlocking achievement grants XP, but achievement condition already checks stats that grant XP → double-dipping XP | Award XP for achievement unlock only, NOT for the actions leading to it |
| Streak Calculation | XP granted on every workout toggle, but streak bonus also grants XP at week end → double-counting | Grant workout XP immediately, streak bonus XP only once per week on status = 'success' |
| Friend System (Squad) | Showing friend XP requires reading `users/{friendUid}/stats/xp` → N+1 query problem | Denormalize: Store `currentXP` and `level` in `users/{uid}/profile/info` (same doc as friendCode) |
| Week Status (SICK/VACATION) | User marks week as SICK → should past weeks lose XP? | XP is permanent once earned. Week status affects future XP eligibility, not past XP |
| Guest Mode Migration | Migrating workout data but not recalculating XP → guest XP overwrites correct value | On migration: discard LocalStorage XP, recalculate from migrated Firestore workouts |
| Offline Mode | User completes workout offline → gains XP → goes online → XP syncs → gains XP again | Use idempotent XP events with unique IDs: `{eventId: 'workout-2026-W08-Mon', xp: 5}` |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Recalculating XP on every render | Browser lag, high CPU usage, Firestore quota exhaustion | Use `useMemo` for XP calculation, only recalculate when `weeks` data changes | 10+ weeks of data (100+ reads per page load) |
| Reading all user documents to display friend leaderboard | Firestore quota exhaustion, slow page load | Denormalize XP to profile doc, read only N friends (not entire collection) | 50+ friends (50+ reads per leaderboard view) |
| Animating every +1 XP change | Progress bar thrashing, animation stutter | Batch XP updates, animate only on significant milestones (every 10 XP or level-up) | Rapid workout toggles (10+ per second) |
| Storing XP history in array field (all XP events ever) | Document size limit (1MB), slow reads, expensive queries | Store only current XP and level, archive history to separate collection if needed | 1000+ XP events (~50KB document, slower reads) |
| Real-time XP sync for all friends | Firestore realtime listener costs (reads on every friend's XP change) | Use snapshot listeners with 5-minute cache, or only sync on manual refresh | 100+ friends × 10 workouts/week = 1000+ realtime updates/week |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Allowing client to set XP value directly | XP hacking - users can set XP to 999999 via browser console | Firestore rules: `allow write: if request.resource.data.xp == resource.data.xp + validXpGain()` (impossible in practice - calculate server-side instead) |
| Trusting LocalStorage XP on migration | Guest user edits LocalStorage → inflates XP → signs in → keeps inflated XP | On migration: recalculate XP from workout history, ignore LocalStorage XP value |
| Exposing XP calculation formula in client code | Users reverse-engineer and game the system | Acceptable risk - Rep & Tear is single-player, no competitive advantage. Prioritize UX over security. |
| No rate limiting on XP-granting actions | User scripts to auto-toggle workouts 1000 times/second | Firestore security rules: `allow write: if request.time > resource.data.lastUpdate + duration.value(1, 's')` |
| Leaking other users' XP in API responses | Privacy concern - users may not want to share progress | Firestore rules already allow authenticated read of all user profiles (for Squad feature) - XP is public data by design |

## UX Pitfalls

Common user experience mistakes in XP/level systems.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Level-up notification spam on first load | Users with 6 months of data see 20+ level-up toasts stacking on screen → close app in frustration | Silent retroactive calculation, single summary toast: "XP System Activated! You're Level 12" |
| No indication of XP source | Users gain XP but don't know why → feels random, not motivating | Toast message: "+5 XP - Workout completed!" with icon of XP source |
| Progress bar doesn't show XP-to-next-level | Users see "Level 5" but no sense of progression within level | Always show progress bar: "450 / 500 XP to Level 6" |
| Rank names without context | "You're now a Sergeant!" → User: "Is that good? What's next?" | Show rank hierarchy in Settings, tooltip on rank badge: "Rank 3 of 7" |
| Tiny XP gains feel unrewarding | "+1 XP" for workout → users feel progress is too slow | Inflate XP numbers: +10 XP minimum, round numbers (50, 100, 250) for milestones |
| Level-up celebration blocks critical UI | User completes workout → level-up modal covers "Save" button → frustration | Use toast notifications (non-blocking) instead of modals, allow dismiss with X button |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **XP Calculation:** XP values are balanced for reasonable progression pacing (1 level per 1-2 weeks) - verify with 52-week simulation
- [ ] **Guest Migration:** LocalStorage XP migrates to Firestore on sign-in - test "guest user with 100 workouts → sign in → XP matches recalculated value"
- [ ] **Level-Up Celebrations:** Celebration triggers only for NEW level-ups, not retroactive - verify "existing user logs in → no spam"
- [ ] **Progress Bar Animation:** Bar animates smoothly on level-up (0→100→reset) - verify with rapid workout toggles
- [ ] **Firestore Rules:** XP document has write protection against direct client manipulation - verify rules in Firebase console
- [ ] **Offline Support:** XP syncs correctly when user goes offline → online - test with Network tab throttling
- [ ] **Achievement Integration:** Achievement unlocks grant XP without double-counting - verify XP total matches formula
- [ ] **Friend Leaderboard:** Friend XP displays without N+1 queries - check Firestore usage doesn't spike with friend count
- [ ] **Rank Display Context:** Users understand rank progression and next rank requirements - usability test with non-dev users
- [ ] **Mobile Performance:** XP bar animates smoothly on low-end mobile devices - test on iPhone SE or Android emulator

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| XP inflation (users gained too much XP) | MEDIUM | 1. Calculate correct XP from workout history. 2. Run migration script to reset all users' XP. 3. Show toast: "XP rebalanced for fairness". 4. Risk: user backlash if they "lose" levels. |
| Retroactive notification spam shipped | LOW | 1. Hotfix: Add `xpSystemActivatedAt` check to celebration logic. 2. Set timestamp to deployment date for all users. 3. Deploy immediately. |
| Firestore hotspotting on user document | LOW | 1. Create separate `users/{uid}/stats/xp` document. 2. Migration script to copy XP data. 3. Update all XP write logic to target new document. 4. Deploy with rollback plan. |
| Progress bar animation broken | LOW | 1. Add two-step animation with `requestAnimationFrame`. 2. Test on multiple browsers. 3. Fallback: disable animation if browser doesn't support transitions. |
| Guest XP doesn't migrate on sign-in | HIGH | 1. Identify affected users (signed up after XP feature, have LocalStorage data). 2. Backend script to recalculate XP from Firestore workout history. 3. Email affected users: "Your XP has been restored". |
| Infinite loop crashes app | MEDIUM | 1. Emergency rollback to previous version. 2. Fix dependency array and add `useRef` guard. 3. Add unit tests for useEffect dependencies. 4. Redeploy with monitoring. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Retroactive XP notification spam | Phase 1 (Data Structure) | Add `xpSystemActivatedAt` field. Phase 3 checks it before celebration. |
| XP inflation from multiple sources | Phase 1 (Data Structure) | Document XP formula in `lib/xpConfig.ts`. Phase 2 implements it. Playtest in Phase 4. |
| useEffect infinite loop | Phase 2 (XP Calculation Logic) | Code review dependency arrays. Add ESLint rule. Unit test that calculation doesn't loop. |
| LocalStorage vs Firestore desync | Phase 2 (XP Calculation Logic) | Test migration flow: guest user → sign in → XP matches workout history. |
| Firestore hotspotting | Phase 1 (Data Structure) | Store XP in `users/{uid}/stats/current` (existing doc). Monitor Firestore metrics in Phase 4. |
| Progress bar animation edge cases | Phase 3 (Level-Up Celebrations & UI) | Manual test: toggle workouts rapidly, verify smooth animation. Test on mobile Safari. |
| Unclear rank progression | Phase 3 (Level-Up Celebrations & UI) | Usability test with 3 non-dev users. Verify they understand rank hierarchy without explanation. |

## Sources

### Gamification & XP System Design
- [Trophy.so - When Your App Needs an XP System](https://trophy.so/blog/when-your-app-needs-xp-system) - XP inflation prevention, target earning rates
- [Imaginovation - Boost Fitness App Retention with AI, AR & Gamification](https://imaginovation.net/blog/why-fitness-apps-lose-users-ai-ar-gamification-fix/) - Common gamification mistakes in fitness apps
- [Machinations.io - What is Game Economy Inflation?](https://machinations.io/articles/what-is-game-economy-inflation-how-to-foresee-it-and-how-to-overcome-it-in-your-game-design) - Inflation/deflation in progression systems
- [Medium - Designing Game Economies: Inflation, Resource Management, and Balance](https://medium.com/@msahinn21/designing-game-economies-inflation-resource-management-and-balance-fa1e6c894670) - Balancing XP systems
- [Yukai Chou - Top 10 Gamification in Fitness](https://yukaichou.com/gamification-analysis/top-10-gamification-in-fitness/) - Fitness gamification patterns

### UX & Notifications
- [Smashing Magazine - Design Guidelines For Better Notifications UX](https://www.smashingmagazine.com/2025/07/design-guidelines-better-notifications-ux/) - Avoiding notification spam
- [UXCam - Push Notification UX Design: The Ultimate Guide](https://uxcam.com/blog/push-notification-guide/) - Celebration notifications best practices
- [Userpilot - Notification UX: How To Design For A Better Experience](https://userpilot.com/blog/notification-ux/) - Avoiding notification overload

### React Performance
- [Dmitri Pavlutin - How to Solve the Infinite Loop of React.useEffect()](https://dmitripavlutin.com/react-useeffect-infinite-loop/) - useEffect infinite loop prevention
- [LogRocket - How to solve the React useEffect Hook's infinite loop patterns](https://blog.logrocket.com/solve-react-useeffect-hook-infinite-loop-patterns/) - Dependency array pitfalls
- [freeCodeCamp - How to Prevent Infinite Loops When Using useEffect() in ReactJS](https://www.freecodecamp.org/news/prevent-infinite-loops-when-using-useeffect-in-reactjs/) - useMemo and useCallback patterns
- [Syncfusion - Animation in React Progress bar component](https://ej2.syncfusion.com/react/documentation/progress-bar/animation) - Progress bar animation edge cases
- [Material UI - Circular, Linear progress React components](https://mui.com/material-ui/react-progress/) - Performance optimization for progress bars

### Firebase/Firestore
- [Firebase - Best practices for Cloud Firestore](https://firebase.google.com/docs/firestore/best-practices) - Hotspotting prevention, data structure design
- [Firebase - Understand reads and writes at scale](https://firebase.google.com/docs/firestore/understand-reads-writes-scale) - Write contention and performance
- [Fireship.io - Advanced Data Modeling with Firestore by Example](https://fireship.io/lessons/advanced-firestore-nosql-data-structure-examples/) - Data denormalization patterns
- [Firebase - Access data offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline) - Offline sync and conflict resolution
- [Captain Codeman - Local First with Cloud Sync using Firestore](https://www.captaincodeman.com/local-first-with-cloud-sync-using-firestore-and-svelte-5-runes) - LocalStorage vs Firestore sync patterns

### Rep & Tear Codebase Analysis
- `src/hooks/useStats.ts` - Existing stats calculation pattern, recalculation logic
- `src/hooks/useAllWeeks.ts` - Streak calculation logic, useMemo patterns to avoid
- `src/lib/achievements.ts` - Achievement condition checking, XP integration opportunities
- `src/contexts/AchievementContext.tsx` - Notification system for achievement unlocks (pattern to follow for level-ups)
- `.claude/CLAUDE.md` - Project architecture, data persistence strategy (LocalStorage + Firestore)

---

*Pitfalls research for: Adding XP & Level System to Rep & Tear Workout Tracker*
*Researched: 2026-02-26*
*Confidence: HIGH (based on web research + codebase analysis + React/Firebase expertise)*
