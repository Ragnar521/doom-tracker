---
phase: 8
slug: rank-showcase
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-26
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58+ |
| **Config file** | playwright.config.ts |
| **Quick run command** | `npm run test:e2e` |
| **Full suite command** | `npm run test:e2e` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:e2e`
- **After every plan wave:** Run `npm run test:e2e`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-00-01 | 00 | 0 | ALL | Infra | `npx playwright test tests/e2e/rank-showcase.spec.ts --list` | ✅ W0 | ⬜ pending |
| 08-01-01 | 01 | 1 | RANK-01 | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts -g "all 15 ranks"` | ✅ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | RANK-02 | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts -g "rank details"` | ✅ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | RANK-03 | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts -g "current rank highlight"` | ✅ W0 | ⬜ pending |
| 08-01-04 | 01 | 1 | RANK-04 | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts -g "earned locked states"` | ✅ W0 | ⬜ pending |
| 08-01-05 | 01 | 1 | RANK-05 | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts -g "above achievements"` | ✅ W0 | ⬜ pending |
| 08-01-06 | 01 | 1 | RANK-06 | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts -g "progress indicator"` | ✅ W0 | ⬜ pending |
| 08-01-07 | 01 | 1 | RANK-07 | E2E | `npx playwright test tests/e2e/rank-showcase.spec.ts -g "guest user"` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `tests/e2e/rank-showcase.spec.ts` — stubs for RANK-01 through RANK-07 (7 scenarios)
- [x] `tests/utils/setup.ts` — add helpers: getRankCards, getCurrentRankCard, getGuestRankMessage
- [ ] Firebase emulators required for authenticated user testing

*Note: Wave 0 plan (08-00-PLAN.md) creates test infrastructure. Plan 08-01 depends on it (wave 1).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| God-mode-glow animation visual quality | RANK-03 | CSS animation visual fidelity cannot be asserted programmatically | Visually verify current rank card has pulsing gold glow, compare to DoomFace god-mode glow |
| Mobile scroll UX | RANK-01 | Scroll behavior feel is subjective | On mobile viewport, verify all 15 ranks are scrollable and readable |
| Tailwind color preservation in prod build | RANK-02 | Build-time purge behavior varies | Run `npm run build`, serve locally, verify all 15 rank colors render correctly |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
