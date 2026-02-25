import { test } from '@playwright/test';

/**
 * Achievements E2E Tests
 *
 * NOTE: This file has been consolidated into other test files:
 * - Protected route redirects are covered in navigation.spec.ts
 * - Authenticated achievement tests are in achievements-authenticated.spec.ts
 *
 * All redirect tests were duplicates of navigation.spec.ts which already
 * systematically tests all protected routes including /achievements.
 */

test.describe('Achievements Page - Navigation', () => {
  test.skip('should show achievements in bottom navigation after authentication', async () => {
    // Requires authentication
    // After login, bottom nav should have achievements icon/link
    // Implemented in authenticated tests (achievements-authenticated.spec.ts)
  });
});

/**
 * Authenticated achievements tests are in achievements-authenticated.spec.ts
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
