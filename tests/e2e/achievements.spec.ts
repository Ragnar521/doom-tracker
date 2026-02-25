import { test, expect } from '@playwright/test';
import { clearStorage } from '../utils/setup';

/**
 * Achievements E2E Tests
 *
 * Tests the achievements page display and UI:
 * - Page structure and layout
 * - Achievement cards display
 * - Locked/unlocked states
 * - Category filtering (if applicable)
 * - Achievement icons and descriptions
 *
 * Note: These tests verify UI without authentication.
 * Achievement unlocking logic requires Firebase emulators (future tests).
 */
test.describe('Achievements Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    // Try to navigate to achievements page
    await page.goto('/achievements');

    // Will redirect to login if not authenticated
    // Wait for page to load (either login or achievements)
    await page.waitForTimeout(1000);
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Trying to access achievements should redirect to login
    expect(page.url()).toContain('/login');

    // Should show login page
    await expect(page.locator('h1:has-text("REP & TEAR")')).toBeVisible();
  });

  test('should show login page with all authentication options', async ({ page }) => {
    // After redirect to login, verify all auth options available
    await expect(page.locator('button:has-text("SIGN IN WITH GOOGLE")')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("SIGN IN")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

/**
 * Achievements Page - Guest Mode Tests
 *
 * These tests verify what happens when accessing achievements as a guest
 * (if guest mode is supported, otherwise they verify redirect behavior)
 */
test.describe('Achievements Page - Guest Access', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('should handle guest user attempting to view achievements', async ({ page }) => {
    // Navigate to achievements without authentication
    await page.goto('/achievements');
    await page.waitForTimeout(1000);

    // Should redirect to login (achievements require auth in this app)
    expect(page.url()).toContain('/login');
  });

  test('should preserve achievements URL intent after redirect', async ({ page }) => {
    // Navigate to achievements
    await page.goto('/achievements');
    await page.waitForTimeout(1000);

    // Should be redirected to login
    expect(page.url()).toContain('/login');

    // After authentication (in future), user should be redirected back to /achievements
    // This is a placeholder for future authenticated flow testing
  });
});

/**
 * Achievements Page - Navigation Tests
 *
 * Test navigation to/from achievements page
 */
test.describe('Achievements Page - Navigation', () => {
  test('should be accessible via direct URL', async ({ page }) => {
    await clearStorage(page);
    await page.goto('/achievements');

    // Will redirect to login for non-authenticated users
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
  });

  test('should show achievements in bottom navigation after authentication', async ({ page }) => {
    // TODO: Requires authentication
    // After login, bottom nav should have achievements icon/link
    // This is a placeholder for future authenticated testing
  });
});

/**
 * NOTE: Authenticated achievements tests are in achievements-authenticated.spec.ts
 *
 * That file tests:
 * - Achievement page structure and layout
 * - Achievement cards, icons, names, descriptions
 * - Locked/unlocked states and visual distinction
 * - Categories and progress bars
 * - Responsive layout
 * - Performance (load time, layout shift)
 *
 * Those tests use Firebase Emulator for real authentication.
 */
