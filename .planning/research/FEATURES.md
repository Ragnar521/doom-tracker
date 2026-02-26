# Feature Landscape: XP & Level Systems

**Domain:** Gamified fitness progression with military rank themes
**Researched:** February 26, 2026
**Context:** Adding XP and military rank progression to existing DOOM-themed workout tracker

---

## Table Stakes

Features users expect from XP & Level systems. Missing = system feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Visual XP bar** | Standard in all gamified apps - users need to see progress toward next level | Low | Must be persistent/visible on main screen |
| **Current level/rank display** | Users need to know their status at a glance | Low | Prominent placement (avatar area, header) |
| **XP awarded for workouts** | Core loop - actions must yield tangible rewards | Low | Base mechanic: workouts → XP |
| **Level-up celebration** | Universal pattern - success must be celebrated | Medium | Toast + confetti (already exists) |
| **Clear XP-to-level formula** | Users need to understand "how much more" to next level | Low | Show current/required XP numerically |
| **Persistent progression** | Levels never reset - permanent achievement | Low | Store in Firestore like achievements |
| **Animated XP bar fill** | Standard feedback - users expect to see bar move | Medium | Animation on XP gain (not just static) |
| **Multiple rank tiers** | Single progression feels shallow - need depth | Medium | 10-15 ranks minimum for longevity |
| **Retroactive XP** | Existing workouts should count - respect user history | Medium | Calculate from existing workout data |

---

## Differentiators

Features that set this XP system apart. Not expected, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **DOOM military ranks** | Authentic DOOM theme (Marine → Doomguy progression) instead of generic levels | Low | Unique branding, stronger narrative |
| **Streak XP multipliers** | Rewards consistency - amplifies existing streak system | Medium | 1.5x XP for 4+ week streaks, 2x for 12+ |
| **Achievement XP bonuses** | Integrates with existing 18-achievement system | Low | Each achievement unlock grants bonus XP |
| **Week status bonuses** | Sick/vacation weeks still earn "survival XP" to stay engaged | Medium | Prevents punishment for life events |
| **Comeback XP boost** | Extra XP for returning after missed weeks | Medium | Encourages re-engagement after lapses |
| **Face state XP scaling** | God Mode weeks (5-7 workouts) earn more XP than minimum | Medium | Rewards exceeding targets |
| **Friend rank visibility** | Squad members see each other's ranks on leaderboard | Low | Leverages existing friend system |
| **Historical rank timeline** | Show rank-ups in Dashboard timeline view | Medium | Integrates with v1.0 analytics timeline |
| **Secret rank unlocks** | Hidden ranks beyond visible progression (like hidden achievements) | High | Legendary/Elite ranks for super users |
| **XP breakdown on hover/tap** | Tooltip shows "50 XP from workouts, 25 XP bonus from streak" | Medium | Transparency builds trust |

---

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **XP decay/loss** | Punishment mechanics reduce motivation, contradict fitness philosophy | Keep XP and levels permanent - only move forward |
| **Pay-to-level** | Cheapens achievement, breaks core workout → XP loop | Earn XP only through actual fitness actions |
| **Competitive XP leaderboards** | Favors high-volume users, discourages beginners | Use rank tiers for status, not raw XP comparison |
| **Daily XP requirements** | Creates anxiety, punishes inconsistency we already track via streaks | Let users progress at their own pace |
| **Level-gated features** | Core app must be fully functional for all users | Use ranks for status/bragging only, not access control |
| **Complex XP sources** | Don't add workout types, reps, sets, duration tracking | Keep simple: workouts + streaks + achievements only |
| **XP gifting/trading** | Opens abuse vectors, complicates solo-focused app | XP is personal, non-transferable |
| **Weekly XP caps** | Limits engaged users, contradicts "more is better" fitness ethos | Let power users earn unlimited XP |
| **Prestige/reset system** | DOOM 2016 had this, but confusing for fitness context | Single continuous progression (1-50+ ranks) |
| **Separate mobile/web XP pools** | Same user, same progression across all devices | Firebase ensures single source of truth |

---

## Feature Dependencies

