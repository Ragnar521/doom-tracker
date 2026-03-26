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

/**
 * Get current XP value from the XP bar text.
 * Parses the "X,XXX / Y,YYY XP" format and returns current XP as number.
 */
export async function getCurrentXP(page: Page): Promise<number> {
  // Look for XP text in the format "X,XXX / Y,YYY XP"
  const xpText = await page.locator('text=/\\d+[,\\d]* \\/ \\d+[,\\d]* XP/').textContent();

  if (!xpText) {
    throw new Error('XP text not found on page');
  }

  // Extract first number before "/" (current XP)
  const match = xpText.match(/^([\d,]+)\s*\//);
  if (!match) {
    throw new Error(`Could not parse XP from text: ${xpText}`);
  }

  // Remove commas and parse as number
  return parseInt(match[1].replace(/,/g, ''), 10);
}

/**
 * Get current rank name from the XP bar.
 * Returns the full rank name (desktop) or abbreviated (mobile).
 */
export async function getCurrentRank(page: Page): Promise<string> {
  // Look for rank name in the XP bar area
  // The rank is displayed in the first line of the doom-panel containing XP text
  const rankElement = page.locator('.doom-panel').filter({ hasText: /XP/ }).locator('div').first();
  const rankText = await rankElement.textContent();

  if (!rankText) {
    throw new Error('Rank name not found in XP bar');
  }

  return rankText.trim();
}

/**
 * Wait for level-up toast to appear with expected rank name.
 * Times out after 6 seconds if toast doesn't appear.
 */
export async function waitForLevelUpToast(page: Page): Promise<void> {
  await page.locator('text=RANK PROMOTION').waitFor({ state: 'visible', timeout: 6000 });
}

/**
 * Check if XP bar is visible on the page.
 */
export async function isXPBarVisible(page: Page): Promise<boolean> {
  // Check for XP text pattern in a doom-panel
  const xpBar = page.locator('.doom-panel').filter({ hasText: /XP/ });
  return await xpBar.isVisible().catch(() => false);
}

/**
 * Get all rank cards on the Achievements page.
 * Each rank card is an .achievement-card inside the RANK PROGRESSION panel.
 */
export async function getRankCards(page: Page) {
  return page.locator('[data-testid="rank-card"]');
}

/**
 * Get the current rank card (the one with gold glow).
 */
export async function getCurrentRankCard(page: Page) {
  return page.locator('[data-testid="rank-card"][data-current="true"]');
}

/**
 * Get the guest sign-in message shown when not authenticated.
 */
export async function getGuestRankMessage(page: Page) {
  return page.locator('text=SIGN IN TO UNLOCK RANK PROGRESSION');
}
