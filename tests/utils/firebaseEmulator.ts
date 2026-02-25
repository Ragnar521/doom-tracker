import { execSync, spawn } from 'child_process';

/**
 * Get Java 21 home path
 */
function getJava21Home(): string {
  try {
    const javaHome = execSync('/usr/libexec/java_home -v 21', { encoding: 'utf-8' }).trim();
    return javaHome;
  } catch {
    throw new Error('Java 21 not found. Please install: brew install openjdk@21');
  }
}

/**
 * Start Firebase Emulators for testing
 *
 * This starts Auth and Firestore emulators in the background.
 * Call this in globalSetup.
 */
export function startEmulators() {
  console.log('Starting Firebase Emulators...');

  try {
    // Kill any existing emulator processes
    try {
      execSync('pkill -f "firebase.*emulators" || true', { stdio: 'ignore' });
      execSync('lsof -ti:9099 | xargs kill -9 || true', { stdio: 'ignore' });
      execSync('lsof -ti:8080 | xargs kill -9 || true', { stdio: 'ignore' });
    } catch {
      // Ignore errors if no processes to kill
    }

    // Get Java 21 home
    const javaHome = getJava21Home();
    console.log(`Using Java from: ${javaHome}`);

    // Start emulators in background with Java 21
    const emulatorProcess = spawn('npx', ['firebase', 'emulators:start', '--only', 'auth,firestore'], {
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env,
        JAVA_HOME: javaHome,
        PATH: `${javaHome}/bin:${process.env.PATH}`,
      },
    });

    emulatorProcess.unref();

    // Wait for emulators to be ready
    console.log('Waiting for emulators to start...');
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        // Check if auth emulator is responding
        execSync('curl -s http://localhost:9099 > /dev/null 2>&1', { stdio: 'ignore' });
        console.log('✅ Firebase Emulators ready!');
        console.log('   - Auth Emulator: http://localhost:9099');
        console.log('   - Firestore Emulator: http://localhost:8080');
        console.log('   - Emulator UI: http://localhost:4000');
        return;
      } catch {
        attempts++;
        // Wait 1 second between attempts
        execSync('sleep 1');
      }
    }

    throw new Error('Firebase Emulators failed to start after 30 seconds');
  } catch (error) {
    console.error('Failed to start Firebase Emulators:', error);
    throw error;
  }
}

/**
 * Stop Firebase Emulators
 *
 * Call this in globalTeardown.
 */
export function stopEmulators() {
  console.log('Stopping Firebase Emulators...');

  try {
    // Kill emulator processes
    execSync('pkill -f "firebase.*emulators" || true', { stdio: 'ignore' });
    execSync('lsof -ti:9099 | xargs kill -9 || true', { stdio: 'ignore' });
    execSync('lsof -ti:8080 | xargs kill -9 || true', { stdio: 'ignore' });
    execSync('lsof -ti:4000 | xargs kill -9 || true', { stdio: 'ignore' });
    console.log('✅ Firebase Emulators stopped');
  } catch (error) {
    console.error('Error stopping emulators:', error);
  }
}
