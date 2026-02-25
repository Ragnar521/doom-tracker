# Pitfalls Research

**Domain:** Analytics Dashboard for Fitness Tracking Apps (Timeline Views, Trends, Historical Data)
**Researched:** 2026-02-25
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Loading All Historical Data at Once

**What goes wrong:**
Dashboard becomes unusably slow when users have 100+ weeks of data. Initial page load takes 5-10 seconds, causing users to think the app is broken. Mobile devices with limited memory may crash. Firebase read operations spike, potentially exceeding free tier limits (50k reads/day) with just 500 active users.

**Why it happens:**
Developers test with fresh accounts (only 2-4 weeks of data) and don't notice performance issues. The existing `useAllWeeks.ts` hook already loads ALL weeks with `getDocs(query(weeksRef, orderBy('startDate', 'desc')))` — this pattern works fine for 12 weeks but becomes exponentially slower with 200+ weeks.

**How to avoid:**
- Implement lazy loading for timeline expansion — only fetch months/years when user expands them
- Keep the existing 12-week "quick view" loading pattern (already works well)
- For monthly/yearly summaries, create Firestore aggregation documents (e.g., `monthSummaries/2026-01`) instead of client-side calculation
- Use pagination for expanded timeline view (fetch 6 months at a time)
- **Critical:** Add Firebase query limits (`limit(50)`) to prevent runaway queries

**Warning signs:**
- Dashboard loading time > 2 seconds in development
- Network tab shows Firestore reads > 50 documents on page load
- `useAllWeeks.ts` execution time > 500ms (measure with React DevTools Profiler)
- Mobile device heat-up during dashboard load

**Phase to address:**
Phase 1 (Foundation) — Must implement lazy loading architecture from the start. Retrofitting later requires major refactor and risks breaking existing 12-week grid.

---

### Pitfall 2: Inverse Color Logic (Health Bar Direction)

**What goes wrong:**
Users misinterpret their progress because color scheme feels backwards. Traditional traffic lights (green = good, red = bad) conflict with DOOM health bar mechanics (green = full health → drains to red when damaged). Users report feeling demotivated when they see "red" despite hitting goals.

Current implementation in `Dashboard.tsx` uses:
```
5+ workouts → gold (correct, feels rewarding)
4 workouts → green (correct, healthy)
3 workouts → yellow (AMBIGUOUS — goal met but feels like warning)
0-2 workouts → red (correct, critical)
```

**Why it happens:**
Attempting to combine DOOM aesthetics with universal UI conventions. DOOM's health bar drains from green→yellow→red (damage accumulation), but fitness apps typically use green=success. The current yellow-for-minimum-goal creates cognitive dissonance.

**How to avoid:**
- **Recommended:** Full health bar direction (green=100%, yellow=~60%, red=<30%)
  - 5+ workouts → **bright green** (full health, dominant)
  - 4 workouts → **green** (strong health)
  - 3 workouts → **lime/lighter green** (adequate health, GOAL MET clearly)
  - 1-2 workouts → **yellow** (warning, damaged)
  - 0 workouts → **red** (critical, near death)
- Alternative: Keep traffic lights but add visual indicators (icons, borders) to clarify "goal met"
- **Critical:** Never use yellow for "goal achieved" — yellow universally means "warning"

**Warning signs:**
- User feedback mentions "confusing colors"
- Users ask "is 3 workouts good or bad?"
- Color legend requires explanation ("why is my week yellow when I hit my goal?")
- A/B testing shows higher engagement with green-dominant schemes

**Phase to address:**
Phase 1 (Foundation) — Color scheme is foundational to all visualizations. Changing mid-project requires updating multiple components, tests, and user mental models. Must lock this decision early.

---

### Pitfall 3: Client-Side Trend Calculation for Large Datasets

**What goes wrong:**
Trend calculations (comparing current month vs. previous month, calculating rolling averages) become CPU-intensive as history grows. Main thread blocks for 200-500ms while computing trends across 100+ weeks, causing janky UI and scroll stuttering. Battery drain on mobile devices.

