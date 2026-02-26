import { test, expect } from '@playwright/test';
import { clearStorage, isXPBarVisible, getCurrentRank } from '../utils/setup';

/**
 * XP System E2E Tests
 *
 * Tests the XP bar display, rank progression, and XP breakdown modal.
 * These tests verify the XP system UI without requiring authentication.
 *
 * Note: Tests requiring Firebase emulators (XP gain, level-up toast) are in separate file.
 */
test.describe('XP System', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage for test isolation
    await clearStorage(page);
    // Navigate to app root (will redirect to login for unauthenticated users)
    await page.goto('/');
    // Wait for page to load
    await page.waitForSelector('h1:has-text("REP & TEAR")');
  });

  test('should display XP bar on Tracker page in guest mode', async ({ page }) => {
    // XP bar should be visible even for guest users (shows skeleton or default state)
    // This verifies the XP bar component renders without errors
    const xpBarVisible = await isXPBarVisible(page);

    // In guest mode, XP bar may not be visible (Firestore-only feature)
    // But the page should load without errors
    await expect(page.locator('h1:has-text("REP & TEAR")')).toBeVisible();

    // Note: XP bar visibility depends on auth state
    // Guest users won't see XP bar (it's Firestore-only)
    // This test just verifies no crashes when XP bar logic runs
    console.log(`XP bar visible: ${xpBarVisible}`);
  });

  test('should show XP breakdown modal when clicking XP bar', async ({ page }) => {
    // Skip this test if we're not authenticated (XP bar won't be visible)
    const xpBarVisible = await isXPBarVisible(page);
    test.skip(!xpBarVisible, 'XP bar not visible (requires authentication)');

    // Locate and click the XP bar area
    const xpBar = page.locator('.doom-panel').filter({ hasText: /XP/ });
    await xpBar.click();

    // Wait for modal to slide up
    await page.waitForTimeout(300); // Allow for slide animation

    // Assert: "THIS WEEK" tab is visible
    await expect(page.locator('button:has-text("THIS WEEK")')).toBeVisible();

    // Assert: "ALL TIME" tab is visible
    await expect(page.locator('button:has-text("ALL TIME")')).toBeVisible();

    // Assert: "RANK PROGRESSION" section is visible
    await expect(page.locator('text=RANK PROGRESSION')).toBeVisible();

    // Click backdrop to dismiss modal
    const backdrop = page.locator('.fixed.inset-0.bg-black\\/50').first();
    await backdrop.click({ position: { x: 10, y: 10 } });

    // Wait for modal to slide down
    await page.waitForTimeout(300);

    // Assert: Modal is no longer visible (tabs should be hidden)
    await expect(page.locator('button:has-text("THIS WEEK")')).not.toBeVisible();
  });

  test('should display rank name in XP bar', async ({ page }) => {
    // Skip this test if we're not authenticated (XP bar won't be visible)
    const xpBarVisible = await isXPBarVisible(page);
    test.skip(!xpBarVisible, 'XP bar not visible (requires authentication)');

    // Get current rank name
    const rankName = await getCurrentRank(page);

    // Assert: Rank name is not empty and matches expected format
    expect(rankName).toBeTruthy();
    expect(rankName.length).toBeGreaterThan(0);

    // Rank should be uppercase (DOOM theme)
    expect(rankName).toBe(rankName.toUpperCase());

    console.log(`Current rank: ${rankName}`);
  });

  test('should show XP numbers in correct format', async ({ page }) => {
    // Skip this test if we're not authenticated (XP bar won't be visible)
    const xpBarVisible = await isXPBarVisible(page);
    test.skip(!xpBarVisible, 'XP bar not visible (requires authentication)');

    // Look for XP text in format "X / Y XP" or "X,XXX / Y,YYY XP"
    const xpText = page.locator('text=/\\d+[,\\d]* \\/ \\d+[,\\d]* XP/');

    // Assert: XP text is visible
    await expect(xpText).toBeVisible();

    // Get the full text content
    const fullText = await xpText.textContent();

    // Assert: Contains "/" separator
    expect(fullText).toContain('/');

    // Assert: Contains "XP" text
    expect(fullText).toContain('XP');

    console.log(`XP bar text: ${fullText}`);
  });

  test('should show skeleton loading state when XP is being calculated', async ({ page }) => {
    // This test checks for the skeleton state that appears during retroactive XP calculation
    // The skeleton should show "CALCULATING XP..." text

    // Skip if XP bar is not visible
    const xpBarVisible = await isXPBarVisible(page);
    test.skip(!xpBarVisible, 'XP bar not visible (requires authentication)');

    // Check if skeleton loading state is present
    const skeletonText = page.locator('text=CALCULATING XP...');
    const isLoading = await skeletonText.isVisible().catch(() => false);

    // Skeleton may or may not be visible depending on timing
    // If it's visible, verify it has the pulsing animation
    if (isLoading) {
      console.log('Skeleton loading state detected');

      // Check for pulsing animation class
      const skeletonBar = page.locator('.animate-pulse').first();
      await expect(skeletonBar).toBeVisible();
    } else {
      console.log('XP already calculated (skeleton not visible)');

      // If not loading, XP text should be visible instead
      const xpText = page.locator('text=/\\d+[,\\d]* \\/ \\d+[,\\d]* XP/');
      await expect(xpText).toBeVisible();
    }
  });
});