```
XP System Foundation
├── XP calculation engine → stores XP in Firestore
├── Rank calculation → derives rank from total XP
└── XP bar component → displays progress

Level-Up Celebration
├── XP System Foundation (prerequisite)
├── Existing confetti animation (reuse)
└── Toast notification system (reuse)

Streak XP Multipliers
├── XP System Foundation (prerequisite)
└── Existing streak calculation (useStats.ts)

Achievement XP Bonuses
├── XP System Foundation (prerequisite)
└── Existing achievement system (AchievementContext.tsx)

Retroactive XP Grant
├── XP calculation engine (prerequisite)
├── useAllWeeks.ts (reads all historical workouts)
└── One-time migration function

Friend Rank Visibility
├── Rank calculation (prerequisite)
└── Existing Squad system (useFriends.ts)

Dashboard Rank Timeline
├── Rank calculation (prerequisite)
└── Existing Dashboard timeline (v1.0 analytics)
```

---

## MVP Recommendation

### Phase 1: Core XP Loop (Must Have)
1. **XP calculation engine** - Workouts earn XP, store in Firestore
2. **Rank derivation** - Map total XP → military rank (10 ranks: Private → Doomguy)
3. **XP bar UI** - Persistent bar on Tracker page showing progress to next rank
4. **Level-up celebration** - Reuse existing toast + confetti for rank-ups
5. **Retroactive XP** - Calculate and grant XP for all historical workouts on first load

**Rationale:** Establishes base loop (workout → XP → rank → celebration). Users see immediate value.

### Phase 2: Depth & Integration (Should Have)
6. **Face state XP scaling** - 3 workouts = 30 XP, 4 = 50 XP, 5+ = 100 XP (non-linear rewards)
7. **Achievement XP bonuses** - Unlock achievement → instant +100 XP boost
8. **XP breakdown display** - Show "this week earned: X base + Y bonus"
9. **Friend rank visibility** - Add rank badges to Squad leaderboard
10. **Animated XP bar** - Smooth fill animation when XP increases

**Rationale:** Integrates with existing systems (achievements, friends, face states). Makes XP feel connected.

### Phase 3: Advanced Rewards (Nice to Have)
11. **Streak XP multipliers** - 4+ week streak = 1.5x XP, 12+ = 2x XP
12. **Comeback XP boost** - First week back after 3+ missed weeks earns 2x XP
13. **Week status bonuses** - Sick/vacation weeks earn small "survival XP"
14. **Historical rank timeline** - Show rank-up events in Dashboard timeline
15. **Secret elite ranks** - Hidden ranks 11-15 for ultra-dedicated users (1000+ workouts)

**Rationale:** Adds long-term engagement hooks. Not essential for v1 launch.

### Defer to Future
- Detailed XP breakdown tooltips (Phase 3 polish)
- Custom rank icons beyond basic tier system (art/design heavy)
- Rank-based profile customization (scope creep)
- Seasonal rank challenges (requires new systems)

---

## Progression Design Recommendations

### XP Curve Analysis

**Research findings:**
- **Linear progression** (10, 20, 30, 40 XP per level) is too simplistic - early levels feel slow, late levels too fast
- **Exponential progression** (each level requires X × 1.4 more XP) is industry standard - creates achievable early ranks, aspirational late ranks
- **Hybrid approach** balances early accessibility with long-term goals

**Recommended formula:** `XP_required = base × (level ^ exponent)`
- Base: 100 XP
- Exponent: 1.3
- Results: Level 1→2 = 100 XP, Level 5→6 = 420 XP, Level 10→11 = 1,357 XP

**Alternative (simpler):** Stepped linear increases
- Ranks 1-5: +100 XP per rank (100, 200, 300, 400, 500)
- Ranks 6-10: +200 XP per rank (700, 900, 1100, 1300, 1500)
- Ranks 11-15: +500 XP per rank (2000, 2500, 3000, 3500, 4000)

### XP Earning Rates

**Base workout XP (per week):**
- 1 workout = 5 XP (below target, minimal reward)
- 2 workouts = 15 XP (below target, slight increase)
- 3 workouts = 30 XP (target met, good reward)
- 4 workouts = 50 XP (ideal target, bonus)
- 5 workouts = 80 XP (god mode, significant bonus)
- 6-7 workouts = 100 XP (ultra god mode, max weekly)

**Rationale:** Non-linear scaling encourages exceeding minimum. Matches existing face state system.

**Bonus XP sources:**
- Achievement unlock: +100 XP (18 achievements = 1,800 total possible)
- 4-week streak: 1.5x multiplier on weekly XP
- 12-week streak: 2.0x multiplier on weekly XP
- Comeback week (after 3+ missed): 2.0x multiplier (one-time)
- Sick/vacation week: +10 XP (participation trophy)