Example: Calculating "vs previous period" for 52 weeks requires:
- Grouping weeks into months (12 iterations)
- Computing averages per month (O(n) where n = weeks per month)
- Comparing adjacent periods (12 comparisons)
- Total: ~780 operations for 1 year of data, 7800 for 10 years

**Why it happens:**
Following reactive programming patterns where all computations happen in `useMemo` hooks. While `useMemo` prevents unnecessary recalculations, it doesn't prevent the initial expensive calculation. The existing `useAllWeeks.ts` already shows this pattern at line 86-218 (132 lines of calculation logic).

**How to avoid:**
- **Pre-calculate summaries server-side:** Use Firestore cloud functions to update monthly/yearly aggregates on workout toggle
- **Debounce calculations:** Don't recalculate on every state change — wait 500ms after user stops interacting
- **Incremental updates:** When user adds workout, only recalculate affected month (not entire history)
- **Web Workers:** Move heavy calculations off main thread for multi-year trend analysis
- **Critical for Firebase:** Pre-aggregated documents prevent client-side queries. Example:
  ```
  users/{uid}/summaries/monthly/2026-01 → { totalWorkouts: 15, avgPerWeek: 3.75 }
  users/{uid}/summaries/yearly/2026 → { totalWorkouts: 180, avgPerWeek: 3.46 }
  ```

**Warning signs:**
- React DevTools Profiler shows `useAllWeeks` taking > 100ms to execute
- Dashboard scroll feels choppy (frame rate < 60fps)
- Mobile devices show high CPU usage (> 40% for dashboard)
- Firebase read operations exceed 20 documents for single dashboard load

**Phase to address:**
Phase 1 (Foundation) — Pre-aggregation architecture must be designed before timeline implementation. Migrating from client-side to server-side calculation mid-project requires data migration and dual-read support during transition.

---

### Pitfall 4: Non-Collapsible Timeline on Mobile

**What goes wrong:**
Expanded timeline creates infinite scroll nightmare on mobile. Users with 2+ years of data (104+ weeks) face 30+ screen-heights of vertical scrolling to reach navigation or other features. Accidental touches expand/collapse wrong sections. "Where am I?" disorientation as users lose context while scrolling.

**Why it happens:**
Desktop-first design mindset. Expandable accordions work great on desktop (large screens, precise mouse clicks), but mobile has limited screen real estate and less precise touch targets. The existing `WeekNavigation.tsx` already had to be redesigned for mobile (v1.5) — timeline will face similar issues.

**How to avoid:**
- **Default collapsed:** All months/years start collapsed — user must explicitly expand
- **Collapse-all button:** Single tap to minimize everything when lost
- **Sticky section headers:** Year/month headers stick to top while scrolling (context awareness)
- **Touch targets:** Minimum 44px height for expand/collapse buttons (per iOS Human Interface Guidelines)
- **Smart expansion:** Expanding new section auto-collapses others (prevent infinite scroll)
- **Scroll-to-top button:** Fixed position button when scrolled > 2 screens
- **Deep linking:** URL state tracks expanded sections (can share "2025-January" view)

**Warning signs:**
- QA testing on mobile shows > 10 swipes to navigate full timeline
- Touch target hit rate < 95% (users miss collapse buttons)
- Users report "can't find the navigation"
- Bounce rate increases on mobile after dashboard update

**Phase to address:**
Phase 2 (Timeline Implementation) — Must be designed in parallel with timeline expansion, not as afterthought. Mobile UX patterns are harder to retrofit than to build from scratch.

---

### Pitfall 5: Forgetting Sick/Vacation Weeks in Trend Calculations

**What goes wrong:**
Trend indicators show misleading "down arrows" when user marks weeks as sick/vacation. Example: User averages 4 workouts/week in January, gets sick in February (2 weeks marked sick), does 4 workouts in remaining 2 weeks. Naive calculation shows "February: 2 avg vs January: 4 avg" with RED DOWN ARROW, demotivating user who actually maintained performance.

The existing streak logic in `useStats.ts` (lines 106-109) and `useAllWeeks.ts` (lines 159-163) correctly SKIP sick/vacation weeks, but this pattern must extend to ALL trend calculations.

**Why it happens:**
Inconsistent handling of special week statuses across different statistics. Developers implement new trend features without checking existing streak logic patterns. Copy-pasting calculation code from streak logic but forgetting the status filter.

