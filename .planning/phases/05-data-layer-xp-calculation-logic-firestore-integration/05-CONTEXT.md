# Phase 5: Data Layer (XP Calculation Logic & Firestore Integration) - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the XP calculation engine, persistent Firestore storage, and retroactive XP support for existing users. This phase produces the useXP hook, Firestore read/write logic, retroactive calculation flow, and achievement XP bonus integration. No UI components or visual changes — those belong in Phase 6.

Requirements covered: XP-02, XP-04, XP-05, RANK-03

</domain>

<decisions>
## Implementation Decisions

### Retroactive XP flow
- Auto-triggers on first load when no XP data exists in stats/current document
- Same flow handles both "existing user after XP update" and "signed-in user on new device"
- If XP data already exists in Firestore, trust it — no recalculation
- On failure (network error reading historical weeks), don't persist partial results — retry silently on next app load
- No user-facing feedback during retroactive calculation (Claude's discretion on whether to show a subtle loading state)
- No summary toast after retroactive XP is calculated — user discovers their rank naturally
- Level-up toasts are suppressed during retroactive calculation (per RANK-03)

### Guest-to-auth migration
- XP requires sign-in — guest users do NOT see or earn XP (no LocalStorage XP)
- When a guest signs in and workout data migrates to Firestore, XP is recalculated fresh from the migrated Firestore data
- LocalStorage XP is never created, so no discard logic needed
- This simplifies the data layer: XP only exists in Firestore

### XP trigger timing
- XP recalculates immediately on every workout toggle (no debouncing) — formula is pure and fast
- XP persists to Firestore atomically in the same write operation as the workout toggle — XP is always consistent with workout data
- Achievement bonus (+100 XP) is applied with a slight delay for dramatic effect — achievement toast appears first, then XP increments after a beat
- When toggling workouts on past weeks, use delta-based recalculation (compute XP change for the modified week, add/subtract from total) rather than full history recalculation

### Firestore data shape
- XP data lives in the existing `users/{uid}/stats/current` document (no new subcollection)
- Store running totals only: totalXP, currentRank (index), achievementXP — no per-week XP history
- Streak length stays derived from week data (existing useStats logic) — not cached in stats doc
- Per-week XP is recalculable from workout data using Phase 4 formulas, so no need to persist it

### Hook architecture
- New standalone `useXP` hook, separate from useStats
- useXP consumes output from useStats (streak, workout counts) and useAllWeeks (historical data)
- Clean separation: useStats handles workout/streak logic, useXP handles XP/rank logic
- Proper memoization with primitive dependencies to prevent infinite loops (per success criteria)

### Claude's Discretion
- Whether to show a subtle loading state during retroactive calculation (based on expected speed)
- Exact delay duration for achievement XP bonus animation
- Internal implementation of delta-based XP recalculation
- Error handling details for Firestore write failures
- How to structure the atomic workout + XP write (batch write vs transaction)

</decisions>

<specifics>
## Specific Ideas

- Achievement bonus should feel like a reward moment — toast first, then XP ticks up. Not simultaneous.
- Delta-based recalculation for past-week edits keeps the app fast even with years of history
- "No guest XP" simplifies the entire data layer — XP is a Firestore-only concern
- The retroactive flow should be invisible to the user — they just see their rank populated on first load

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-data-layer-xp-calculation-logic-firestore-integration*
*Context gathered: 2026-02-26*