### Rank Tier Structure

**Recommended military ranks (DOOM-themed):**

| Rank # | Title | Total XP Needed | Weeks to Reach* | Theme |
|--------|-------|-----------------|-----------------|-------|
| 1 | **Private** | 0 | 0 (starting) | New recruit |
| 2 | **Corporal** | 100 | 3-4 weeks | Basic training complete |
| 3 | **Sergeant** | 300 | 7-10 weeks | Squad leader |
| 4 | **Lieutenant** | 600 | 15-20 weeks | Officer rank |
| 5 | **Captain** | 1,000 | 25-30 weeks | Experienced marine |
| 6 | **Major** | 1,500 | 35-45 weeks | Elite soldier |
| 7 | **Colonel** | 2,200 | 50-65 weeks | Veteran commander |
| 8 | **General** | 3,000 | 70-90 weeks | High command |
| 9 | **Doomguy** | 4,000 | 95-120 weeks | Legendary hero |
| 10 | **Doom Slayer** | 5,500 | 130-160 weeks | Transcendent (hidden) |

*Assuming consistent 3-4 workout weeks without bonuses

**Rank naming rationale:**
- Starts with realistic military ranks (Private → General)
- Culminates in DOOM-specific titles (Doomguy, Doom Slayer)
- "Doom Slayer" as aspirational final rank creates long-term goal (2-3 years of consistency)

### Time-to-Rank Estimates

**For a user with 3-4 workouts/week (30-50 XP/week):**
- Rank 2 (Corporal): 2-3 weeks
- Rank 5 (Captain): 6 months
- Rank 9 (Doomguy): 2 years
- Rank 10 (Doom Slayer): 3+ years

**For a power user with 5-7 workouts/week + streaks (100-150 XP/week):**
- Rank 2 (Corporal): 1 week
- Rank 5 (Captain): 2-3 months
- Rank 9 (Doomguy): 8-10 months
- Rank 10 (Doom Slayer): 1.5 years

**Design insight:** System rewards both consistency (achievable ranks for average users) and dedication (faster progression for power users).

---

## UX Pattern Recommendations

### XP Bar Display Patterns

**Industry standards:**
- **Persistent visibility** - XP bar always visible on main screen (not hidden in menu)
- **Numerical feedback** - Show both "current/required" (e.g., "450 / 1000 XP") and percentage
- **Animated fill** - Bar fills smoothly when XP earned, not instant jump
- **Color coding** - Empty portion subtle gray, filled portion vibrant (use doom-gold)
- **Sound feedback** - Subtle "ding" when XP earned (respect user settings)

**Mobile-specific considerations:**
- **Thumb-friendly zone** - Place XP bar in upper third of screen (out of tap zone)
- **Compact layout** - Horizontal bar, not circular (fits mobile better)
- **Progress segments** - Show notches/segments for visual milestones

**Recommended placement for Rep & Tear:**
- Below DoomGuy face, above week tracker
- Replaces "Probability to hit target" stat (requirement to remove)
- Format: `[RANK: SERGEANT] [████████░░] 780/1000 XP`

### Level-Up Celebration Patterns

**UX best practices:**
- **Frequency check (FEAT framework)** - Celebrate milestones only, not common actions
  - Early ranks (1-3): Celebrate every rank (user needs encouragement)
  - Mid ranks (4-7): Celebrate every rank (still exciting)
  - Late ranks (8-10): Celebrate with extra intensity (rare achievement)
- **Emotion match** - Big celebration for big achievement (confetti already implemented)
- **Motion sensitivity** - Check `prefers-reduced-motion` before triggering confetti
- **Multi-modal feedback** - Toast message + confetti + optional sound

**Recommended implementation:**
- Reuse existing `AchievementToast` component with rank icon
- Reuse existing `Confetti` component
- Message format: "RANK UP! You are now a [SERGEANT]!"
- Trigger on next app load after rank-up (not mid-workout)

### XP Transparency Patterns

**User trust requires clarity:**
- **XP breakdown** - Show where XP came from ("50 base + 25 streak bonus")
- **Next level preview** - Show XP required for next rank
- **Progress indicators** - Use trend arrows (↑ faster than average, ↓ slower)
- **Historical view** - Show rank-up events in timeline (integrates with v1.0 Dashboard)

