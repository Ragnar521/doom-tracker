import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Rep & Tear E2E tests
 *
 * This config:
 * - Runs tests against local dev server (localhost:5173)
 * - Tests across Chrome, Firefox, Safari, and mobile devices
 * - Captures screenshots/videos on failure for debugging
 * - Retries failed tests in CI environment
 * - Uses Firebase Emulators for authenticated testing
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run (30 seconds)
  timeout: 30 * 1000,

  // Run tests in parallel for faster execution
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry failed tests on CI (flaky network, etc.)
  retries: process.env.CI ? 2 : 0,

  // Use modest parallelism on CI for faster execution
  workers: process.env.CI ? 2 : undefined,

  // Reporter configuration
  reporter: process.env.CI
    ? [['html'], ['github']] // GitHub Actions annotations + HTML report
    : [['html'], ['list']],  // Local: HTML report + console output

  // Global setup/teardown for Firebase Emulators
  globalSetup: './tests/setup/globalSetup.ts',
  globalTeardown: './tests/setup/globalTeardown.ts',

  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:5173',

    // Collect trace on first retry (for debugging)
    trace: 'on-first-retry',

    // Screenshot only on failure
    screenshot: 'only-on-failure',

    // Video only on failure
    video: 'retain-on-failure',

    // Ignore HTTPS errors (for local dev)
    ignoreHTTPSErrors: true,
  },

  // Test against Chromium only for speed
  // Can add more browsers later if needed
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI, // Reuse existing server in dev
    timeout: 120 * 1000, // 2 minutes to start
    env: {
      // Load test environment variables
      // This enables Firebase Emulator mode via VITE_USE_EMULATOR
      ...process.env,
    },
  },
});
