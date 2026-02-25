import { startEmulators } from '../utils/firebaseEmulator.js';

/**
 * Global setup runs once before all tests
 *
 * Starts Firebase Emulators for authenticated testing.
 */
async function globalSetup() {
  // Start Firebase Emulators
  startEmulators();
}

export default globalSetup;
