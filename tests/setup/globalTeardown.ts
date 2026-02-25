import { stopEmulators } from '../utils/firebaseEmulator.js';

/**
 * Global teardown runs once after all tests
 *
 * Stops Firebase Emulators.
 */
async function globalTeardown() {
  await stopEmulators();
}

export default globalTeardown;
