# Rep & Tear - Project Context

## What This Is

Rep & Tear is a DOOM-themed workout tracker with enhanced analytics capabilities. The app gamifies fitness through visual feedback (DoomGuy face states), achievements, streak tracking, and comprehensive historical data visualization. Version 1.0 added health bar color schemes, expandable timeline views, period summaries, and trend indicators for complete workout history analysis.

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

### Active

(Requirements for next milestone - TBD)

### Out of Scope

- Data export functionality (CSV/JSON) — Deferred to future milestone
- GitHub-style contribution calendar — Using expandable timeline instead
- Workout time tracking — Not part of analytics focus
- Exercise type categorization — Keep simple, binary tracking
- Charts/graphs — Stick to grid visualizations for DOOM aesthetic
- Custom date range selection — Timeline provides full history access
- Comparison with friends — Focus on personal progress only
- Colorblind pattern overlays — Deferred (Phase 4 tech debt)
- Keyboard navigation for timeline — Deferred (Phase 4 tech debt)
- Empty state messaging — Deferred (Phase 4 tech debt)

## Context

**Shipped v1.0 (2026-02-25):**
- 3 phases complete (8 plans, 39 tasks)
- 42 files modified (+9,125 lines)
- 6,041 total lines of TypeScript
- 4-hour same-day sprint
- 44/48 requirements satisfied (91.7%)
- Tech debt: Phase 4 accessibility features deferred

**Tech Stack:**
- React 19.2 + TypeScript
- Tailwind CSS for styling
- Firebase Firestore for data
- Vite build tool
- Deployed on Vercel

**Design Philosophy:**
- DOOM retro aesthetic preserved
- Simple grid visualizations over complex charts
- Mobile-friendly collapsible interactions
- Performance-conscious lazy loading
- No new dependencies added

## Constraints

- **Tech Stack**: React + TypeScript + Tailwind (no new dependencies)
- **Performance**: Must handle users with 100+ weeks of data smoothly
- **Mobile-first**: Primary usage is mobile, expand/collapse must work on small screens
- **DOOM Aesthetic**: Retro pixel-perfect theme, no modern chart libraries
- **Data Structure**: Work with existing Firestore schema (no migrations)
- **Backwards Compatibility**: Don't break existing Dashboard features
- **Firebase Costs**: Keep read operations efficient (lazy load timeline data)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Health bar color scheme (green=best, red=low) | More intuitive than traffic lights, matches DOOM health mechanic | ✓ Good — Users find it more natural |
| Expandable timeline over infinite scroll | Better performance with large datasets, clearer mental model | ✓ Good — Smooth with 100+ weeks |
| Month/year summaries in timeline headers | Reduces UI clutter, contextual information where needed | ✓ Good — Clean, scannable interface |
| Dual trend comparisons (previous + average) | Provides both short-term momentum and long-term perspective | ✓ Good — Contextual insights |
| Keep 12-week summary view | Don't remove what works, add complementary views | ✓ Good — Backwards compatible |
| Collapsible sections over tabs | Better for mobile, less navigation friction | ✓ Good — Mobile-friendly |
| WCAG yellow-600 over doom-gold | yellow-600 (#ca8a04) passes 4.5:1 contrast, doom-gold fails at 3.79:1 | ✓ Good — Accessibility maintained |
| Dual visual encoding (borders + backgrounds) | Status borders (gold/blue) + health backgrounds show both status and performance | ✓ Good — Information density |
| Defer Phase 4 to tech debt | Focus on core analytics value, accessibility can be enhanced later | ⚠️ Revisit — Plan Phase 4 in next milestone |

---
*Last updated: 2026-02-25 after v1.0 milestone completion*
