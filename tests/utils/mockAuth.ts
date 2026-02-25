import { Page } from '@playwright/test';

/**
 * Test user credentials for Firebase Emulator
 */
export const TEST_USER = {
  email: 'testuser@playwright.com',
  password: 'TestPassword123!',
  displayName: 'Test Marine',
};

/**
 * Enable Firebase Emulator mode
 *
 * Sets a flag in localStorage that tells the app to connect to
 * Firebase Emulators instead of production.
 *
 * Must be called BEFORE navigating to any page.
 *
 * @param page - Playwright page object
 */
export async function enableEmulatorMode(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('USE_FIREBASE_EMULATOR', 'true');
  });
}

/**
 * Sign in a test user using Firebase Emulator
 *
 * Creates the user if it doesn't exist, then signs in.
 * Call this AFTER navigating to the login page.
 *
 * @param page - Playwright page object
 */
export async function signInTestUser(page: Page) {
  // Navigate to login page
  await page.goto('/login');

  // Wait for page to load
  await page.waitForSelector('h1:has-text("REP & TEAR")');

  // Try signing in first (user might already exist from previous tests)
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.locator('button[type="submit"]:has-text("SIGN IN")').click();

  // Wait to see what happens
  await page.waitForTimeout(2000);

  let currentUrl = page.url();

  // If successfully signed in, we're done
  if (!currentUrl.includes('/login')) {
    console.log('✓ Test user authenticated (existing user)');
    return;
  }

  // Still on login page - check for error
  const userNotFound = await page.locator('text=/USER NOT FOUND/i').isVisible().catch(() => false);

  if (userNotFound) {
    // User doesn't exist - create account
    await page.locator('button:has-text("REGISTER")').first().click();
    await page.waitForSelector('button[type="submit"]:has-text("CREATE ACCOUNT")');

    // Fill in registration form
    await page.fill('input[type="email"]', TEST_USER.email);

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(TEST_USER.password);
    await passwordInputs.nth(1).fill(TEST_USER.password);

    // Create account
    await page.locator('button[type="submit"]:has-text("CREATE ACCOUNT")').click();
    await page.waitForTimeout(3000); // Wait for account creation

    currentUrl = page.url();

    if (!currentUrl.includes('/login')) {
      console.log('✓ Test user authenticated (new user created)');
      return;
    }
  }

  // Check for other errors (wrong password, etc.)
  const wrongPassword = await page.locator('text=/WRONG PASSWORD/i').isVisible().catch(() => false);
  const emailInUse = await page.locator('text=/EMAIL ALREADY IN USE/i').isVisible().catch(() => false);

  if (wrongPassword) {
    throw new Error('Test user exists with different password');
  }

  if (emailInUse) {
    // User exists, try logging in again (might have failed first time)
    await page.locator('button:has-text("LOGIN")').first().click();
    await page.waitForSelector('button[type="submit"]:has-text("SIGN IN")');

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.locator('button[type="submit"]:has-text("SIGN IN")').click();

    await page.waitForTimeout(2000);
    currentUrl = page.url();

    if (!currentUrl.includes('/login')) {
      console.log('✓ Test user authenticated (retry after email in use)');
      return;
    }
  }

  // Final check - are we authenticated?
  if (currentUrl.includes('/login')) {
    throw new Error(`Failed to authenticate test user. URL: ${currentUrl}`);
  }

  console.log('✓ Test user authenticated');
}

/**
 * Setup mock week data for testing
 *
 * Creates sample workout data in localStorage.
 * Call this AFTER being authenticated.
 *
 * @param page - Playwright page object
 */
export async function setupMockWeekData(page: Page) {
  await page.evaluate(() => {
    // Current week (2026-W09) with 4 workouts
    const week1 = {
      startDate: '2026-02-24',
      workouts: [true, true, false, true, true, false, false], // 4 workouts
      status: 'normal',
    };

    // Previous week with 3 workouts
    const week2 = {
      startDate: '2026-02-17',
      workouts: [true, false, true, false, true, false, false], // 3 workouts
      status: 'normal',
    };

    // Two weeks ago with 5 workouts (God Mode)
    const week3 = {
      startDate: '2026-02-10',
      workouts: [true, true, true, true, true, false, false], // 5 workouts
      status: 'normal',
    };

    localStorage.setItem('reps_week_2026-W09', JSON.stringify(week1));
    localStorage.setItem('reps_week_2026-W08', JSON.stringify(week2));
    localStorage.setItem('reps_week_2026-W07', JSON.stringify(week3));

    // Mock achievements
    const achievements = [
      { id: 'first_blood', unlockedAt: '2026-02-10T10:00:00.000Z' },
      { id: 'week_warrior', unlockedAt: '2026-02-24T15:30:00.000Z' },
    ];

    localStorage.setItem('reps_achievements', JSON.stringify(achievements));
  });
}
