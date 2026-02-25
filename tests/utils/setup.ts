import { Page } from '@playwright/test';

/**
 * Clear all browser storage before tests
 *
 * This ensures each test starts with a clean slate:
 * - No leftover workout data
 * - No cached user sessions
 * - No achievement unlocks
 */
export async function clearStorage(page: Page) {
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch {
    // Ignore errors if storage is not accessible yet
    // This can happen if called before navigating to any page
  }
}

/**
 * Wait for the app to be fully loaded and ready
 *
 * Looks for the main heading to appear, which indicates:
 * - React has rendered
 * - Component tree is mounted
 * - Ready for user interaction
 */
export async function waitForAppReady(page: Page) {
  // Wait for main heading (appears on all authenticated pages)
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