**How to avoid:**
- **Centralized status filter:** Create utility function `shouldIncludeInStats(week)` that all calculations use
- **Documentation:** Add JSDoc comments explaining sick/vacation exclusion logic
- **Test cases:** Unit tests must include sick/vacation scenarios for EVERY new calculation
- **Visual indicators:** Show "* excluding sick/vacation weeks" note on trend comparisons
- **Consistency audit:** Review all stats calculations before each release

**Warning signs:**
- User feedback: "My trends don't match my actual performance"
- Sick/vacation weeks appear in trend calculation denominators
- Test coverage for status filtering < 100%
- Different calculations show contradictory trends

**Phase to address:**
Phase 1 (Foundation) — Create reusable utility function before implementing any new calculations. Prevents inconsistency from spreading.

---

### Pitfall 6: Color Accessibility Issues (Low Contrast)

**What goes wrong:**
Users with color blindness (8% of males, 0.5% of females) cannot distinguish between red/green weeks in timeline grid. Low-contrast colors fail WCAG AA standards (4.5:1 ratio), making dashboard unusable in bright sunlight on mobile. Older users or those with visual impairments struggle to read small colored squares without additional indicators.

Current color scheme potential issues:
- `doom-red: #b91c1c` vs `bg-gray-900` = 5.2:1 contrast (PASS)
- `doom-green: #22c55e` vs `doom-red: #b91c1c` = indistinguishable for deuteranopia (red-green colorblindness)
- Grid squares at 8px font size (line 98 Dashboard.tsx) are below minimum readable size (12px for body text)

**Why it happens:**
Testing on new monitors in controlled lighting with full color vision. Accessibility is often treated as "nice to have" instead of requirement. Color alone carries meaning without redundant indicators (shape, icon, pattern).

**How to avoid:**
- **Patterns in addition to colors:** Add texture/patterns to grid squares
  - Critical (red): Diagonal stripes
  - Warning (yellow): Dots
  - Success (green): Solid
  - Godmode (gold): Stars/sparkles
- **Contrast checker:** Use WebAIM Contrast Checker during design phase
- **Number labels:** Keep workout count visible in grid (already implemented, line 98)
- **High-contrast mode:** CSS media query `@media (prefers-contrast: high)` with darker colors
- **Colorblind testing:** Use browser DevTools emulation or real user testing

**Warning signs:**
- Contrast ratio calculator shows < 4.5:1 for any color combination
- User reports "can't see the difference between colors"
- Dashboard requires zooming to read on mobile
- Grid squares blend together at arm's length

**Phase to address:**
Phase 1 (Foundation) — Accessibility must be designed in, not bolted on. Retrofitting patterns requires visual design overhaul and potential user confusion ("why did colors change?").

---

### Pitfall 7: No Loading Skeletons During Lazy Load

**What goes wrong:**
User expands a collapsed year, sees blank white space for 1-3 seconds while data loads, assumes app crashed or network failed. Confusion about whether tap registered. Multiple frustrated taps cause race conditions (expanding/collapsing rapidly). Poor perceived performance even when actual load time is acceptable.

Current implementation shows `<LoadingSpinner>` on initial page load (Dashboard.tsx line 39), but no skeleton for progressive loading.

**Why it happens:**
Developers focus on optimizing actual load time but forget perceived performance. Desktop testing with fast WiFi masks mobile 3G/4G latency (500-2000ms). Lazy loading implementation adds loading states as afterthought.

