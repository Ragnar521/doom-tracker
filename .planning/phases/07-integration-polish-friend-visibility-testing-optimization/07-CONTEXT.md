# Phase 7: Integration & Polish (Friend Visibility, Testing, Optimization) - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate the XP/rank system with Squad features so friends can see each other's ranks on the leaderboard, validate the full XP system with E2E tests, and optimize performance for production. No new XP features or UI elements beyond what phases 4-6 delivered.

</domain>

<decisions>
## Implementation Decisions

### Friend rank display
- Rank appears in leaderboard entries on Squad page (not friend list cards)
- Displayed as abbreviated rank name text (e.g., "PVT", "SGT", "CPL") below or beside display name
- Color-coded by tier: doom-gold for top ranks, doom-green for mid-tier, gray for low ranks
- Fallback: show "RCT" (Recruit) when friend has no rank data yet (pre-XP system users)

### Test coverage scope
- Cover core flows only: XP gain from workout toggle, level-up toast display, rank progression
- Skip retroactive XP calculation, guest-to-auth migration, and achievement XP bonus in E2E tests
- Use Firebase emulators (Auth + Firestore) for test backend
- Visual verification: assert level-up toast renders on screen with correct rank name
- Run on Chromium only (not all 5 browser configs) to keep CI fast with emulators

### Performance targets
- Retroactive XP calculation must complete under 2 seconds for 100+ weeks of data
- Show skeleton/placeholder loading state in XP bar area during retroactive calculation
- Debounce XP writes to Firestore (500-1000ms after last toggle) to prevent excessive writes during rapid toggling
- Low-end device testing: manual spot-check with Chrome DevTools throttling (slow 3G + 4x CPU slowdown)

### Denormalization strategy
- Store rank abbreviation (e.g., "SGT") and numeric level (e.g., 5) in profile/info document
- Do NOT store XP progress or XP-to-next-rank in profile/info
- Sync profile/info only on rank change (not every XP update) to minimize writes
- Use Firestore batch write to update stats/current and profile/info atomically on rank change
- Fallback display: "Recruit" (lowest rank) when profile/info has no rank data

### Claude's Discretion
- Exact skeleton loading state design for XP bar
- Debounce timing within 500-1000ms range
- Rank color tier breakpoints (which ranks get gold vs green vs gray)
- Test assertion granularity (exact toast text vs presence check)
- E2E test file organization (single file vs split by concern)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-integration-polish-friend-visibility-testing-optimization*
*Context gathered: 2026-02-26*
