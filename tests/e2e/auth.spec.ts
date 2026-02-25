import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 *
 * Tests the core authentication page UI and interactions.
 * These tests verify the login/register flow without actual authentication.
 *
 * Note: Actual authentication is tested separately with Firebase emulators.
 */
test.describe('Authentication Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    // Wait for page to load
    await page.waitForSelector('h1:has-text("REP & TEAR")');
  });

  test('should display login page correctly', async ({ page }) => {
    // Verify main heading
    await expect(page.locator('h1:has-text("REP & TEAR")')).toBeVisible();

    // Verify tagline
    await expect(page.locator('text="UNTIL IT IS DONE"')).toBeVisible();

    // Verify mode toggle tabs (use .first() to avoid ambiguity)
    await expect(page.locator('button:has-text("LOGIN")').first()).toBeVisible();
    await expect(page.locator('button:has-text("REGISTER")').first()).toBeVisible();

    // Verify Google OAuth button exists
    await expect(page.locator('button:has-text("SIGN IN WITH GOOGLE")')).toBeVisible();

    // Verify sign in button exists (email/password)
    await expect(page.locator('button[type="submit"]:has-text("SIGN IN")')).toBeVisible();

    // Verify input fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Verify forgot password link
    await expect(page.locator('text="FORGOT PASSWORD?"')).toBeVisible();

    // Verify creator credit
    await expect(page.locator('text=/CREATED BY.*Ragnar521/')).toBeVisible();
  });

  test('should toggle to registration mode', async ({ page }) => {
    // Click REGISTER tab
    const registerTab = page.locator('button:has-text("REGISTER")').first();
    await registerTab.click();

    // Wait for UI to update
    await page.waitForTimeout(300);

    // Button text should change to "CREATE ACCOUNT"
    await expect(page.locator('button[type="submit"]:has-text("CREATE ACCOUNT")')).toBeVisible();

    // Should show "Confirm Password" field
    await expect(page.locator('text="CONFIRM PASSWORD"')).toBeVisible();

    // Should show "ALREADY HAVE AN ACCOUNT? SIGN IN" link
    await expect(page.locator('text="ALREADY HAVE AN ACCOUNT? SIGN IN"')).toBeVisible();

    // Forgot password link should be hidden in register mode
    await expect(page.locator('text="FORGOT PASSWORD?"')).not.toBeVisible();
  });

  test('should toggle back from registration to login mode', async ({ page }) => {
    // Switch to register mode
    await page.locator('button:has-text("REGISTER")').first().click();
    await page.waitForTimeout(300);

    // Verify we're in register mode
    await expect(page.locator('button[type="submit"]:has-text("CREATE ACCOUNT")')).toBeVisible();

    // Click "ALREADY HAVE AN ACCOUNT? SIGN IN" link
    await page.locator('text="ALREADY HAVE AN ACCOUNT? SIGN IN"').click();
    await page.waitForTimeout(300);

    // Should be back in login mode
    await expect(page.locator('button[type="submit"]:has-text("SIGN IN")')).toBeVisible();

    // Confirm password field should be hidden
    await expect(page.locator('text="CONFIRM PASSWORD"')).not.toBeVisible();

    // Forgot password should be visible again
    await expect(page.locator('text="FORGOT PASSWORD?"')).toBeVisible();
  });

  test('should show password reset modal', async ({ page }) => {
    // Click "FORGOT PASSWORD?" link
    await page.locator('text="FORGOT PASSWORD?"').click();

    // Wait for modal to appear
    await page.waitForTimeout(500);

    // Modal should be visible with title
    await expect(page.locator('text="RESET THE PASSWORD"')).toBeVisible();

    // Should have send button
    await expect(page.locator('button:has-text("SEND RESET EMAIL")')).toBeVisible();
  });

  test('should validate empty email on submit', async ({ page }) => {
    // Leave email empty, add password
    await page.fill('input[type="password"]', 'password123');

    // Click sign in
    await page.locator('button[type="submit"]:has-text("SIGN IN")').click();

    // Wait for validation
    await page.waitForTimeout(500);

    // Should show error message
    await expect(page.locator('text=/EMAIL IS REQUIRED/i')).toBeVisible();
  });

  test('should validate empty password on submit', async ({ page }) => {
    // Add email, leave password empty
    await page.fill('input[type="email"]', 'test@example.com');

    // Click sign in
    await page.locator('button[type="submit"]:has-text("SIGN IN")').click();

    // Wait for validation
    await page.waitForTimeout(500);

    // Should show error message
    await expect(page.locator('text=/PASSWORD IS REQUIRED/i')).toBeVisible();
  });

  test('should validate short password on submit', async ({ page }) => {
    // Enter password that's too short
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '12345'); // Less than 6 chars

    // Click sign in
    await page.locator('button[type="submit"]:has-text("SIGN IN")').click();

    // Wait for validation
    await page.waitForTimeout(500);

    // Should show error message about password length
    await expect(page.locator('text=/PASSWORD MUST BE AT LEAST 6 CHARACTERS/i')).toBeVisible();
  });

  test('should validate matching passwords in register mode', async ({ page }) => {
    // Switch to register mode
    await page.locator('button:has-text("REGISTER")').first().click();
    await page.waitForTimeout(300);

    // Fill form with non-matching passwords
    await page.fill('input[type="email"]', 'test@example.com');

    // Fill password fields
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('password123');
    await passwordInputs.nth(1).fill('differentpassword');

    // Click create account
    await page.locator('button[type="submit"]:has-text("CREATE ACCOUNT")').click();

    // Wait for validation
    await page.waitForTimeout(500);

    // Should show error about passwords not matching
    await expect(page.locator('text=/PASSWORDS DO NOT MATCH/i')).toBeVisible();
  });

  test('should show "JOIN THE ARENA" text in register mode', async ({ page }) => {
    // Initially should say "ENTER THE ARENA"
    await expect(page.locator('text="ENTER THE ARENA"')).toBeVisible();

    // Switch to register mode
    await page.locator('button:has-text("REGISTER")').first().click();
    await page.waitForTimeout(300);

    // Should change to "JOIN THE ARENA"
    await expect(page.locator('text="JOIN THE ARENA"')).toBeVisible();
  });
});