**How to avoid:**
- **Skeleton screens:** Show gray placeholder cards matching final layout during load
- **Optimistic expansion:** Immediately show month header + skeleton weeks when user taps
- **Progressive rendering:** Render weeks as they load (don't wait for full month)
- **Loading states:** Clear visual feedback (spinner + "Loading 2025..." text)
- **Timeout handling:** Show error message if load exceeds 5 seconds
- **Retry mechanism:** "Tap to retry" button on failure

**Warning signs:**
- Blank space appears for > 500ms during expansion
- User testing shows confusion about loading state
- Analytics show high bounce rate (users leave during load)
- Support requests about "app not responding"

**Phase to address:**
Phase 2 (Timeline Implementation) — Must implement alongside lazy loading feature. Loading states are part of the feature definition, not polish.

---

### Pitfall 8: Misaligned Month Boundaries (ISO Week vs Calendar Month)

**What goes wrong:**
Monthly summaries show incorrect totals because ISO weeks (Monday-Sunday) don't align with calendar months. Example: Week 2026-W01 spans Dec 29, 2025 - Jan 4, 2026. Naive grouping by month either:
1. Counts this week in December (wrong — most days in January)
2. Counts this week in January (wrong — started in December)
3. Splits week between months (breaks weekly streaks)

Users see "December 2025: 3 workouts" and "January 2026: 2 workouts" when they actually did 5 workouts in week spanning both months.

**Why it happens:**
Existing codebase uses ISO 8601 week format (`YYYY-Www`) which is Monday-based and year-relative. Developers implement monthly grouping by parsing year/month from week ID without considering overlap. Natural assumption that weeks fit cleanly into months (they don't).

**How to avoid:**
- **Week belongs to month with majority days:** If week spans Nov 29 - Dec 5, it's December (5 days in Dec vs 2 in Nov)
- **ISO 8601 week-year standard:** Use week's Thursday to determine month (Thursday is always in same year/month as majority of week)
- **Document decision:** Add comment explaining boundary logic (prevents future "fixes" that break logic)
- **Test boundary weeks:** Unit tests must include Week 1, Week 52, Week 53 (edge cases)
- **Visual clarification:** Show week date ranges in timeline headers ("Jan 1-7, 2026")

**Warning signs:**
- Monthly totals don't sum to yearly total
- Users report "missing workouts" in monthly view
- Edge weeks (first/last of month) show unexpected month assignment
- December totals inconsistent with year-end review

**Phase to address:**
Phase 1 (Foundation) — Boundary logic must be decided before implementing any month-based grouping. Changing later requires recalculating all monthly summaries and user confusion.

---

### Pitfall 9: Firebase Query Cost Explosion with "Scroll to Load More"

**What goes wrong:**
Implementing "load more weeks" with repeated `getDocs()` queries charges read operations on EVERY document EVERY time query runs. User scrolls through timeline → 50 reads. Scrolls again later same day → another 50 reads (no caching). With 500 active users, free tier (50k reads/day) exhausted in hours. Firebase bill jumps from $0 to $200+/month.

**Why it happens:**
Developers familiar with REST APIs expect browser/CDN caching. Firestore charges per document read regardless of client-side cache. The existing `useAllWeeks.ts` already has this issue (line 38-40) — every Dashboard page load = full read of all weeks. Adding timeline expansion multiplies this problem.

**How to avoid:**
- **Client-side caching:** Store fetched weeks in Context/Redux, only query NEW weeks
- **Firestore cache:** Use `getDocsFromCache()` first, fall back to server only if cache miss
- **Paginate with cursors:** Use `startAfter()` to fetch next batch without re-reading previous
- **Aggregate documents:** Pre-calculate monthly summaries, store as separate docs (1 read vs 4-5 reads for weeks)
- **Batch queries:** Fetch 6 months at once instead of month-by-month
- **Monitor costs:** Set up Firebase billing alerts at $5, $20, $50 thresholds

**Warning signs:**
- Firebase console shows read operations spiking 10x after timeline launch
- Same documents appear multiple times in Network tab within single session
- Free tier quota exhausted mid-day
- Firestore reads/user ratio > 100 reads/day (should be < 20 for this app)

**Phase to address:**
Phase 1 (Foundation) — Caching architecture must be designed before implementing lazy loading. Retrofitting cache layer risks breaking real-time sync and offline support.

---

### Pitfall 10: Missing Empty States for Long-Dormant Users

**What goes wrong:**
User returns after 3 months away, sees expanded timeline with 12 weeks of zeros (gray/red squares), feels demotivated and abandons app. No encouragement message, no "welcome back" prompt, just a stark reminder of failure. Statistics show inflated "total weeks" count including inactive weeks, making success rate look worse.

**Why it happens:**
Developers test with active accounts (adding workouts regularly). Don't consider user journey of lapses and returns, which is EXTREMELY common in fitness apps (40-60% monthly churn rate). Focusing on power users instead of struggling users.

**How to avoid:**
- **Welcome back message:** Detect gaps > 4 weeks, show "Welcome back, Marine! Ready to RIP & TEAR again?" toast
- **Skip empty weeks:** Timeline expansion skips weeks with zero workouts by default (option to "show all")
- **Comeback achievement:** Unlock special badge for returning after long gap (positive reinforcement)
- **Fresh start option:** "Start new streak" button that doesn't erase history but reframes perspective
- **Filters:** Toggle between "All weeks" and "Active weeks only" view
- **Contextual stats:** Show "Active weeks" count separately from "Total weeks"

**Warning signs:**
- Retention rate drops significantly 30+ days after user's last workout
- User testing shows negative emotional response to seeing empty weeks
- Support feedback: "I feel bad looking at my stats"
- Timeline expansion shows > 50% gray/zero squares

**Phase to address:**
Phase 2 (Timeline Implementation) — Empty states are critical for user retention but often treated as edge case. Must be part of timeline feature spec, not afterthought.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Calculating all stats client-side (existing pattern) | Simple implementation, no backend logic needed | Poor performance with 100+ weeks, high Firebase read costs, battery drain | **MVP only** — must refactor to aggregation before 50 users |
| Using traffic light colors (red/yellow/green) | Familiar to all users, no learning curve | Conflicts with DOOM health bar aesthetic, color accessibility issues | **Never** — undermines app theming and accessibility |
| Loading full history without pagination | Works perfectly for first 6 months of usage | Exponential performance degradation, sudden bad experience | **Acceptable until 26 weeks** — must implement lazy load by then |
| Storing only week IDs without month/year indexes | Flat data structure, simple queries | Grouping by month/year requires parsing every week ID | **Never** — adds negligible complexity now, painful migration later |
| Skipping loading skeletons | Faster initial development, one less component | Poor perceived performance, confused users, higher bounce rate | **Never** — skeletons are 30 minutes of dev time for major UX improvement |
| Hardcoding color thresholds (3/4/5+ workouts) | Quick implementation, no configuration needed | Can't adjust without code change, A/B testing difficult | **Acceptable** — user preferences unlikely to diverge from 3+ goal |
| Using `getDocs()` without caching strategy | Simple Firestore API, works immediately | Exploding read costs, slow repeated loads | **Never** — caching adds 1 hour dev time, prevents $200/month bills |
| Calculating trends on every render | Reactive programming pattern, always up-to-date | Janky UI, high CPU usage, battery drain | **Never** — `useMemo` with proper deps is same code complexity |
| Ignoring sick/vacation weeks in calculations | Simpler logic, fewer edge cases to handle | Misleading statistics, broken streak logic, user confusion | **Never** — existing codebase already handles this correctly |

---

## Integration Gotchas

Common mistakes when connecting to external services (Firestore focus).

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Firestore real-time listeners (`onSnapshot`) | Using real-time listeners for dashboard data that doesn't need live updates | Use `getDocs()` for static views (dashboard), save listeners for active tracking (current week) |
| Firestore query ordering | Forgetting to create composite indexes for `orderBy()` + `where()` queries | Run queries in Firebase emulator first, auto-generate required indexes |
| Firestore offline persistence | Assuming cached data is fresh after app has been backgrounded | Check `metadata.fromCache` and show "Offline data" indicator when true |
| Firestore timestamps | Comparing server timestamps with client `Date.now()` (timezone issues) | Always use `serverTimestamp()` for writes, convert to local timezone only in UI |
| Firestore batch operations | Using `batch.commit()` for unrelated writes (all-or-nothing semantics) | Only batch related operations; use separate writes for independent changes |
| Firestore security rules | Writing rules that allow reading all user documents (`allow read: if request.auth != null`) | Restrict to specific document paths (`allow read: if request.auth.uid == userId`) — already correct in existing rules |
| LocalStorage fallback | Assuming LocalStorage has unlimited space (5-10MB limit) | Implement quota checking and pruning of old data (keep last 52 weeks) |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all weeks in single query | Dashboard load time increases linearly with history length | Implement lazy loading + pagination | > 26 weeks (~6 months of usage) |
| Client-side month/year grouping | UI freezes during calculation, janky scrolling | Pre-aggregate monthly summaries in Firestore | > 52 weeks (~1 year of usage) |
| Recalculating all stats on every workout toggle | Button taps feel laggy (200ms+ delay) | Debounce recalculation, use optimistic updates | > 26 weeks of data |
| Rendering entire timeline at once | Initial render takes 1-2 seconds, blank screen | Virtual scrolling or collapsed-by-default sections | > 104 weeks (~2 years) |
| Using Array.filter/map/reduce in render | React DevTools profiler shows high render time | Move to `useMemo` with stable dependency array | > 52 weeks of data |
| Storing full week objects in state | Memory usage grows, app crashes on low-end devices | Store only week IDs, hydrate on-demand | > 200 weeks of cached data |
| No request deduplication | Multiple components trigger same Firestore query | Use React Context or SWR-style cache | > 3 components using same data |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing workout data in URL params (`/dashboard?weeks=2026-W01,2026-W02...`) | Workout history leaks via browser history, shared links, analytics | Keep state in component state/Context, use generic routes |
| Storing aggregated stats in client-only state | Stats manipulation via browser DevTools (fake achievements) | Always recalculate from source documents server-side |
| Allowing arbitrary week ID queries | Malicious user could scan for other users' week IDs via enumeration | Firestore rules already enforce `request.auth.uid == userId` (correct) |
| Trusting client-calculated trends for achievements | User could modify trend logic to unlock achievements | Server-side Cloud Functions for achievement verification (future) |
| Leaking friend workout counts to non-friends | Privacy violation if users assume workouts are private | Already correct — Firestore rules allow friends to read weeks |

---

## UX Pitfalls

Common user experience mistakes in this domain (fitness analytics).

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing "0 weeks streak" prominently when user just started | Demotivating for new users, implies failure | Show "Start your streak!" message until first 3+ week |
| Using yellow color for minimum goal (3 workouts) | Feels like warning despite goal achievement | Use green spectrum (light green = minimum, dark green = exceeded) |
| Expanding entire timeline by default | Overwhelming scroll, can't find current week | Default collapsed, "Jump to current week" button |
| Comparing monthly trends without context | "Down 20%" sounds bad but could be sick recovery | Show "vs previous period (excluding sick weeks)" label |
| No differentiation between "no data" and "zero workouts" | Unclear if week hasn't happened yet or user skipped | Gray for future/no-data, red for zero workouts in past |
| Auto-playing animations on every timeline expand | Annoying, drains battery, slows interaction | Only animate on first load or explicit user trigger |
| Tiny touch targets for expand/collapse on mobile | Frustrated taps, accidental expansions | Minimum 44px tap targets, full-width clickable rows |
| Dense data tables on mobile | Horizontal scrolling, pinch-to-zoom required | Card-based layout, vertical stacking |
| No "back to top" button in long timeline | Endless scrolling to return to stats summary | Sticky "Back to top" FAB when scrolled > 2 screens |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Timeline lazy loading:** Often missing cache invalidation — verify data refreshes when user adds workout in previously-loaded month
- [ ] **Trend calculations:** Often missing sick/vacation week filtering — verify "vs previous period" excludes non-normal status weeks
- [ ] **Color accessibility:** Often missing pattern/texture fallback — verify colorblind emulation shows distinguishable states
- [ ] **Month boundaries:** Often missing ISO week overlap logic — verify Week 1 and Week 52/53 assigned to correct months
- [ ] **Loading states:** Often missing error handling — verify "retry" button appears on network failure
- [ ] **Empty states:** Often missing "welcome back" flow — verify returning users see encouraging message after gap
- [ ] **Mobile touch targets:** Often missing minimum 44px size — verify tap success rate > 95% in mobile testing
- [ ] **Firebase costs:** Often missing read operation monitoring — verify dashboard shows < 20 reads per session
- [ ] **Collapsed state persistence:** Often missing URL/localStorage state — verify expanded sections stay expanded on refresh
- [ ] **Performance with large datasets:** Often missing virtual scrolling — verify smooth 60fps scroll with 200+ weeks rendered

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Loaded all data at once (performance issue) | MEDIUM | 1. Add `limit(50)` to existing query as hotfix 2. Implement pagination in next sprint 3. Add performance monitoring |
| Wrong color scheme (user confusion) | LOW | 1. Update color constants in tailwind.config.js 2. Update legend in Dashboard.tsx 3. Add release note explaining change |
| Client-side calculation too slow | HIGH | 1. Add loading spinner as immediate fix 2. Implement monthly aggregation documents 3. Migrate historical data with batch script |
| Firebase costs exploded | LOW | 1. Enable Firestore cache immediately 2. Add read count monitoring 3. Implement client-side caching layer |
| Missing sick/vacation filtering | MEDIUM | 1. Audit all calculation functions 2. Create shared utility function 3. Add unit tests for each stat |
| Accessibility issues reported | MEDIUM | 1. Add contrast-compliant colors as CSS variables 2. Implement pattern overlays 3. Add high-contrast mode |
| Month boundary issues | HIGH | 1. Document current logic 2. Create migration script for historical summaries 3. Add integration tests |
| No loading states causing confusion | LOW | 1. Add skeleton components 2. Wrap lazy loads with Suspense boundaries 3. Add timeout error handling |
| Empty states demotivating users | MEDIUM | 1. Add welcome-back detection 2. Implement filter toggle 3. Create comeback achievement |
| Mobile UX issues (tiny targets) | LOW | 1. Increase touch target CSS (min-height: 44px) 2. Add padding around buttons 3. Test on real devices |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Loading all data at once | Phase 1 (Foundation) | Dashboard loads in < 2s with 100 weeks of test data |
| Inverse color logic | Phase 1 (Foundation) | User testing shows > 90% correctly interpret green=good |
| Client-side trend calculation | Phase 1 (Foundation) | React Profiler shows < 100ms calculation time with 52 weeks |
| Non-collapsible timeline on mobile | Phase 2 (Timeline) | Mobile testing shows < 5 swipes to navigate 2 years of data |
| Sick/vacation week handling | Phase 1 (Foundation) | All trend calculations use shared utility function |
| Color accessibility | Phase 1 (Foundation) | WCAG AA contrast checker passes, colorblind emulation shows distinction |
| No loading skeletons | Phase 2 (Timeline) | No blank space visible for > 200ms during expansion |
| Month boundary misalignment | Phase 1 (Foundation) | Unit tests pass for Week 1, 52, 53 in multiple years |
| Firebase query costs | Phase 1 (Foundation) | Firebase console shows < 20 reads/session average |
| Missing empty states | Phase 2 (Timeline) | Returning users (gap > 4 weeks) see welcome message |

---

## Sources

- **Existing codebase analysis:**
  - `src/pages/Dashboard.tsx` — Current 12-week grid implementation, color scheme
  - `src/hooks/useAllWeeks.ts` — Client-side calculation patterns, Firestore query structure
  - `src/hooks/useStats.ts` — Sick/vacation week filtering logic (lines 106-109, 159-163)
  - `tailwind.config.js` — Color scheme definitions
  - `.claude/CLAUDE.md` — Performance constraints, Firebase cost awareness, mobile-first design

- **Domain knowledge:**
  - Fitness app retention patterns (40-60% monthly churn, lapsed user recovery critical)
  - Firestore pricing model and read operation costs
  - ISO 8601 week/year boundaries and month overlap edge cases
  - WCAG 2.1 accessibility guidelines for color contrast and touch targets
  - Mobile viewport constraints and touch interaction patterns

- **Performance patterns:**
  - React optimization best practices (useMemo, lazy loading, code splitting)
  - Firebase query optimization strategies (caching, pagination, aggregation)
  - Mobile browser rendering performance (60fps requirement, main thread blocking)

- **Personal experience:**
  - Common fitness tracker analytics mistakes (confusing metrics, poor empty states)
  - Firestore cost explosion incidents from unoptimized queries
  - Progressive enhancement patterns for mobile-first apps

---

*Pitfalls research for: Analytics Dashboard Enhancement (Rep & Tear fitness tracker)*
*Researched: 2026-02-25*
*Confidence: HIGH (based on existing codebase analysis + domain expertise)*
