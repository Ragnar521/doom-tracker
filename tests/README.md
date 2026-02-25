# Rep & Tear - E2E Testing Guide

This directory contains end-to-end tests for the Rep & Tear workout tracker using Playwright.

## 🚀 Quick Start

### Run All Tests

```bash
# Headless mode (like CI)
npm run test:e2e

# Interactive UI mode (recommended for development)
npm run test:e2e:ui

# Headed mode (see browser window)
npm run test:e2e:headed
```

### Debug Tests

```bash
# Debug specific test
npx playwright test --debug tests/e2e/auth.spec.ts

# Debug mode with UI
npm run test:e2e:debug
```

### View Test Report

```bash
npm run test:e2e:report
```

## 📁 Directory Structure

```
tests/
├── e2e/                  # Test spec files
│   ├── auth.spec.ts                # Authentication tests (7 tests)
│   ├── workout-tracking.spec.ts    # Workout tracking tests (16 tests)
│   └── stats.spec.ts               # Statistics/dashboard tests (6 tests)
├── fixtures/             # Test data (future use)
├── utils/                # Helper functions
│   └── setup.ts          # Common test utilities
└── README.md            # This file
```

## 🧪 Test Coverage

### Authentication Tests (`auth.spec.ts`)
- ✅ Login page display
- ✅ Email format validation
- ✅ Password length validation
- ✅ Registration mode toggle
- ✅ Password reset modal
- ✅ Matching passwords validation
- ✅ Sign in/register mode switching

### Workout Tracking Tests (`workout-tracking.spec.ts`)
- ✅ Tracker page display
- ✅ Toggle workout days on/off
- ✅ Face states (critical → hurt → damaged → healthy → strong → godmode)
- ✅ Week navigation (previous/next/today)
- ✅ Week status cycling (NORMAL/SICK/VACATION)
- ✅ Data persistence across page reload
- ✅ Boost motivation button
- ✅ Bottom navigation between pages

### Statistics Tests (`stats.spec.ts`)
- ✅ Dashboard page display
- ✅ Total workout count
- ✅ Current streak calculation
- ✅ Stats update on workout changes
- ✅ Stats panel on tracker page

## 🛠️ Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { clearStorage, waitForAppReady } from '../utils/setup';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.locator('button:has-text("Click Me")');

    // Act
    await button.click();

    // Assert
    await expect(page.locator('text="Success"')).toBeVisible();
  });
});
```

### Helper Functions

Available in `tests/utils/setup.ts`:

```typescript
// Clear browser storage
await clearStorage(page);

// Wait for app to load
await waitForAppReady(page);

// Navigate to login page
await goToLogin(page);

// Fill login form
await fillLoginForm(page, 'test@example.com', 'password123');

// Get current face state
const faceState = await getFaceState(page); // 'critical', 'hurt', etc.

// Toggle a workout day (0 = Monday, 6 = Sunday)
await toggleWorkoutDay(page, 0);

// Get count of completed workouts
const count = await getWorkoutCount(page);
```

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeouts**: 30 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Base URL**: http://localhost:5173
- **Artifacts**: Screenshots and videos on failure

### Environment Variables (`.env.test`)

Tests use mock Firebase configuration to avoid hitting production:

```env
VITE_FIREBASE_PROJECT_ID=demo-test-project
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

## 🔥 Firebase Emulators (Optional)

For advanced testing with real Firebase behavior:

### Start Emulators

```bash
# Terminal 1: Start emulators
npm run emulators

# Terminal 2: Run tests
npm run test:e2e
```

### Run Tests with Emulators

```bash
# Automatically starts/stops emulators
npm run test:with-emulators
```

## 🤖 CI/CD Integration

Tests automatically run on:
- **Pull requests** to `main` branch
- **Pushes** to `main` branch

Workflow file: `.github/workflows/playwright.yml`

### CI Features
- ✅ Linting check
- ✅ Build verification
- ✅ E2E tests on Chromium, Firefox, WebKit
- ✅ HTML report uploaded as artifact
- ✅ Videos/screenshots uploaded on failure

## 📊 Viewing CI Results

1. Go to GitHub Actions tab in your repo
2. Click on the workflow run
3. Download artifacts (reports, videos) if tests failed
4. View HTML report locally: `npx playwright show-report`

## 🐛 Debugging Failed Tests

### Locally

```bash
# Run with headed browsers
npm run test:e2e:headed

# Debug mode (step through)
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts
```

### On CI

1. Download `playwright-report` artifact from GitHub Actions
2. Extract and open `index.html` in browser
3. If tests failed, download `test-videos` artifact
4. Watch videos to see what went wrong

## 📝 Best Practices

1. **Always clear storage** in `beforeEach` for test isolation
2. **Use semantic selectors** (text, roles) over CSS selectors when possible
3. **Wait for elements** before interacting with them
4. **Use helper functions** from `setup.ts` to reduce duplication
5. **Test user flows**, not implementation details
6. **Keep tests independent** - each test should run in isolation
7. **Use descriptive test names** - "should do X when Y happens"

## 🚧 Future Improvements

- [ ] Add achievement unlocking tests
- [ ] Add friend system (Squad) tests
- [ ] Add profile editing tests
- [ ] Add visual regression tests
- [ ] Add performance testing (Lighthouse CI)
- [ ] Add unit tests for utility functions (Vitest)
- [ ] Mock Firebase more comprehensively

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI Integration](https://playwright.dev/docs/ci)

---

**Last Updated**: February 25, 2026
**Test Count**: 29 E2E tests
**Coverage**: Authentication, Workout Tracking, Statistics
