# Rep & Tear - Enhanced Analytics Milestone

## What This Is

An analytics enhancement milestone for Rep & Tear, the DOOM-themed workout tracker. This milestone focuses on improving data visualization and expanding historical workout analysis beyond the current 12-week limitation. Users will gain deeper insights into their long-term fitness journey through improved color schemes, expandable timelines, period summaries, and trend indicators.

## Core Value

Users can visualize and understand their complete workout history with clear, meaningful statistics that motivate continued consistency and highlight long-term progress patterns.

## Requirements

### Validated

(Inherited from base Rep & Tear v1.6 - existing production features)

- ✓ Core workout tracking (7-day grid)
- ✓ Dynamic DOOM face with state transitions
- ✓ Firebase authentication and sync
- ✓ 18 achievement system
- ✓ Current Dashboard with 12-week view
- ✓ Week navigation and status management
- ✓ Squad system with friend tracking
- ✓ Mobile-responsive design
- ✓ Offline support with LocalStorage

### Active

(New features for this milestone)

- [ ] Health bar color scheme for performance visualization
- [ ] Expandable timeline view with all workout history
- [ ] Monthly summary statistics in timeline
- [ ] Yearly summary statistics in timeline
- [ ] Trend indicators comparing vs previous period
- [ ] Trend indicators comparing vs personal average
- [ ] Collapsible year/month sections
- [ ] Improved week grid color contrast
- [ ] Maintain existing 12-week quick view
- [ ] Maintain existing day frequency heatmap

### Out of Scope

- Data export functionality (CSV/JSON) — Deferred to future milestone
- GitHub-style contribution calendar — Using expandable timeline instead
- Workout time tracking — Not part of analytics focus
- Exercise type categorization — Keep simple, binary tracking
- Charts/graphs — Stick to grid visualizations for DOOM aesthetic
- Custom date range selection — Timeline provides full history access
- Comparison with friends — Focus on personal progress only

## Context

**Current State:**
- Rep & Tear is a live production app (v1.6) deployed on Vercel
- Dashboard exists at `src/pages/Dashboard.tsx` with 12-week grid limitation
- Color scheme uses red/yellow/green which users find confusing
- Analytics data is already calculated in `src/hooks/useAllWeeks.ts`
- All historical data is stored in Firestore (no data loss, just display limitation)

**User Pain Points:**
- Cannot see workout history beyond 12 weeks
- Color scheme doesn't feel DOOM-authentic (health bar inverse)
- Missing long-term trend visibility
- No monthly/yearly aggregation summaries

**Technical Environment:**
- React 19.2 + TypeScript
- Tailwind CSS for styling
- Firebase Firestore for data
- Existing hooks handle data fetching (`useAllWeeks`, `useStats`)
- Mobile-first responsive design required

**Design Philosophy:**
- DOOM retro aesthetic must be preserved
- Simple grid visualizations over complex charts
- Mobile-friendly interactions (collapsible sections)
- Performance-conscious (don't load all weeks at once)

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
| Health bar color scheme (green=best, red=low) | More intuitive than traffic lights, matches DOOM health mechanic | — Pending |
| Expandable timeline over infinite scroll | Better performance with large datasets, clearer mental model | — Pending |
| Month/year summaries in timeline headers | Reduces UI clutter, contextual information where needed | — Pending |
| Dual trend comparisons (previous + average) | Provides both short-term momentum and long-term perspective | — Pending |
| Keep 12-week summary view | Don't remove what works, add complementary views | — Pending |
| Collapsible sections over tabs | Better for mobile, less navigation friction | — Pending |

---
*Last updated: 2026-02-25 after initialization*
