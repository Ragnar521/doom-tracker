---
phase: 08-rank-showcase
plan: 00
subsystem: testing
tags: [wave-0, test-infrastructure, nyquist-compliance]
dependency_graph:
  requires: []
  provides:
    - rank-showcase.spec.ts (7 test stubs)
    - setup.ts helpers (getRankCards, getCurrentRankCard, getGuestRankMessage)
  affects:
    - tests/e2e/rank-showcase.spec.ts
    - tests/utils/setup.ts
tech_stack:
  added: []
  patterns:
    - Playwright test.fixme() for pending tests
    - Data-testid contract for component implementation
    - Helper function pattern for test utilities
key_files:
  created:
    - tests/e2e/rank-showcase.spec.ts
  modified:
    - tests/utils/setup.ts
decisions:
  - "Use test.fixme() instead of test.skip() to signal 'known unimplemented' vs 'intentionally excluded'"
  - "Separate describe blocks for authenticated vs guest tests (guest tests don't require emulators)"
  - "Data-testid contract: rank-card elements with data-current='true' for current rank"
  - "Helper functions follow existing pattern from setup.ts (return locator, not count/text)"
metrics:
  duration: "2m 16s"
  tasks_completed: 1
  tests_created: 7
  helper_functions_added: 3
  completed_date: "2026-03-26"
---

# Phase 08 Plan 00: Rank Showcase Test Infrastructure

**One-liner:** Created 7 E2E test stubs covering all RANK requirements with 3 helper functions for Wave 1 implementation verification.

## Overview

Wave 0 test infrastructure for the Rank Showcase feature. Establishes test stubs and helper functions before implementation begins, satisfying Nyquist compliance requirement from VALIDATION.md.

## What Was Built

### Test Stubs (7 tests)

**Authenticated Tests (6 tests):**
1. **RANK-01:** should display all 15 ranks
2. **RANK-02:** should show rank details for each card
3. **RANK-03:** should highlight current rank with gold glow
4. **RANK-04:** should show earned and locked rank states
5. **RANK-05:** should display rank showcase above achievements section
6. **RANK-06:** should show progress indicator on current rank

**Guest Tests (1 test):**
7. **RANK-07:** should show sign-in message for guest users

### Helper Functions (3 functions)

Added to `tests/utils/setup.ts`:

```typescript
// Get all rank cards on the Achievements page
export async function getRankCards(page: Page)

// Get the current rank card (the one with gold glow)
export async function getCurrentRankCard(page: Page)

// Get the guest sign-in message shown when not authenticated
export async function getGuestRankMessage(page: Page)
```

## Technical Implementation

### Data-testid Contract

For Plan 08-01 (Wave 1 implementation), the following data attributes are required:

- Each rank card element: `data-testid="rank-card"`
- Current rank card additionally: `data-current="true"`

This ensures test selectors work when implementation lands.

### Test Structure

- **Authenticated tests:** Require Firebase Emulators (skip if `EMULATORS_AVAILABLE !== 'true'`)
- **Guest tests:** Work without emulators (no skip condition)
- **Pending state:** All tests marked with `test.fixme()` to pass in CI without implementation

## Deviations from Plan

None - plan executed exactly as written.

## Integration Points

- `tests/utils/mockAuth.ts` - Uses `signInTestUser()` for authenticated test setup
- `tests/e2e/achievements-authenticated.spec.ts` - Follows same pattern for authenticated tests
- `tests/utils/setup.ts` - Extends existing helper function pattern

## Testing

### Automated Verification

```bash
# List all test stubs (7 tests shown)
npx playwright test tests/e2e/rank-showcase.spec.ts --list

# TypeScript compilation (passes without errors)
npx tsc --noEmit

# Full E2E suite (39 passed, 15 skipped including 7 new fixme tests)
npm run test:e2e
```

### Results

- ✅ 7 test stubs listed by Playwright
- ✅ TypeScript compiles without errors
- ✅ All tests pass in CI (fixme tests gracefully skipped)
- ✅ No breaking changes to existing test suite (39 tests still passing)

## Self-Check: PASSED

**Created files exist:**
```bash
[ -f "tests/e2e/rank-showcase.spec.ts" ] && echo "FOUND: tests/e2e/rank-showcase.spec.ts" || echo "MISSING: tests/e2e/rank-showcase.spec.ts"
```
✅ FOUND: tests/e2e/rank-showcase.spec.ts

**Commits exist:**
```bash
git log --oneline --all | grep -q "849d725" && echo "FOUND: 849d725" || echo "MISSING: 849d725"
```
✅ FOUND: 849d725

**Helper functions exist:**
```bash
grep -q "getRankCards" tests/utils/setup.ts && echo "FOUND: getRankCards" || echo "MISSING: getRankCards"
grep -q "getCurrentRankCard" tests/utils/setup.ts && echo "FOUND: getCurrentRankCard" || echo "MISSING: getCurrentRankCard"
grep -q "getGuestRankMessage" tests/utils/setup.ts && echo "FOUND: getGuestRankMessage" || echo "MISSING: getGuestRankMessage"
```
✅ FOUND: getRankCards
✅ FOUND: getCurrentRankCard
✅ FOUND: getGuestRankMessage

## Next Steps

**For Plan 08-01 (Wave 1 - Implementation):**

1. Create `src/components/RankShowcase.tsx` component
2. Integrate into `src/pages/Achievements.tsx`
3. Implement rank card rendering with data-testid attributes
4. Add CSS for current rank glow and locked state styling
5. Unmark tests from fixme to active (remove `test.fixme()` wrapper)
6. Run tests to verify implementation matches requirements

## Files Modified

### Created
- `tests/e2e/rank-showcase.spec.ts` (166 lines) - 7 test stubs for RANK-01 through RANK-07

### Modified
- `tests/utils/setup.ts` (+24 lines) - 3 helper functions for rank showcase testing

---

*Plan 08-00 completed: 2026-03-26*
*Duration: 2m 16s*
*Status: ✅ All requirements satisfied*