**Recommended UI additions:**
- Tooltip/modal on XP bar tap: "This week: +50 XP (4 workouts + streak bonus)"
- Settings page stats: "Total XP earned: 1,245 | Rank-ups: 5 | Next rank in: 155 XP"

---

## Integration with Existing Features

### Face State System Integration
**Current system:** 7 face states (critical → godmode) based on workouts/week
**XP integration:** Face state determines XP multiplier
- Critical (0): 0 XP
- Hurt (1): 5 XP
- Damaged (2): 15 XP
- Healthy (3): 30 XP (target)
- Strong (4): 50 XP (ideal)
- Godmode (5): 80 XP
- Ultra Godmode (6-7): 100 XP

**Benefit:** Reinforces existing gameplay loop - users already chase god mode faces

### Achievement System Integration
**Current system:** 18 achievements (streak, performance, special, hidden)
**XP integration:** Each achievement unlock grants +100 XP bonus
- Total possible from achievements: 1,800 XP
- Equivalent to ~12-18 weeks of workouts (significant boost)

**Benefit:** Gives achievements tangible progression value beyond badges

### Streak System Integration
**Current system:** Tracks current streak and longest streak (3+ workouts/week)
**XP integration:** Active streaks multiply weekly XP
- 1-3 week streak: 1.0x (base)
- 4-11 week streak: 1.5x
- 12+ week streak: 2.0x

**Example:** 4 workouts (50 base XP) × 1.5 streak bonus = 75 XP total

**Benefit:** Rewards existing behavior we already track, no new data needed

### Squad System Integration
**Current system:** Friend codes, weekly leaderboard, workout visibility
**XP integration:** Show rank badges next to usernames
- Leaderboard sorting option: "By Rank" vs "By Workouts"
- Profile displays: "Captain (Rank 5)"

**Benefit:** Social comparison motivates progression

### Dashboard Timeline Integration
**Current system:** Expandable year/month view with workout history
**XP integration:** Mark rank-up events in timeline
- Timeline entry: "Week 24, 2026 - Ranked up to Sergeant! 🎖️"
- Monthly summary: "2 rank-ups this month"

**Benefit:** Celebrates milestones in historical view

---

## Technical Complexity Estimates

### Low Complexity (1-2 days)
- Store XP value in Firestore (`users/{uid}/profile/xp`)
- Calculate rank from XP (simple lookup table)
- Display static XP bar component
- Display current rank badge
- Reuse existing celebration components

### Medium Complexity (3-5 days)
- Animated XP bar with smooth fill transitions
- Retroactive XP calculation from historical workouts
- Streak multiplier integration with existing streak logic
- Achievement bonus integration with existing unlock system
- Face state XP scaling based on workout count
- Friend rank visibility in Squad page

### High Complexity (5-7+ days)
- XP breakdown tooltip with source attribution
- Dashboard timeline rank-up markers
- Secret rank unlock logic
- Comeback boost detection (requires analyzing gaps in workout history)
- Week status bonus (sick/vacation) XP awards
- Performance optimization for XP recalculation on data changes

---

## Confidence Assessment

| Area | Confidence | Source Quality |
|------|------------|----------------|
| **XP curve formulas** | HIGH | Official game design resources, mathematical models |
| **UX patterns** | HIGH | 2026 fitness app examples, gamification research |
| **Military rank themes** | MEDIUM | DOOM 2016 echelon system found, but not canonical storyline ranks |
| **Progression timelines** | MEDIUM | Calculated from formulas, but user behavior may vary |
| **Integration complexity** | HIGH | Direct access to existing codebase confirms feasibility |
| **User expectations** | MEDIUM | Based on competitor analysis, not user research |

---

## Open Questions for Roadmap

1. **Rank granularity:** 10 ranks, 15 ranks, or 20 ranks? (Affects long-term engagement)
2. **XP visibility:** Always show numerical XP, or just progress bar? (Simplicity vs transparency)
3. **Retroactive strategy:** Grant all XP at once (big celebration) or gradually (avoid overwhelming)?
4. **Sound design:** Add level-up sound effect? (Requires new audio asset)
5. **Rank icons:** Use text-based ranks or design custom icons? (Design effort vs visual appeal)
6. **Performance:** Recalculate XP on every workout toggle, or batch updates? (UX vs efficiency)

