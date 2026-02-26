# Requirements: Rep & Tear

**Defined:** 2026-02-26
**Core Value:** Users can visualize and understand their complete workout history with clear, meaningful statistics that motivate continued consistency and highlight long-term progress patterns.

## v1.1 Requirements

Requirements for XP & Levels milestone. Each maps to roadmap phases.

### XP System

- [ ] **XP-01**: User earns XP from each workout week based on non-linear scaling (1=5, 2=15, 3=30, 4=50, 5=80, 6-7=100 XP)
- [ ] **XP-02**: User earns bonus XP when unlocking achievements (+100 XP per achievement)
- [ ] **XP-03**: User earns small streak bonus on weekly XP when maintaining active streak
- [ ] **XP-04**: User's XP persists in Firestore (authenticated) or LocalStorage (guest)
- [ ] **XP-05**: Existing users receive retroactive XP calculated from all historical workout data on first load

### Rank Progression

- [ ] **RANK-01**: User has a DOOM military rank derived from total XP (15 ranks from Private to Doom Slayer)
- [ ] **RANK-02**: User sees rank-up celebration (toast + confetti) when reaching a new rank
- [ ] **RANK-03**: Rank-up celebrations are suppressed during retroactive XP grant (no notification spam)

### UI Display

- [ ] **UI-01**: User sees XP progress bar and current rank on the Tracker page
- [ ] **UI-02**: XP bar shows animated fill when XP increases
- [ ] **UI-03**: XP bar displays numerical progress (current XP / XP needed for next rank)
- [ ] **UI-04**: User can tap XP bar to see XP breakdown (base workout XP + streak bonus + achievement bonus)
- [ ] **UI-05**: "Probability to hit target" section is removed from Tracker page

## Future Requirements

### Social XP

- **SOCIAL-01**: Friend rank badges visible on Squad page leaderboard
- **SOCIAL-02**: Rank-up events shown in Dashboard timeline
- **SOCIAL-03**: Squad page "By Rank" sorting option

### Advanced Gamification

- **GAM-01**: Comeback XP boost after missed weeks
- **GAM-02**: Sick/vacation weeks earn small survival XP
- **GAM-03**: Secret elite ranks beyond rank 15

## Out of Scope

| Feature | Reason |
|---------|--------|
| XP decay/loss | Punishment mechanics reduce motivation |
| Pay-to-level | Cheapens achievement, breaks workout-XP loop |
| Competitive XP leaderboards | Favors high-volume users, discourages beginners |
| Level-gated features | Core app must be fully functional for all users |
| Prestige/reset system | Confusing for fitness context |
| Custom rank icons | Design-heavy, text-based ranks sufficient for v1.1 |
| Sound effects for XP/rank-up | Requires new audio assets, defer to future |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| XP-01 | Pending | Pending |
| XP-02 | Pending | Pending |
| XP-03 | Pending | Pending |
| XP-04 | Pending | Pending |
| XP-05 | Pending | Pending |
| RANK-01 | Pending | Pending |
| RANK-02 | Pending | Pending |
| RANK-03 | Pending | Pending |
| UI-01 | Pending | Pending |
| UI-02 | Pending | Pending |
| UI-03 | Pending | Pending |
| UI-04 | Pending | Pending |
| UI-05 | Pending | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 0
- Unmapped: 13

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-02-26 after initial definition*
