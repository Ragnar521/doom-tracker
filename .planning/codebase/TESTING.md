# Testing Patterns

**Analysis Date:** 2026-02-25

## Test Framework

**Runner:**
- Playwright 1.58+ (E2E testing)
- Config: `playwright.config.ts`

**Assertion Library:**
- Playwright built-in `expect` (based on Jest's expect)

**Run Commands:**
```bash
npm run test:e2e              # Run all tests (headless mode)
npm run test:e2e:ui           # Interactive UI mode (recommended)
npm run test:e2e:headed       # Run tests with browser visible
npm run test:e2e:debug        # Step-through debugging
npm run test:e2e:report       # View HTML report
```

**Additional Commands:**
```bash
npx playwright test tests/e2e/auth.spec.ts      # Run specific file
npx playwright test -g "should display login"   # Run specific test by name
npx playwright show-report                       # Open last report
```

## Test File Organization

**Location:**
- E2E tests: `tests/e2e/` directory (separate from `src/`)
- Helper utilities: `tests/utils/` directory
- Setup/teardown: `tests/setup/` directory

**Naming:**
- Pattern: `[feature].spec.ts`
- Examples:
  - `tests/e2e/auth.spec.ts` (9 tests)
  - `tests/e2e/navigation.spec.ts` (13 tests)
  - `tests/e2e/achievements.spec.ts` (placeholder)
  - `tests/e2e/achievements-authenticated.spec.ts` (future)

**Structure:**
```
tests/
├── e2e/                          # Test spec files
│   ├── auth.spec.ts             # Authentication UI tests
│   ├── navigation.spec.ts       # Navigation and routing tests
│   ├── achievements.spec.ts     # Achievement page tests
│   └── achievements-authenticated.spec.ts  # Authenticated tests
├── utils/                        # Helper functions
│   └── setup.ts                 # Test utilities (clearStorage, etc.)
├── setup/                        # Global setup/teardown
│   ├── globalSetup.ts           # Start Firebase emulators
│   └── globalTeardown.ts        # Stop emulators
└── README.md                     # Testing documentation
```

## Test Structure

**Suite Organization:**
```typescript
import { test, expect } from '@playwright/test';
import { clearStorage } from '../utils/setup';

test.describe('Authentication Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage BEFORE navigation to prevent auth state pollution
    await clearStorage(page);
    // Navigate to login page
    await page.goto('/login');
    // Wait for page to load
    await page.waitForSelector('h1:has-text("REP & TEAR")');
  });

  test('should display login page correctly', async ({ page }) => {
    // Verify main heading
    await expect(page.locator('h1:has-text("REP & TEAR")')).toBeVisible();

    // Verify other elements
    await expect(page.locator('text="UNTIL IT IS DONE"')).toBeVisible();
  });
});
```

**Patterns:**
- `test.describe()` groups related tests
- `test.beforeEach()` sets up clean state for each test
- `test()` defines individual test case
- Assertions use `await expect(...).toBeVisible()` (built-in auto-waiting)

**Test Naming:**
- Format: `'should [action] when [condition]'` or `'should [expected behavior]'`
- Examples:
  - `'should display login page correctly'`
  - `'should toggle to registration mode'`
  - `'should validate empty email on submit'`
  - `'should redirect to login when accessing protected routes without auth'`

## Mocking

**Framework:** Not used yet (tests target public UI without authentication)

**Patterns:**
- Future: Firebase Emulator for authenticated tests (infrastructure ready)
- No third-party mocking libraries (MSW, nock, etc.)
- Storage mocking via `clearStorage()` helper

**What to Mock (Future):**
- Firebase Firestore queries (use emulators)
- Firebase Authentication (use emulators)
- Network requests to external APIs (if any)

**What NOT to Mock:**
- Browser APIs (localStorage, sessionStorage) - use real APIs
- DOM interactions - test real user flows
- Component rendering - test actual components

## Fixtures and Factories

**Test Data:**
- Currently minimal (public pages don't require data)
- Future: User fixtures for authenticated tests
- Future: Week data fixtures for workout tracking tests

**Location:**
- Helpers in `tests/utils/setup.ts`
- Future fixtures may live in `tests/fixtures/` directory

**Helper Functions:**

```typescript
/**
 * Clear all browser storage before tests
 */
export async function clearStorage(page: Page) {
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch {
    // Ignore errors if storage is not accessible yet
  }
}

/**
 * Wait for the app to be fully loaded and ready
 */
export async function waitForAppReady(page: Page) {
  await page.waitForSelector('h1:has-text("REP & TEAR")', { timeout: 10000 });
}

/**
 * Navigate to login page and verify it's loaded
 */
export async function goToLogin(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('h1:has-text("REP & TEAR")');
}

/**
 * Fill in login form with email and password
 */
export async function fillLoginForm(page: Page, email: string, password: string) {
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
}

/**
 * Get the current face state from DoomGuy image
 * Returns: 'critical', 'hurt', 'damaged', 'healthy', 'strong', or 'godmode'
 */
export async function getFaceState(page: Page): Promise<string> {
  const faceImage = page.locator('img[alt*="DoomGuy"]').first();
  const faceSrc = await faceImage.getAttribute('src');

  if (!faceSrc) return 'unknown';

  if (faceSrc.includes('critical')) return 'critical';
  if (faceSrc.includes('hurt')) return 'hurt';
  if (faceSrc.includes('damaged')) return 'damaged';
  if (faceSrc.includes('healthy')) return 'healthy';
  if (faceSrc.includes('strong')) return 'strong';
  if (faceSrc.includes('godmode')) return 'godmode';

  return 'unknown';
}

/**
 * Toggle a workout day (0 = Monday, 6 = Sunday)
 */
export async function toggleWorkoutDay(page: Page, dayIndex: number) {
  const dayButton = page.locator(`[data-day="${dayIndex}"]`).first();
  await dayButton.click();
  // No explicit wait needed - callers should assert on expected state
  // This avoids flaky fixed delays and lets tests fail fast if state doesn't update
}

/**
 * Get count of completed workouts this week
 */
export async function getWorkoutCount(page: Page): Promise<number> {
  let count = 0;

  for (let i = 0; i < 7; i++) {
    const dayButton = page.locator(`[data-day="${i}"]`).first();
    // Use data attribute instead of CSS classes for stable test selectors
    const isCompleted = await dayButton.getAttribute('data-completed');

    if (isCompleted === 'true') {
      count++;
    }
  }

  return count;
}
```

## Coverage

**Requirements:** None enforced (E2E coverage is conceptual, not code-coverage-based)

**Current Coverage:**
- ✅ Authentication page UI (9 tests)
- ✅ Navigation and routing (13 tests)
- ⏳ Workout tracking (future)
- ⏳ Face state transitions (future)
- ⏳ Achievements system (future)
- ⏳ Squad/Friends features (future - requires emulators)

**View Coverage:**
- No code coverage tool configured
- Test results viewable via: `npm run test:e2e:report`

## Test Types

**Unit Tests:**
- Not implemented yet
- Future: Test utility functions (`weekUtils.ts`, `achievements.ts`)
- Future: Test custom hooks in isolation
- Recommended framework: Vitest (for Vite projects)

**Integration Tests:**
- Not implemented yet
- Future: Test component + hook interactions
- Future: Test full user flows with mocked Firebase

**E2E Tests:**
- Current focus (45 tests passing: 9 scenarios × 5 browsers)
- Framework: Playwright
- Tests critical paths without mocking
- Cross-browser testing (Chromium only in current config, Firefox/Safari available)

**Test Environment:**
- Dev server: `http://localhost:5173` (Vite)
- Firebase Emulators: Auth (port 9099), Firestore (port 8080), UI (port 4000)
- CI: GitHub Actions with Node.js 20

## Common Patterns

**Async Testing:**
```typescript
test('should show password reset modal', async ({ page }) => {
  // Click to open modal
  await page.locator('text="FORGOT PASSWORD?"').click();

  // Playwright's expect() auto-waits for element to appear
  await expect(page.locator('text="RESET THE PASSWORD"')).toBeVisible();

  // Should have send button
  await expect(page.locator('button:has-text("SEND RESET EMAIL")')).toBeVisible();
});
```

**Error Testing:**
```typescript
test('should validate empty email on submit', async ({ page }) => {
  // Leave email empty, add password
  await page.fill('input[type="password"]', 'password123');

  // Click sign in
  await page.locator('button[type="submit"]:has-text("SIGN IN")').click();

  // Should show error message (auto-waits for element)
  await expect(page.locator('text=/EMAIL IS REQUIRED/i')).toBeVisible();
});
```

**Form Testing:**
```typescript
test('should validate matching passwords in register mode', async ({ page }) => {
  // Switch to register mode
  await page.locator('button:has-text("REGISTER")').first().click();

  // Wait for register mode to be active
  await expect(page.locator('button[type="submit"]:has-text("CREATE ACCOUNT")')).toBeVisible();

  // Fill form with non-matching passwords
  await page.fill('input[type="email"]', 'test@example.com');

  // Fill password fields
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.nth(0).fill('password123');
  await passwordInputs.nth(1).fill('differentpassword');

  // Click create account
  await page.locator('button[type="submit"]:has-text("CREATE ACCOUNT")').click();

  // Should show error about passwords not matching (auto-waits for element)
  await expect(page.locator('text=/PASSWORDS DO NOT MATCH/i')).toBeVisible();
});
```

**Navigation Testing:**
```typescript
test('should redirect to login when accessing protected routes without auth', async ({ page }) => {
  // Try to access tracker page (main page)
  await page.goto('/');

  // Should redirect to /login
  await page.waitForURL('**/login');
  expect(page.url()).toContain('/login');

  // Should show login page
  await expect(page.locator('h1:has-text("REP & TEAR")')).toBeVisible();
});
```

**Performance Testing:**
```typescript
test('should load login page quickly', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/login');
  await page.waitForSelector('h1:has-text("REP & TEAR")');

  const loadTime = Date.now() - startTime;

  // Page should load in under 5 seconds (generous timeout)
  expect(loadTime).toBeLessThan(5000);

  // Verify page is interactive
  await expect(page.locator('input[type="email"]')).toBeVisible();
});
```

## Playwright Configuration

**Key Settings (`playwright.config.ts`):**

```typescript
{
  testDir: './tests/e2e',
  timeout: 30 * 1000,              // 30 seconds per test
  fullyParallel: true,              // Run tests in parallel
  forbidOnly: !!process.env.CI,    // Fail CI if test.only left in
  retries: process.env.CI ? 2 : 0, // Retry failed tests on CI
  workers: process.env.CI ? 2 : undefined,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',       // Collect trace on retry
    screenshot: 'only-on-failure', // Screenshot on failure
    video: 'retain-on-failure',    // Video on failure
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Can add more browsers: Firefox, Safari, Mobile
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,           // 2 minutes to start
  },

  globalSetup: './tests/setup/globalSetup.ts',
  globalTeardown: './tests/setup/globalTeardown.ts',
}
```

**Browser Coverage:**
- Currently: Chromium only (for speed)
- Available: Firefox, Safari (WebKit), Mobile Chrome, Mobile Safari
- CI runs all browsers on pull requests

## Firebase Emulators (For Authenticated Tests)

**Setup:**
```bash
# Terminal 1: Start emulators
npm run emulators

# Terminal 2: Run tests
npm run test:e2e
```

**Emulator Services:**
- Auth Emulator: `localhost:9099`
- Firestore Emulator: `localhost:8080`
- Emulator UI: `localhost:4000`

**Global Setup (`tests/setup/globalSetup.ts`):**
```typescript
async function globalSetup() {
  try {
    await startEmulators();
    process.env.EMULATORS_AVAILABLE = 'true';
  } catch {
    process.env.EMULATORS_AVAILABLE = 'false';
    console.warn('⚠️  Firebase Emulators unavailable — authenticated tests will be skipped');
    console.warn('   Install Java 21+ to run authenticated tests');
  }
}
```

**When to Use:**
- Testing authenticated user flows
- Testing Firestore read/write operations
- Testing friend system, achievements, workout tracking
- Current tests work without emulators (login page is public)

## CI/CD Integration

**GitHub Actions Workflow (`.github/workflows/playwright.yml`):**

1. **Setup:** Node.js 20, install dependencies, install Playwright browsers
2. **Lint:** Run ESLint to catch code quality issues
3. **Build:** Verify project builds successfully
4. **Test:** Run all Playwright tests across browsers
5. **Artifacts:** Upload HTML reports (30 days) and videos on failure (7 days)

**Triggers:**
- Pull requests to `main`
- Pushes to `main`

**Viewing Results:**
1. Go to GitHub → Actions tab
2. Click on the workflow run
3. Download `playwright-report` artifact (if tests failed)
4. Download `test-videos` artifact to see what went wrong
5. Open `index.html` from report locally

## Debugging Strategies

**Locally:**
```bash
# Run with headed browsers (see what happens)
npm run test:e2e:headed

# Step-through debugging
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run single test by name
npx playwright test -g "should display login page"

# Interactive UI mode (best for development)
npm run test:e2e:ui
```

**On CI:**
- Download `playwright-report` artifact from GitHub Actions
- Download `test-videos` artifact to see what went wrong
- Open `index.html` from report to see detailed results
- Check screenshots in artifacts for visual debugging

**Playwright Inspector:**
- Pause execution: `await page.pause()`
- Step through test line by line
- Inspect page state in DevTools
- View console logs and network requests

## Best Practices

**Selectors:**
1. Prefer semantic selectors (text, roles) over CSS selectors
2. Use `data-` attributes for stable test selectors (e.g., `data-day`, `data-completed`)
3. Use `.first()` to avoid ambiguity when multiple matches exist
4. Avoid brittle selectors (class names can change)

**Examples:**
```typescript
// ✅ Good: Semantic selector
await page.locator('button:has-text("SIGN IN")').click();

// ✅ Good: Data attribute
await page.locator('[data-day="0"]').click();

// ✅ Good: Role-based
await page.getByRole('button', { name: 'SIGN IN' }).click();

// ❌ Avoid: CSS class (brittle)
await page.locator('.doom-button.primary').click();
```

**Waiting:**
1. Always use Playwright's built-in auto-waiting (expect, click, fill)
2. Avoid fixed delays (`page.waitForTimeout()`) - causes flaky tests
3. Wait for specific conditions (`waitForSelector`, `waitForURL`)
4. Use `waitForLoadState()` only when necessary (usually auto-handled)

**Test Isolation:**
1. Clear storage in `beforeEach` for clean state
2. Each test should run independently (no shared state)
3. Tests should pass when run in any order
4. Use `clearStorage()` helper consistently

**Assertions:**
1. Use Playwright's `expect()` for auto-retry behavior
2. Chain assertions for readability
3. Use descriptive assertion messages (optional second param)
4. Assert on visible elements, not implementation details

**Error Handling:**
```typescript
// ✅ Good: Graceful handling with fallback
await page.waitForSelector('text=/ERROR/i', { timeout: 3000 }).catch(() => {});

// ✅ Good: Try-catch for optional operations
try {
  await page.evaluate(() => {
    localStorage.clear();
  });
} catch {
  // Ignore if storage not accessible yet
}
```

## Future Test Coverage (TODO)

**High Priority:**
- [ ] Workout tracking tests (toggle workouts, week navigation)
- [ ] Face state transition tests (critical → godmode)
- [ ] Stats calculation tests (streaks, totals)
- [ ] Achievement unlocking tests

**Medium Priority:**
- [ ] Dashboard analytics tests
- [ ] Week status tests (normal/sick/vacation)
- [ ] Offline behavior tests

**Low Priority (Requires Emulators):**
- [ ] Squad system tests (add/remove friends)
- [ ] Profile editing tests
- [ ] Firebase sync tests

## Test Maintenance

**When Adding Features:**
1. Write tests BEFORE or ALONGSIDE feature implementation (TDD encouraged)
2. Test happy path (success flow)
3. Test error cases (validation, network errors)
4. Test edge cases (empty states, boundaries)
5. Update `tests/README.md` if adding new test utilities

**When Changing UI:**
1. Update selectors in affected tests
2. Run tests locally to verify they still pass
3. Consider if helper functions need updates
4. CI will catch any missed changes

**When Refactoring:**
1. Tests should still pass without modification (if testing behavior, not implementation)
2. If tests fail, it's a signal the refactor changed behavior
3. Update tests only if behavior intentionally changed

---

*Testing analysis: 2026-02-25*
