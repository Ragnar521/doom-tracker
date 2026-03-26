# Requirements: Rep & Tear v1.2

**Defined:** 2026-03-26
**Core Value:** Users can visualize and understand their complete workout history with clear, meaningful statistics that motivate continued consistency and highlight long-term progress patterns.

## v1.2 Requirements

Requirements for Rank Showcase milestone. Each maps to roadmap phases.

### Rank Display

- [ ] **RANK-01**: User can see all 15 DOOM military ranks listed on the Achievements page
- [ ] **RANK-02**: Each rank shows its name, tagline, and XP threshold
- [ ] **RANK-03**: User's current rank is highlighted with gold border and glow effect
- [ ] **RANK-04**: Earned ranks appear at full opacity, unearned ranks are dimmed and grayed out
- [ ] **RANK-05**: Rank list appears above the achievements section
- [ ] **RANK-06**: User can see progress to next rank ("+XXX XP to [Next Rank]")
- [ ] **RANK-07**: Guest users see no rank showcase (XP is authenticated-only)

## Future Requirements

### Rank Display Enhancements

- **RANK-08**: Auto-scroll to current rank on page load (mobile optimization)
- **RANK-09**: Special golden glow for max rank (Doom Slayer) when earned
- **RANK-10**: Rank icons/badges for each tier (requires new assets)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Rank icons/badges | Requires 15 new assets, project uses text-based ranks |
| Interactive rank cards (click to expand) | Over-engineering, users want simple scannable list |
| "Days until next rank" prediction | Complex calculation, misleading if workout frequency changes |
| Rank unlock timestamps | Requires new Firestore collection + migration, low value |
| Rank comparison with friends | Squad page already shows friend ranks in leaderboard |
| XP progress bars per rank | Clutters UI, current rank progress already on Tracker page |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| RANK-01 | Phase 8 | Pending |
| RANK-02 | Phase 8 | Pending |
| RANK-03 | Phase 8 | Pending |
| RANK-04 | Phase 8 | Pending |
| RANK-05 | Phase 8 | Pending |
| RANK-06 | Phase 8 | Pending |
| RANK-07 | Phase 8 | Pending |

**Coverage:**
- v1.2 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0
- Coverage: 100%

---
*Requirements defined: 2026-03-26*
*Last updated: 2026-03-26 after roadmap creation*
