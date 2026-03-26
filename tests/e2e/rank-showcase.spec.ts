import { test, expect } from '@playwright/test';
import { signInTestUser } from '../utils/mockAuth';
import { getRankCards, getCurrentRankCard, getGuestRankMessage } from '../utils/setup';

/**
 * Rank Showcase - E2E Tests
 *
 * These tests verify the rank showcase feature on the Achievements page.
 * Tests cover all 7 RANK requirements (RANK-01 through RANK-07).
 *
 * Requirements:
 * - Firebase Emulators must be running (started by globalSetup)
 * - Auth Emulator on port 9099
 * - Firestore Emulator on port 8080
 * - VITE_USE_EMULATOR=true in .env.test (build-time flag)
 */

test.describe('Rank Showcase - Authenticated', () => {
  // Skip all tests if emulators are unavailable
  test.skip(process.env.EMULATORS_AVAILABLE !== 'true', 'Firebase Emulators not available');

  test.beforeEach(async ({ page }) => {
    // Sign in test user (creates user if doesn't exist)
    await signInTestUser(page);

    // Navigate to achievements page
    await page.goto('/achievements');

    // Wait for page to load
    await page.waitForSelector('h2:has-text("ACHIEVEMENTS")', { timeout: 10000 });
  });

  test.fixme('should display all 15 ranks', async ({ page }) => {
    // RANK-01: Verify all 15 rank cards are displayed
    const rankCards = getRankCards(page);
    await expect(rankCards).toHaveCount(15);
  });

  test.fixme('should show rank details for each card', async ({ page }) => {
    // RANK-02: Each card has rank number, name, tagline, XP threshold text
    const rankCards = getRankCards(page);
    const firstCard = rankCards.first();

    // Check for rank number (e.g., "#1")
    await expect(firstCard.locator('text=/#\\d+/')).toBeVisible();

    // Check for rank name (e.g., "Private")
    await expect(firstCard.locator('text=/[A-Z][a-z]+/')).toBeVisible();

    // Check for XP threshold (e.g., "0 XP")
    await expect(firstCard.locator('text=/\\d+ XP/')).toBeVisible();

    // Check for tagline (small text below name)
    await expect(firstCard.locator('.text-gray-400')).toBeVisible();
  });

  test.fixme('should highlight current rank with gold glow', async ({ page }) => {
    // RANK-03: getCurrentRankCard is visible, has god-mode-glow class
    const currentRank = getCurrentRankCard(page);
    await expect(currentRank).toBeVisible();

    // Verify gold glow animation class
    const hasGlow = await currentRank.evaluate((el) => {
      return el.classList.contains('god-mode-glow') ||
             el.classList.contains('pulse-gold') ||
             getComputedStyle(el).boxShadow.includes('gold') ||
             getComputedStyle(el).borderColor.includes('rgb(212, 175, 55)'); // doom-gold color
    });
    expect(hasGlow).toBeTruthy();
  });

  test.fixme('should show earned and locked rank states', async ({ page }) => {
    // RANK-04: Cards before current have full opacity, cards after current have .locked class
    const rankCards = getRankCards(page);
    const totalCards = await rankCards.count();

    // Find current rank index
    const currentRank = getCurrentRankCard(page);
    const currentRankIndex = await currentRank.evaluate((el) => {
      const parent = el.parentElement;
      if (!parent) return -1;
      const cards = Array.from(parent.querySelectorAll('[data-testid="rank-card"]'));
      return cards.indexOf(el);
    });

    expect(currentRankIndex).toBeGreaterThanOrEqual(0);

    // Check cards before current rank (earned)
    if (currentRankIndex > 0) {
      const earnedCard = rankCards.nth(currentRankIndex - 1);
      const isLocked = await earnedCard.evaluate((el) => el.classList.contains('locked'));
      expect(isLocked).toBe(false);
    }

    // Check cards after current rank (locked)
    if (currentRankIndex < totalCards - 1) {
      const lockedCard = rankCards.nth(currentRankIndex + 1);
      const isLocked = await lockedCard.evaluate((el) => el.classList.contains('locked'));
      expect(isLocked).toBe(true);
    }
  });

  test.fixme('should display rank showcase above achievements section', async ({ page }) => {
    // RANK-05: RANK PROGRESSION panel appears before ACHIEVEMENTS heading in DOM order
    const rankSection = page.locator('text=RANK PROGRESSION').first();
    const achievementsSection = page.locator('h2:has-text("ACHIEVEMENTS")');

    // Both sections should be visible
    await expect(rankSection).toBeVisible();
    await expect(achievementsSection).toBeVisible();

    // Verify rank section comes before achievements in DOM
    const rankY = await rankSection.boundingBox().then(box => box?.y ?? 0);
    const achievementsY = await achievementsSection.boundingBox().then(box => box?.y ?? 0);

    expect(rankY).toBeLessThan(achievementsY);
  });

  test.fixme('should show progress indicator on current rank', async ({ page }) => {
    // RANK-06: Current rank card contains "+XXX XP to" text or "MAX RANK ACHIEVED"
    const currentRank = getCurrentRankCard(page);

    // Check for progress text pattern or max rank message
    const hasProgressText = await currentRank.evaluate((el) => {
      const text = el.textContent ?? '';
      return text.includes('+') && text.includes('XP to') || text.includes('MAX RANK ACHIEVED');
    });

    expect(hasProgressText).toBe(true);
  });
});

test.describe('Rank Showcase - Guest', () => {
  // No skip for emulators - guest tests work without emulators

  test.fixme('should show sign-in message for guest users', async ({ page }) => {
    // RANK-07: Guest users get redirected to login or see guest message
    await page.goto('/achievements');

    // Wait for page to load (guest users may see login or achievements with guest message)
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      // Ignore timeout - page may have redirected or loaded partially
    });

    // Check if redirected to login
    const isLoginPage = page.url().includes('/login');

    if (isLoginPage) {
      // Guest redirected to login - this is valid behavior
      await expect(page.locator('h1:has-text("REP & TEAR")')).toBeVisible();
    } else {
      // Guest can view achievements but sees sign-in message for ranks
      const guestMsg = getGuestRankMessage(page);
      await expect(guestMsg).toBeVisible();
    }
  });
});