---

## Sources

### Fitness App XP Systems
- [LEVELING: Fitness - Gamified Sports App](https://appleveling.com/en/)
- [SYSTEM: Fitness Leveling on Google Play](https://play.google.com/store/apps/details?id=com.avillalva.systemfitnessleveling&hl=en)
- [RepXP - Gamified Workout Tracker](https://repxp.app/)
- [Level Up - Gamified Fitness App](https://apps.apple.com/us/app/level-up-gamified-fitness/id6754510739)
- [Gamification For Fitness Apps](https://www.nudgenow.com/blogs/gamify-your-fitness-apps)
- [Innovative Gamification in Fitness: Top 10 Apps (2025)](https://yukaichou.com/gamification-analysis/top-10-gamification-in-fitness/)
- [Gamification in Health and Fitness Apps: Top 5 examples](https://www.plotline.so/blog/gamification-in-health-and-fitness-apps)

### XP Progression Curves
- [GameDesign Math: RPG Level-based Progression](https://www.davideaversa.it/blog/gamedesign-math-rpg-level-based-progression/)
- [Mathematics of XP - Only a Game](https://onlyagame.typepad.com/only_a_game/2006/08/mathematics_of_.html)
- [Example Level Curve Formulas for Game Progression](https://www.designthegame.com/learning/courses/course/fundamentals-level-curve-design/example-level-curve-formulas-game-progression)
- [Quantitative design - How to define XP thresholds](https://www.gamedeveloper.com/design/quantitative-design---how-to-define-xp-thresholds-)
- [How to Implement a Leveling System in RPG](https://howtomakeanrpg.com/r/a/how-to-make-an-rpg-levels.html)

### UX Patterns & Celebration Design
- [From RPGs to UX: How progress indicators affect user engagement](https://uxdesign.cc/from-rpgs-to-ux-how-progress-indicators-affect-user-engagement-8748f02d766a)
- [Fill the progress. How to design the perfect game progress bar?](https://medium.com/@MaxKosyakoff/fill-the-progress-fc0fa99cabac)
- [The over-confetti-ing of digital experiences](https://uxdesign.cc/the-over-confetti-ing-of-digital-experiences-af523745db19)
- [10 Apps That Use The Progress Bars Feature for Gamification (2025)](https://trophy.so/blog/progress-bars-feature-gamification-examples)
- [Gamification in UX: How to Boost User Engagement](https://excited.agency/blog/gamification-ux)

### Military Rank Systems in Games
- [Military Rank System - Enlisted](https://enlisted.net/en/news/show/320-military-rank-system-en/)
- [Career Rank Overview - Halo Infinite](https://www.halowaypoint.com/news/career-rank-overview-season-4)
- [Ranking Systems in Action Games](https://stinger-magazine.com/article/ranking-systems/)
- [DOOM – Player Progression and Customization](https://bethesda.net/en/article/MlNrbO4cSquoUgAEM4Kkg/doom-player-progression-and-customization)

### Workout Tracking & XP Calculation
- [How Zwift Calculates XP for Cycling Workouts](https://zwiftinsider.com/xp-for-cycling-workouts/)
- [Earn Heart Points to stay healthy - Google Fit](https://support.google.com/fit/answer/7619539?hl=en&co=GENIE.Platform%3DAndroid)
- [20+ Exercise Rewards to Grow Member Retention in 2025](https://wod.guru/blog/exercise-rewards/)
- [Paceline: Rewards for Exercise App](https://apps.apple.com/us/app/paceline-rewards-for-exercise/id1491824216)

### Mobile UI Design Best Practices
- [Fitness App UI Design: Key Principles for Engaging Workout Apps](https://stormotion.io/blog/fitness-app-ux/)
- [How to Design a Fitness App: UX/UI Best Practices](https://www.zfort.com/blog/How-to-Design-a-Fitness-App-UX-UI-Best-Practices-for-Engagement-and-Retention)
- [UX Design Principles From Top Health and Fitness Apps](https://www.superside.com/blog/ux-design-principles-fitness-apps)
- [Mobile App UI Design: Best Practices and Trends for 2025](https://www.thedroidsonroids.com/blog/mobile-app-ui-design-guide)

---

*Last updated: February 26, 2026*
*Research confidence: MEDIUM-HIGH (verified UX patterns, competitor analysis, game design principles)*
