# Rep & Tear - Project Context

## What This Is

Rep & Tear is a DOOM-themed workout tracker with enhanced analytics and XP progression. The app gamifies fitness through visual feedback (DoomGuy face states), achievements, streak tracking, XP earning, and military rank progression. Version 1.1 added a complete XP and leveling system with 15 DOOM military ranks, animated celebrations, and friend rank visibility.

## Core Value

Users can visualize and understand their complete workout history with clear, meaningful statistics that motivate continued consistency and highlight long-term progress patterns.

## Requirements

### Validated

**Base App (v1.6 - Production):**
- ✓ Core workout tracking (7-day grid)
- ✓ Dynamic DOOM face with state transitions
- ✓ Firebase authentication and sync
- ✓ 18 achievement system
- ✓ Week navigation and status management
- ✓ Squad system with friend tracking
- ✓ Mobile-responsive design
- ✓ Offline support with LocalStorage

**Enhanced Analytics (v1.0 - Shipped 2026-02-25):**
- ✓ Health bar color scheme (green=godmode, yellow=healthy, red=critical) — v1.0
- ✓ Expandable timeline view with all workout history — v1.0
- ✓ Monthly summary statistics in timeline — v1.0
- ✓ Yearly summary statistics in timeline — v1.0
- ✓ Trend indicators comparing vs previous period — v1.0
- ✓ Trend indicators comparing vs personal average — v1.0
- ✓ Collapsible year/month sections with lazy loading — v1.0
- ✓ WCAG AA compliant color contrast — v1.0
- ✓ Dual visual encoding (status borders + health backgrounds) — v1.0
- ✓ Performance optimized for 100+ weeks of data — v1.0

**XP & Levels (v1.1 - Shipped 2026-02-26):**
- ✓ XP earned from workouts with non-linear face-state scaling — v1.1
- ✓ Achievement XP bonuses (+100 XP per unlock) — v1.1
- ✓ Streak multiplier on weekly XP (1.5x-2.5x) — v1.1
- ✓ XP persistence in Firestore for authenticated users — v1.1
- ✓ Retroactive XP calculation from historical data — v1.1
- ✓ 15 DOOM military ranks (Private → Doom Slayer) — v1.1
- ✓ Level-up celebration (toast + confetti) — v1.1
- ✓ Rank-up suppression during retroactive XP — v1.1
- ✓ XP progress bar on Tracker page — v1.1
- ✓ Animated XP bar fill on XP increase — v1.1
- ✓ Numerical XP progress (current/next rank) — v1.1
- ✓ XP breakdown modal (base + streak + achievement) — v1.1
- ✓ Probability section removed from Tracker — v1.1

### Active

(No active milestone — run `/gsd:new-milestone` to define next)

### Out of Scope

- Data export functionality (CSV/JSON) — Deferred to future milestone
- GitHub-style contribution calendar — Using expandable timeline instead
- Workout time tracking — Not part of analytics focus
- Exercise type categorization — Keep simple, binary tracking
- Charts/graphs — Stick to grid visualizations for DOOM aesthetic
- Custom date range selection — Timeline provides full history access
- Comparison with friends — Focus on personal progress only
- Colorblind pattern overlays — Deferred (v1.0 tech debt)
- Keyboard navigation for timeline — Deferred (v1.0 tech debt)
- Empty state messaging — Deferred (v1.0 tech debt)
- XP decay/loss — Punishment mechanics reduce motivation
- Pay-to-level — Cheapens achievement
- Competitive XP leaderboards — Favors high-volume users
- Level-gated features — Core app must be fully functional for all
- Sound effects for XP/rank-up — Requires new audio assets

## Context

**Shipped v1.1 (2026-02-26):**
- 4 phases complete (8 plans, 16 tasks)
- 17 files modified (+1,577 lines, -86 lines)
- 7,303 total lines of TypeScript
- Same-day execution sprint
- 13/13 requirements satisfied (100%)

**Tech Stack:**
- React 19.2 + TypeScript
- Tailwind CSS for styling
- Firebase Firestore for data
- Vite build tool
- Deployed on Vercel
- Playwright E2E testing

**Design Philosophy:**
- DOOM retro aesthetic preserved
- Simple grid visualizations over complex charts
- Mobile-friendly collapsible interactions
- Performance-conscious lazy loading
- Zero new dependencies for XP system (CSS transitions, existing toast/confetti)

## Constraints

- **Tech Stack**: React + TypeScript + Tailwind (no new dependencies)
- **Performance**: Must handle users with 100+ weeks of data smoothly
- **Mobile-first**: Primary usage is mobile, expand/collapse must work on small screens
- **DOOM Aesthetic**: Retro pixel-perfect theme, no modern chart libraries
- **Data Structure**: Work with existing Firestore schema (no migrations)
- **Backwards Compatibility**: Don't break existing Dashboard features
- **Firebase Costs**: Keep read operations efficient (lazy load, debouncing, batched writes)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Health bar color scheme (green=best, red=low) | More intuitive than traffic lights, matches DOOM health mechanic | ✓ Good |
| Expandable timeline over infinite scroll | Better performance with large datasets, clearer mental model | ✓ Good |
| Month/year summaries in timeline headers | Reduces UI clutter, contextual information where needed | ✓ Good |
| Dual trend comparisons (previous + average) | Provides both short-term momentum and long-term perspective | ✓ Good |
| Keep 12-week summary view | Don't remove what works, add complementary views | ✓ Good |
| Collapsible sections over tabs | Better for mobile, less navigation friction | ✓ Good |
| WCAG yellow-600 over doom-gold | yellow-600 passes 4.5:1 contrast, doom-gold fails at 3.79:1 | ✓ Good |
| Dual visual encoding (borders + backgrounds) | Status borders + health backgrounds show both status and performance | ✓ Good |
| Defer v1.0 Phase 4 to tech debt | Focus on core analytics value, accessibility can be enhanced later | ⚠️ Revisit |
| Exponential XP curve targeting 100K max | Balanced for ~2 years at ideal pace, 15K-20K XP realistic estimate | ✓ Good |
| 15 DOOM military ranks with lore-accurate names | UAC marines → Night Sentinels → Argent warriors progression | ✓ Good |
| Non-linear XP scaling with inflection at 3 workouts | Rewards meeting minimum target, big jumps for 5+ workouts | ✓ Good |
| Streak multiplier capped at 2.5x | Prevents exponential growth while rewarding consistency | ✓ Good |
| Retroactive XP on first load (silent) | Existing users get full XP history without notification spam | ✓ Good |
| Guest users excluded from XP | Firestore-only avoids complex LocalStorage XP sync | ✓ Good |
| XP stored in stats/current document | Reuses existing collection, no new security rules needed | ✓ Good |
| Two-step fill animation for level-up | Fill to 100%, pause, reset to new level — dramatic feedback | ✓ Good |
| Bottom sheet modal for XP breakdown | Better mobile UX than full-screen, familiar gesture pattern | ✓ Good |
| 750ms debounce for Firestore XP writes | Balances UI responsiveness vs quota usage | ✓ Good |
| Batch rank denormalization on rank change only | Avoids unnecessary writes on every XP update | ✓ Good |

---
*Last updated: 2026-02-26 after v1.1 milestone*
