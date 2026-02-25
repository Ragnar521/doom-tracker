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
 * Creates sample workout data using Firestore Emulator.
 * Uses dynamic dates relative to current date to avoid staleness.
 *
 * NOTE: Currently writes to localStorage for backward compatibility.
 * TODO: Migrate to Firestore Emulator Admin SDK for proper data seeding.
 *
 * Call this AFTER being authenticated.
 *
 * @param page - Playwright page object
 */
export async function setupMockWeekData(page: Page) {
  await page.evaluate(() => {
    // Calculate week IDs dynamically to avoid hardcoded dates
    const getWeekId = (date: Date): string => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    };

    const getMonday = (date: Date): string => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff)).toISOString().split('T')[0];
    };

    const now = new Date();
    const currentWeekId = getWeekId(now);
    const currentMonday = getMonday(now);

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const prevWeekId = getWeekId(oneWeekAgo);
    const prevMonday = getMonday(oneWeekAgo);

    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);
    const oldWeekId = getWeekId(twoWeeksAgo);
    const oldMonday = getMonday(twoWeeksAgo);

    // Current week with 4 workouts
    const week1 = {
      startDate: currentMonday,
      workouts: [true, true, false, true, true, false, false], // 4 workouts
      status: 'normal',
    };

    // Previous week with 3 workouts
    const week2 = {
      startDate: prevMonday,
      workouts: [true, false, true, false, true, false, false], // 3 workouts
      status: 'normal',
    };

    // Two weeks ago with 5 workouts (God Mode)
    const week3 = {
      startDate: oldMonday,
      workouts: [true, true, true, true, true, false, false], // 5 workouts
      status: 'normal',
    };

    localStorage.setItem(`reps_week_${currentWeekId}`, JSON.stringify(week1));
    localStorage.setItem(`reps_week_${prevWeekId}`, JSON.stringify(week2));
    localStorage.setItem(`reps_week_${oldWeekId}`, JSON.stringify(week3));

    // Mock achievements with dynamic dates
    const achievements = [
      { id: 'first_blood', unlockedAt: twoWeeksAgo.toISOString() },
      { id: 'week_warrior', unlockedAt: now.toISOString() },
    ];

    localStorage.setItem('reps_achievements', JSON.stringify(achievements));
  });
}
