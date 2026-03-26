# Roadmap: Rep & Tear

## Milestones

- ✅ **v1.0 Enhanced Analytics** - Phases 1-3 (shipped 2026-02-25)
- ✅ **v1.1 XP & Levels** - Phases 4-7 (shipped 2026-02-26)
- 🔄 **v1.2 Rank Showcase** - Phase 8 (in progress)

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

<details>
<summary>✅ v1.1 XP & Levels (Phases 4-7) - SHIPPED 2026-02-26</summary>

Added XP and military rank progression system that rewards workouts, streaks, and achievements with DOOM-themed leveling.

- [x] **Phase 4: Foundation** (2/2 plans) — completed 2026-02-26
- [x] **Phase 5: Data Layer** (2/2 plans) — completed 2026-02-26
- [x] **Phase 6: UI & Celebrations** (2/2 plans) — completed 2026-02-26
- [x] **Phase 7: Integration & Polish** (2/2 plans) — completed 2026-02-26

**Delivered:**
- 15 DOOM military ranks with exponential XP curve (Private → Doom Slayer)
- Non-linear workout XP scaling with streak multipliers
- XP progress bar with rank badge on Tracker page
- XP breakdown modal (This Week / All Time tabs)
- Level-up celebration toasts with animations
- Friend rank visibility on Squad leaderboard
- E2E test coverage for XP system

**See:** `.planning/milestones/v1.1-ROADMAP.md` for full details

</details>

<details open>
<summary>🔄 v1.2 Rank Showcase (Phase 8) - IN PROGRESS</summary>

Display all 15 DOOM military ranks on the Achievements (Glory) page with current rank highlighted, creating a scannable progression ladder from Private to Doom Slayer.

- [ ] **Phase 8: Rank Showcase** - Display all 15 ranks with visual progression on Achievements page

**Targeting:**
- List all 15 ranks with name, tagline, and XP threshold
- Current rank highlighted with gold border and glow effect
- Earned ranks fully visible, unearned ranks dimmed and grayed
- Progress indicator showing XP to next rank
- Guest user handling with "SIGN IN TO UNLOCK" message
- Auto-scroll to current rank on mobile

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Health Bar Color Foundation | v1.0 | 1/1 | Complete | 2026-02-25 |
| 2. Expandable Timeline & Summaries | v1.0 | 5/5 | Complete | 2026-02-25 |
| 3. Trend Indicators & Comparisons | v1.0 | 2/2 | Complete | 2026-02-25 |
| 4. Foundation | v1.1 | 2/2 | Complete | 2026-02-26 |
| 5. Data Layer | v1.1 | 2/2 | Complete | 2026-02-26 |
| 6. UI & Celebrations | v1.1 | 2/2 | Complete | 2026-02-26 |
| 7. Integration & Polish | v1.1 | 2/2 | Complete | 2026-02-26 |
| 8. Rank Showcase | v1.2 | 0/TBD | Not started | - |

---

## Phase Details

### Phase 8: Rank Showcase

**Goal:** Users can see all 15 DOOM military ranks on the Achievements page with clear visual distinction between earned, current, and locked states.

**Depends on:** Nothing (builds on existing v1.1 XP system)

**Requirements:** RANK-01, RANK-02, RANK-03, RANK-04, RANK-05, RANK-06, RANK-07

**Success Criteria** (what must be TRUE):
1. User sees all 15 ranks listed vertically on Achievements page above achievements section
2. Each rank card displays rank name, tagline, and XP threshold in DOOM-themed styling
3. User's current rank has gold border and pulsing glow effect that immediately draws the eye
4. Earned ranks (below current) appear at full opacity, unearned ranks (above current) are dimmed with 50% opacity and grayscale filter
5. Progress indicator shows "+XXX XP to [Next Rank]" below current rank (or "MAX RANK ACHIEVED" for Doom Slayer)
6. Guest users (not signed in) see "SIGN IN TO UNLOCK RANK PROGRESSION" message instead of rank showcase
7. On mobile devices, current rank auto-scrolls into view on page load for immediate context

**Plans:** TBD

---

## Traceability

| Requirement | Phase | Description |
|-------------|-------|-------------|
| RANK-01 | Phase 8 | All 15 ranks visible on Achievements page |
| RANK-02 | Phase 8 | Rank details (name, tagline, XP threshold) |
| RANK-03 | Phase 8 | Current rank highlighted (gold border + glow) |
| RANK-04 | Phase 8 | Earned/locked visual states (opacity + grayscale) |
| RANK-05 | Phase 8 | Placement above achievements section |
| RANK-06 | Phase 8 | Progress to next rank indicator |
| RANK-07 | Phase 8 | Guest user handling (auth check + message) |

**Coverage:** 7/7 requirements mapped (100%)

---

*Last updated: 2026-03-26*
