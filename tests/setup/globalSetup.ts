import { startEmulators } from '../utils/firebaseEmulator.js';

/**
 * Global setup runs once before all tests
 *
 * Starts Firebase Emulators for authenticated testing.
 * If emulators fail to start, authenticated tests will be skipped.
 */
async function globalSetup() {
  try {
    await startEmulators();
    process.env.EMULATORS_AVAILABLE = 'true';
  } catch {
    process.env.EMULATORS_AVAILABLE = 'false';
    console.warn('⚠️  Firebase Emulators unavailable — authenticated tests will be skipped');
    console.warn('   Install Java 21+ to run authenticated tests:');
    console.warn('   macOS: brew install openjdk@21');
    console.warn('   Linux: sudo apt-get install openjdk-21-jdk');
    console.warn('   CI: Use actions/setup-java@v4 with java-version: 21');
  }
}

export default globalSetup;
