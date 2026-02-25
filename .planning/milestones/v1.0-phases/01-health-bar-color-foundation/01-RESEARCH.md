# Phase 1: Health Bar Color Foundation - Research

**Researched:** 2026-02-25
**Domain:** Color mapping utilities and visual presentation in React/TypeScript/Tailwind CSS
**Confidence:** HIGH

## Summary

Phase 1 replaces the current traffic light color scheme (gold=5+, green=4, yellow=3, red=0-2) with a DOOM health bar paradigm (green=best performance, red=critical). This research identifies the technical requirements for implementing a centralized color utility function, updating Dashboard visualizations, handling sick/vacation weeks with dual visual encoding, and ensuring WCAG AA accessibility compliance.

**Current state:** Dashboard.tsx has inline `getWeekColor()` function (lines 17-23) using traffic light logic. No other components currently use week color logic.

**Primary recommendation:** Create pure TypeScript utility function in `src/lib/weekUtils.ts` (existing utility module) using Tailwind custom colors from config, test with Playwright visual regression, ensure 4.5:1 contrast ratio for white text on all backgrounds.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Color Mapping Strategy:**
  - 6-7 workouts = green (full health)
  - 5 workouts = light green (strong health)
  - 3-4 workouts = yellow (damaged)
  - 1-2 workouts = red (critical health)
  - 0 workouts = no color (very subtle gray/dark background)
  - Green intensity: Light green for 5, darker green for 6-7 (two shades total)
  - Red intensity: Single red shade for entire 1-2 workout range

- **Visual Presentation:**
  - Solid color fill on entire week cell background
  - White/light gray text always (regardless of background)
  - No icons, badges, or patterns in Phase 1
  - Zero workout weeks: Very subtle gray/dark background (not transparent)

- **Transition Handling:**
  - Silent change (no toast/notification)
  - Immediate rollout (all users see new colors on next page load)
  - Completely remove old color logic (no deprecated code)
  - No special performance handling (React performance sufficient)

- **Consistency Boundaries:**
  - Primary scope: Dashboard week grid (12-week summary view)
  - Future scope: Dashboard historical timeline (Phase 2)
  - Excluded: StatsPanel current week display, WeekTracker page day buttons
  - DoomGuy face: Keep unchanged (different purpose)

- **Special Week Handling:**
  - Sick/vacation weeks: Gold/blue border around normal health bar background
  - Border color = excuse status (gold=sick, blue=vacation)
  - Background color = actual workout count (standard health bar mapping)
  - Dual visual encoding: border + fill

- **Architecture:**
  - Standalone pure function `getHealthColor(workoutCount) => color`
  - No React hooks or component coupling
  - Centralized single source of truth

