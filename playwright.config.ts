import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Rep & Tear E2E tests
 *
 * This config:
 * - Runs tests against local dev server (localhost:5173)
 * - Tests across Chrome, Firefox, Safari, and mobile devices
 * - Captures screenshots/videos on failure for debugging
 * - Retries failed tests in CI environment
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

  // Opt out of parallel tests on CI (more stable)
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: process.env.CI
    ? [['html'], ['github']] // GitHub Actions annotations + HTML report
    : [['html'], ['list']],  // Local: HTML report + console output

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

  // Test against multiple browsers and devices
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewport testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Start dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI, // Reuse existing server in dev
    timeout: 120 * 1000, // 2 minutes to start
  },
});
