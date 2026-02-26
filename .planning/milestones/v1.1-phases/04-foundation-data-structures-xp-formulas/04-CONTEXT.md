# Phase 4: Foundation (Data Structures & XP Formulas) - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the data model, rank definitions, and XP calculation rules for the XP & Levels system. This phase produces TypeScript types, rank configuration, and XP formula logic. No UI components, no Firestore persistence, no user-facing changes.

Requirements covered: XP-01, XP-03, RANK-01

</domain>

<decisions>
## Implementation Decisions

### Rank names & progression
- 15 ranks following DOOM military rank naming (Private through Doom Slayer)
- Exponential XP curve — each rank takes significantly more XP than the last
- Early ranks achievable in days, final rank (Doom Slayer) should take ~2 years of consistent 4 workouts/week
- Each rank carries metadata: name, XP threshold, color, and a short DOOM-flavored tagline (e.g., "Fresh meat" for Private, "Rip and tear" for Doom Slayer)

### XP formula tuning
- Non-linear per-week scaling based on workout count (1 workout = low XP, 6-7 = high XP)
- Exact XP values are Claude's discretion — preserve the non-linear feel where hitting 3+ workouts is the inflection point
- XP updates in real-time when user toggles workout days on/off (not calculated at week-end)
- XP adjusts both ways — toggling a workout OFF recalculates and reduces XP for that week
- Sick/vacation weeks earn 0 XP (consistent with not counting toward streaks)

### Streak bonus
- Streak multiplier applies to workout XP only (achievement bonus of +100 XP stays flat, unaffected by multiplier)
- Number of tiers and exact multiplier values are Claude's discretion (requirements suggest 1.5x at 4+ weeks, 2x at 12+ weeks as starting point)
- Whether multiplier caps or keeps growing beyond 2x is Claude's discretion, guided by the ~2 year Doom Slayer target
- Breaking a streak resets the multiplier immediately to 1x (no gradual step-down)

### Claude's Discretion
- Exact XP values per workout count (maintain non-linear curve, tune for 2-year Doom Slayer target)
- Number of streak bonus tiers and specific multiplier values
- Whether streak multiplier caps at 2x or grows for very long streaks
- Exact XP thresholds for each of the 15 ranks
- Specific rank names, colors, and taglines (within DOOM military theme)
- Type structure design (XPData, Rank, LevelUp interfaces)

</decisions>

<specifics>
## Specific Ideas

- Ranks must feel distinctly DOOM — military ranks that escalate into DOOM lore territory
- The exponential curve should make early progression feel rewarding (hook) while making Doom Slayer feel truly earned (~2 years)
- Real-time XP feedback on toggle means the formula needs to be pure and fast (no async, no side effects)
- XP going down on workout-off toggle keeps the system honest — no gaming by toggling on/off

</specifics>

<deferred>
## Deferred Ideas

- Comeback XP boost after missed weeks (GAM-01 in future requirements)
- Small survival XP for sick/vacation weeks (GAM-02 — user explicitly chose 0 XP for these)
- Secret elite ranks beyond rank 15 (GAM-03 in future requirements)

</deferred>

---

*Phase: 04-foundation-data-structures-xp-formulas*
*Context gathered: 2026-02-26*