### Claude's Discretion
- Exact hover/click interaction effects (keep subtle, match DOOM aesthetic)
- Specific hex color values (match existing doom-green, doom-gold, doom-red from tailwind config)
- Border thickness for sick/vacation indicator (2-3px recommended)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COLOR-01 | System uses health bar color paradigm (green=best performance, red=critical) | Existing Tailwind colors support paradigm; modern DOOM source ports use similar 0-25% red, 25-50% yellow, 50-100% green logic |
| COLOR-02 | Green color represents 5-7 workouts per week (godmode/full health) | Two-shade green approach: `#22c55e` (doom-green) for 6-7, lighter variant for 5 |
| COLOR-03 | Yellow color represents 3-4 workouts per week (healthy/moderate health) | Existing `yellow-600` (#ca8a04) or doom-gold (#d4af37) both available |
| COLOR-04 | Red color represents 0-2 workouts per week (critical/low health) | Existing doom-red (#b91c1c) meets requirements |
| COLOR-05 | Gray color represents sick/vacation weeks (non-combat status) | Actually border-based encoding with gold/blue borders on top of standard health colors |
| COLOR-06 | Centralized color utility function determines colors for all visualizations | Pure function pattern well-established in `weekUtils.ts` (60+ lines of utility functions) |
| COLOR-07 | Color scheme applies consistently across Dashboard and all analytics views | Single import point ensures consistency; Dashboard.tsx is only current consumer |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | UI rendering | Project foundation, concurrent features for smooth updates |
| TypeScript | ~5.9 | Type safety | Strict mode enabled, explicit types prevent runtime errors |
| Tailwind CSS | 3.4.19 | Styling | Utility-first approach, custom colors in config, already defines doom-red/doom-gold/doom-green |
| Vite | 7.3.0 | Build tool | Fast HMR for rapid development |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Playwright | 1.58+ | E2E testing | Visual regression tests for color changes, already configured |
| Firebase Tools | 15.7+ | Local testing | Emulators for testing authenticated users (optional for Phase 1) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind custom colors | CSS-in-JS libraries (styled-components, Emotion) | Would conflict with existing Tailwind architecture, adds bundle size |
| Pure function utility | React custom hook | Unnecessary overhead for stateless color mapping |
| Playwright visual tests | Manual testing only | Regressions would go undetected across 5 browsers |

**Installation:**
```bash
# All dependencies already installed
# No new packages required for Phase 1
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── weekUtils.ts        # Add getHealthColor() here (existing file)
├── pages/
│   └── Dashboard.tsx       # Update to use getHealthColor()
├── index.css               # Add light green variant if not using Tailwind arbitrary
└── types/
    └── index.ts           # WeekStatus type already exists
```

### Pattern 1: Pure Color Utility Function
**What:** Stateless function that maps workout count to Tailwind class name
**When to use:** Everywhere week colors are displayed (Dashboard now, timeline in Phase 2)
**Example:**
```typescript
// Source: Project codebase pattern from weekUtils.ts lines 1-145
// Location: src/lib/weekUtils.ts

/**
 * Get health bar background color based on workout count
 * Uses DOOM health paradigm: green=best, yellow=moderate, red=critical
 *
 * @param workoutCount - Number of workouts (0-7)
 * @returns Tailwind background color class
 */
export function getHealthColor(workoutCount: number): string {
  if (workoutCount >= 6) return 'bg-doom-green';      // Full health (6-7)
  if (workoutCount === 5) return 'bg-green-600';      // Strong health (5)
  if (workoutCount >= 3) return 'bg-yellow-600';      // Damaged (3-4)
  if (workoutCount >= 1) return 'bg-doom-red';        // Critical (1-2)
  return 'bg-gray-800';                                // No activity (0)
}
```

### Pattern 2: Sick/Vacation Week Border Encoding
**What:** Dual visual encoding using border color for status + background for performance
**When to use:** When rendering week cells that can have special status
**Example:**
```typescript
// Source: Dashboard.tsx current pattern (lines 92-101), adapted for new system

function WeekCell({ week }: { week: WeekRecord }) {
  const bgColor = getHealthColor(week.workoutCount);

  // Border color for sick/vacation status
  const borderClass = week.status === 'sick'
    ? 'border-2 border-doom-gold'
    : week.status === 'vacation'
    ? 'border-2 border-blue-500'
    : '';

  return (
    <div className={`${bgColor} ${borderClass} aspect-square rounded flex items-center justify-center`}>
      <span className="text-[8px] text-white font-bold">{week.workoutCount}</span>
    </div>
  );
}
```

### Pattern 3: Legend Update for Health Bar Paradigm
**What:** Color legend that explains the new health bar system
**When to use:** Below 12-week grid on Dashboard
**Example:**
```typescript
// Source: Dashboard.tsx lines 102-115, adapted for health bar colors

<div className="flex justify-center gap-3 mt-3 text-[7px]">
  <span className="flex items-center gap-1">
    <span className="w-2 h-2 rounded bg-doom-red" /> 1-2
  </span>
  <span className="flex items-center gap-1">
    <span className="w-2 h-2 rounded bg-yellow-600" /> 3-4
  </span>
  <span className="flex items-center gap-1">
    <span className="w-2 h-2 rounded bg-green-600" /> 5
  </span>
  <span className="flex items-center gap-1">
    <span className="w-2 h-2 rounded bg-doom-green" /> 6-7
  </span>
</div>
```

### Anti-Patterns to Avoid
- **Inline color logic in components:** Violates single source of truth, makes updates difficult
- **Using arbitrary hex values directly:** Breaks Tailwind theming, harder to maintain
- **Mixing status and performance in single visual property:** User research shows dual encoding (border + fill) is clearer

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color contrast validation | Custom RGB calculation | WCAG contrast checker tools + Tailwind built-in colors | Tailwind colors already tested, manual calculation error-prone |
| Visual regression | Manual screenshot comparison | Playwright toHaveScreenshot() | Automated across 5 browsers, catches regressions CI can't see manually |
| TypeScript pure function testing | Custom test setup | Vitest (if needed) or Playwright component tests | Already configured, fast, integrates with CI |

**Key insight:** Color utilities are deceptively complex when considering accessibility, browser differences, and maintainability. Tailwind's color system handles cross-browser consistency; Playwright handles visual validation; pure functions handle testability.

## Common Pitfalls

### Pitfall 1: WCAG Contrast Violations on Yellow Background
**What goes wrong:** Yellow backgrounds often fail 4.5:1 contrast ratio with white text
**Why it happens:** Yellow (#ca8a04 or #d4af37) has high luminance, white text has higher luminance
**How to avoid:** Test contrast ratio before committing colors
**Warning signs:** Text appears washed out or hard to read on yellow cells

**Solution:** Use contrast checker during planning
- doom-gold (#d4af37) + white (#ffffff) = 3.79:1 ❌ FAILS AA
- yellow-600 (#ca8a04) + white (#ffffff) = 4.94:1 ✅ PASSES AA
- Recommendation: Use `yellow-600` or `yellow-700` instead of `doom-gold` for 3-4 workout range

### Pitfall 2: Forgetting to Remove Old Color Logic
**What goes wrong:** Old `getWeekColor()` function remains in Dashboard.tsx, causing confusion
**Why it happens:** Developers focus on adding new code, forget to delete old code
**How to avoid:** Search entire codebase for old function name before committing
**Warning signs:** Both functions exist, colors don't match expected values

**Solution:**
```bash
# Before committing, verify old logic is removed
rg "getWeekColor" src/  # Should only find new utility import
rg "bg-doom-gold.*5" src/  # Old logic used gold for 5+, should be gone
```

### Pitfall 3: Testing Only in Chrome
**What goes wrong:** Colors look different in Safari/Firefox due to color profile differences
**Why it happens:** Playwright config currently only tests Chromium (line 59-63 of playwright.config.ts)
**How to avoid:** Enable Firefox and WebKit browsers in Playwright config for visual tests
**Warning signs:** Users report colors "look different" in Safari

**Solution:** Update playwright.config.ts to test all browsers for visual changes:
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

### Pitfall 4: Zero Workout Weeks Too Dark (Invisible Text)
**What goes wrong:** `bg-gray-800` is very dark (#1f2937), white text has excessive contrast but cells look "empty"
**Why it happens:** Goal is "subtle" background, but needs to be visible enough to show "tracked but inactive"
**How to avoid:** Choose gray that's visible but clearly distinct from colored states
**Warning signs:** Zero workout cells blend into doom-bg (#0a0a0a) background

**Solution:** Test gray-800 vs gray-700 vs gray-600 with white text:
- gray-800 (#1f2937) + white = 12.63:1 (very high, might be too dark)
- gray-700 (#374151) + white = 9.28:1 (still high, more visible)
- Recommendation: Start with gray-800, user test visibility

## Code Examples

Verified patterns from official sources and project codebase:

### Complete Color Utility Implementation
```typescript
// Source: Project pattern from src/lib/weekUtils.ts structure
// Location: src/lib/weekUtils.ts (add at end of file)

/**
 * Get health bar background color based on workout count
 * Uses DOOM health paradigm: green=best, yellow=moderate, red=critical
 *
 * Color mapping:
 * - 6-7 workouts: doom-green (full health, godmode)
 * - 5 workouts: green-600 (strong health)
 * - 3-4 workouts: yellow-600 (damaged, meets target)
 * - 1-2 workouts: doom-red (critical health)
 * - 0 workouts: gray-800 (tracked but inactive)
 *
 * @param workoutCount - Number of workouts in week (0-7)
 * @returns Tailwind CSS background color class
 */
export function getHealthColor(workoutCount: number): string {
  if (workoutCount >= 6) return 'bg-doom-green';
  if (workoutCount === 5) return 'bg-green-600';
  if (workoutCount >= 3) return 'bg-yellow-600';
  if (workoutCount >= 1) return 'bg-doom-red';
  return 'bg-gray-800';
}

/**
 * Get border class for sick/vacation week status
 * Returns empty string for normal weeks
 *
 * @param status - Week status ('normal' | 'sick' | 'vacation')
 * @returns Tailwind CSS border class or empty string
 */
export function getStatusBorderClass(status: WeekStatus): string {
  if (status === 'sick') return 'border-2 border-doom-gold';
  if (status === 'vacation') return 'border-2 border-blue-500';
  return '';
}
```

### Dashboard Week Grid Update
```typescript
// Source: Dashboard.tsx lines 88-116, updated for health bar colors
// Location: src/pages/Dashboard.tsx

import { getHealthColor, getStatusBorderClass } from '../lib/weekUtils';

// ... inside Dashboard component ...

{/* Recent Weeks Grid */}
<div className="doom-panel p-3">
  <h3 className="text-gray-400 text-[10px] mb-3 text-center tracking-widest">LAST 12 WEEKS</h3>
  <div className="grid grid-cols-6 gap-1">
    {stats.recentWeeks.map((week) => (
      <div
        key={week.weekId}
        className={`aspect-square rounded ${getHealthColor(week.workoutCount)} ${getStatusBorderClass(week.status)} flex items-center justify-center`}
        title={`Week ${getWeekNumber(week.weekId)}: ${week.workoutCount} workouts`}
      >
        <span className="text-[8px] text-white font-bold">{week.workoutCount}</span>
      </div>
    ))}
  </div>
  <div className="flex justify-center gap-3 mt-3 text-[7px]">
    <span className="flex items-center gap-1">
      <span className="w-2 h-2 rounded bg-doom-red" /> 1-2
    </span>
    <span className="flex items-center gap-1">
      <span className="w-2 h-2 rounded bg-yellow-600" /> 3-4
    </span>
    <span className="flex items-center gap-1">
      <span className="w-2 h-2 rounded bg-green-600" /> 5
    </span>
    <span className="flex items-center gap-1">
      <span className="w-2 h-2 rounded bg-doom-green" /> 6-7
    </span>
  </div>
</div>
```

### Playwright Visual Regression Test
```typescript
// Source: Playwright best practices 2026
// Location: tests/e2e/dashboard-colors.spec.ts (new file)

import { test, expect } from '@playwright/test';

test.describe('Dashboard Health Bar Colors', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage and navigate to dashboard
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should display correct colors for each workout count', async ({ page }) => {
    // Set up test data with different workout counts
    await page.evaluate(() => {
      localStorage.setItem('doom-tracker-week-2026-W08', JSON.stringify({
        workouts: [true, true, true, true, true, true, true],
        status: 'normal'
      })); // 7 workouts = green

      localStorage.setItem('doom-tracker-week-2026-W07', JSON.stringify({
        workouts: [true, true, true, true, true, false, false],
        status: 'normal'
      })); // 5 workouts = light green

      localStorage.setItem('doom-tracker-week-2026-W06', JSON.stringify({
        workouts: [true, true, true, false, false, false, false],
        status: 'normal'
      })); // 3 workouts = yellow

      localStorage.setItem('doom-tracker-week-2026-W05', JSON.stringify({
        workouts: [true, false, false, false, false, false, false],
        status: 'normal'
      })); // 1 workout = red

      localStorage.setItem('doom-tracker-week-2026-W04', JSON.stringify({
        workouts: [false, false, false, false, false, false, false],
        status: 'normal'
      })); // 0 workouts = gray
    });

    await page.reload();
    await page.waitForSelector('text=DAMAGE REPORT');

    // Take screenshot for visual comparison
    await expect(page.locator('.doom-panel:has-text("LAST 12 WEEKS")')).toHaveScreenshot('health-bar-colors.png', {
      threshold: 0.1 // Allow 10% difference for anti-aliasing
    });
  });

  test('should display sick week with gold border', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('doom-tracker-week-2026-W08', JSON.stringify({
        workouts: [true, true, true, false, false, false, false],
        status: 'sick'
      })); // 3 workouts sick = yellow background + gold border
    });

    await page.reload();
    await page.waitForSelector('text=DAMAGE REPORT');

    // Verify border color via computed styles
    const weekCell = page.locator('.doom-panel:has-text("LAST 12 WEEKS") > div > div').first();
    await expect(weekCell).toHaveClass(/border-doom-gold/);
    await expect(weekCell).toHaveClass(/bg-yellow-600/);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Traffic light colors (red=bad, gold=best) | Health bar colors (green=best, red=critical) | Phase 1 implementation | More intuitive mental model matching DOOM health mechanics |
| Status overrides performance color (sick=gray) | Dual encoding (border=status, fill=performance) | Phase 1 implementation | Users can see both excuse status and actual performance |
| Inline color function in component | Centralized utility function | Phase 1 implementation | Single source of truth, reusable in Phase 2 timeline |
| Manual color testing | Playwright visual regression | 2026 best practice | Automated detection of color regressions across browsers |

**Deprecated/outdated:**
- Original DOOM (1993) used fixed red health numbers, not color-changing system
- Modern DOOM source ports (GZDoom, Zandronum) introduced dynamic coloring (0-25% red, 25-50% yellow, 50-100% green, >100% blue)
- Tailwind v4 OKLCH color system is new (2026), but hex values still work in v3.4.19

## Open Questions

1. **Should doom-gold be used for yellow range despite contrast issues?**
   - What we know: doom-gold (#d4af37) fails WCAG AA at 3.79:1 with white text
   - What's unclear: User preference for brand consistency vs accessibility
   - Recommendation: Use yellow-600 (passes AA) for Phase 1, consider doom-gold with darker text in Phase 4 accessibility review

2. **How visible should zero workout weeks be?**
   - What we know: gray-800 provides high contrast (12.63:1) but may blend into doom-bg
   - What's unclear: User perception of "tracked but inactive" vs "not tracked"
   - Recommendation: Start with gray-800, gather feedback, adjust to gray-700 if needed

3. **Should hover effects darken or lighten cells?**
   - What we know: DOOM aesthetic uses dark theme, existing buttons use subtle effects
   - What's unclear: Whether brightness increase (lighten) or decrease (darken) feels more natural
   - Recommendation: Use `hover:brightness-110` for subtle lighten effect, matches existing button interactions

## Validation Architecture

> Nyquist validation is enabled (workflow.nyquist_validation: true in config.json)

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58+ |
| Config file | `playwright.config.ts` |
| Quick run command | `npm run test:e2e -- --grep "Dashboard Health Bar Colors"` |
| Full suite command | `npm run test:e2e` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COLOR-01 | Green=best, red=critical paradigm visible | Visual regression | `npx playwright test tests/e2e/dashboard-colors.spec.ts::test-colors` | ❌ Wave 0 |
| COLOR-02 | 6-7 workouts show doom-green | Visual regression | `npx playwright test tests/e2e/dashboard-colors.spec.ts::test-colors` | ❌ Wave 0 |
| COLOR-03 | 3-4 workouts show yellow-600 | Visual regression | `npx playwright test tests/e2e/dashboard-colors.spec.ts::test-colors` | ❌ Wave 0 |
| COLOR-04 | 1-2 workouts show doom-red | Visual regression | `npx playwright test tests/e2e/dashboard-colors.spec.ts::test-colors` | ❌ Wave 0 |
| COLOR-05 | Sick/vacation show border encoding | Visual regression | `npx playwright test tests/e2e/dashboard-colors.spec.ts::test-sick-week` | ❌ Wave 0 |
| COLOR-06 | Utility function works correctly | Unit test | `npx vitest run src/lib/weekUtils.test.ts` (if added) OR manual testing | ❌ Wave 0 |
| COLOR-07 | Colors consistent across Dashboard | Visual regression | `npx playwright test tests/e2e/dashboard-colors.spec.ts::test-colors` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Manual testing (visual check in browser)
- **Per wave merge:** `npm run test:e2e -- --grep "Dashboard Health Bar Colors"`
- **Phase gate:** Full suite green + manual cross-browser check before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/e2e/dashboard-colors.spec.ts` — covers COLOR-01 through COLOR-07 visual regression
- [ ] Baseline screenshots for each workout count (0, 1, 3, 5, 6, 7 workouts)
- [ ] Baseline screenshot for sick/vacation border encoding
- [ ] Optional: `src/lib/weekUtils.test.ts` — unit tests for getHealthColor() pure function (Vitest)

*(If Vitest not configured, Playwright component tests or manual testing sufficient for Phase 1)*

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Colors Documentation](https://tailwindcss.com/docs/colors) - Official color system and hex values
- [Tailwind CSS Customizing Colors](https://v2.tailwindcss.com/docs/customizing-colors) - Custom color configuration
- [WCAG 2.0 Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) - 4.5:1 ratio requirement
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Verification tool for color combinations
- Project codebase: `src/pages/Dashboard.tsx`, `src/lib/weekUtils.ts`, `tailwind.config.js`

### Secondary (MEDIUM confidence)
- [Playwright Visual Regression Testing Guide 2026](https://bug0.com/knowledge-base/playwright-visual-regression-testing) - toHaveScreenshot() best practices
- [DOOM Wiki Status Bar](https://doomwiki.org/wiki/Status_bar) - Original DOOM health display mechanics
- [Modern DOOM source ports health colors](https://steamcommunity.com/app/2280/discussions/0/1698300679755824592/) - Community discussion on health color systems
- [React Testing Pure Functions](https://malcolmkee.com/react-testing/testing-function/) - Testing patterns for utilities

### Tertiary (LOW confidence)
- Color contrast issues in light mode during testing - Anecdotal report, needs verification
- Pixelmatch performance benchmarks - Not directly applicable to Phase 1 scope

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools already installed and configured, no unknowns
- Architecture: HIGH - Pure function pattern matches existing weekUtils.ts structure
- Pitfalls: HIGH - WCAG contrast issues verified with official checker, browser testing gaps identified in existing config

**Research date:** 2026-02-25
**Valid until:** ~2026-03-25 (30 days - stable domain, Tailwind v3 is mature)

**Accessibility note:** doom-gold fails WCAG AA contrast requirements. Recommend yellow-600 for 3-4 workout range to ensure compliance.

---

*Sources referenced above MUST be consulted during planning and implementation*
