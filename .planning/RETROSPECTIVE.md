# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Enhanced Analytics

**Shipped:** 2026-02-25
**Phases:** 3 | **Plans:** 8 | **Timeline:** 52 days (Jan 4 - Feb 25)

### What Was Built
- Health bar color system replacing confusing traffic-light scheme with DOOM health paradigm
- Expandable timeline with year/month sections and lazy loading for 100+ weeks
- Period summaries (monthly/yearly stats) with totals, averages, success rates, streaks
- Trend indicators showing performance vs previous periods and all-time average
- Dual visual encoding combining status borders with health bar backgrounds
- Performance optimizations (lazy loading, memoization, conditional rendering)

### What Worked
- Dual visual encoding decision provided elegant solution to status+performance visibility
- WCAG yellow-600 over doom-gold maintained accessibility without sacrificing aesthetics
- Lazy loading architecture prevented Firebase cost spikes with large datasets
- Collapsible sections proved better than tabs for mobile-first design
- Phase 2 executed without formal plans (5 summaries, 0 plans) — rapid iteration worked

### What Was Inefficient
- Phase 2 anomaly (0 plans → 5 summaries) suggests plans were deleted or skipped
- Phase 4 deferred entirely rather than partially executed (4 requirements unaddressed)
- No milestone audit performed before completion (recommended but skipped)
- Requirements traceability lost for some deliverables (one-liners missing from summaries)

### Patterns Established
- Health bar color paradigm: green=best, yellow=moderate, red=critical, gray=inactive
- Dual visual encoding: borders for status, backgrounds for performance
- Timeline organization: year sections → month sections → week grids
- Stat presentation: compact chips with DOOM theming
- Trend display: arrows (↑↓→) with percentage changes

### Key Lessons
1. **WCAG compliance pays off** — yellow-600 vs doom-gold decision prevented accessibility debt
2. **Lazy loading is non-negotiable** — Timeline would fail with 100+ weeks without it
3. **Defer complete phases, not scattered requirements** — Phase 4 deferral cleaner than partial work
4. **Dual encoding solves competing needs** — Status and performance both visible simultaneously
5. **Mobile-first collapsible beats tabs** — Less friction, better touch targets

### Tech Debt Incurred
- Phase 4 (Accessibility & Polish) deferred entirely:
  - COLOR-08: Colorblind pattern overlays
  - PERF-04: WCAG AA contrast validation
  - PERF-05: Keyboard navigation
  - PERF-06: Empty state messaging
- Phase 2 plan files missing (unusual state, may need investigation)

---

## Milestone: v1.1 — XP & Levels

**Shipped:** 2026-02-26
**Phases:** 4 | **Plans:** 8 | **Timeline:** Same-day sprint

### What Was Built
- 15 DOOM military ranks with exponential XP curve (Private → Doom Slayer)
- Non-linear workout XP scaling with streak multipliers (1.5x-2.5x)
- useXP hook with Firestore persistence and retroactive XP calculation
- XP progress bar with animated fill and rank badge on Tracker page
- XP breakdown bottom sheet modal (This Week / All Time tabs)
- Level-up celebration toasts with two-step fill animation
- Friend rank visibility on Squad leaderboard with denormalized data
- E2E test suite for XP system UI with Playwright

### What Worked
- Zero new dependencies — CSS transitions and existing toast/confetti covered all needs
- Exponential XP curve with 15 ranks provides satisfying long-term progression
- Bottom sheet modal pattern worked well for mobile XP breakdown
- Two-step fill animation (100% → pause → reset) creates dramatic level-up moments
- Debounced Firestore writes (750ms) keep quota costs low without impacting UX
- Denormalize-on-rank-change pattern avoids unnecessary writes
- Same-day execution sprint: all 4 phases in one session

### What Was Inefficient
- Summary one-liners not populated (null from summary-extract) — template issue persists from v1.0
- STATE.md accumulated verbose decision log that could be trimmed at milestone boundary
- Roadmap still showed Phase 7 Plan 2 as incomplete despite having SUMMARY.md

### Patterns Established
- XP formula pattern: non-linear scaling with inflection at minimum target (3 workouts)
- Rank denormalization: write to profile/info only on rank change events
- Debounce pattern: 750ms delay for Firestore XP writes
- Two-step animation: fill → pause → reset for level transitions
- Bottom sheet: preferred over full-screen modal for detail views on mobile
- Guest exclusion: Firestore-only features skip LocalStorage to avoid sync complexity

### Key Lessons
1. **Zero-dependency features are fastest** — Reusing existing CSS/components eliminates integration overhead
2. **Denormalize strategically** — Write on rank change, not every XP update
3. **Suppress notifications during bulk operations** — Retroactive XP would spam 15+ level-up toasts
4. **Primitive deps in useMemo prevent infinite loops** — Object references cause re-render cycles
5. **Options object pattern preserves backward compatibility** — Existing callers don't break

### Cost Observations
- Model mix: Balanced profile (sonnet executors, inherit planner)
- Sessions: 1 (same-day complete sprint)
- Notable: 4 phases executed in single session — fastest milestone yet

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 52 days | 3 | First GSD milestone, established patterns |
| v1.1 | 1 day | 4 | Same-day sprint, 100% requirement coverage |

### Cumulative Quality

| Milestone | Requirements | Coverage | Tech Debt |
|-----------|--------------|----------|-----------|
| v1.0 | 44/48 | 91.7% | Phase 4 deferred |
| v1.1 | 13/13 | 100% | None new |

### Top Lessons (Verified Across Milestones)

1. Zero/minimal dependency additions lead to fastest execution (v1.0, v1.1)
2. Mobile-first design decisions (collapsible, bottom sheet) consistently outperform alternatives (v1.0, v1.1)
3. Strategic denormalization and lazy loading are essential for Firebase cost control (v1.0, v1.1)
4. Summary one-liners not being populated is a recurring template issue (v1.0, v1.1)
