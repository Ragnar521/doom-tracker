import { spawn } from 'child_process';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

/**
 * Check if a port is responding
 */
async function isPortResponding(port: number): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    // Use curl to check if port is responding (works on macOS and Linux)
    execSync(`curl -s http://localhost:${port} > /dev/null 2>&1`, { timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Kill process on port (cross-platform)
 */
async function killPort(port: number): Promise<void> {
  try {
    const { execSync } = await import('child_process');
    if (process.platform === 'win32') {
      // Windows: Extract PID from netstat and kill the process
      const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf-8' });
      // Output format: "  TCP    0.0.0.0:9099    0.0.0.0:0    LISTENING    12345"
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1]; // PID is last column
        if (pid && /^\d+$/.test(pid)) {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
    }
  } catch {
    // Ignore errors - port might not be in use
  }
}

/**
 * Start Firebase Emulators for testing
 *
 * This starts Auth and Firestore emulators in the background.
 * Trusts JAVA_HOME from environment (set by CI or user).
 *
 * Call this in globalSetup.
 */
export async function startEmulators(): Promise<void> {
  console.log('Starting Firebase Emulators...');

  try {
    // Verify Java version
    const { execSync } = await import('child_process');
    try {
      const javaVersion = execSync('java -version 2>&1', { encoding: 'utf-8' });
      console.log('Java version:', javaVersion.split('\n')[0]);
    } catch {
      console.warn('⚠️  Could not verify Java installation');
    }

    // Kill any existing processes on emulator ports
    await Promise.all([
      killPort(9099), // Auth
      killPort(8080), // Firestore
      killPort(4000), // UI
    ]);

    // Start emulators in background
    // Trust JAVA_HOME from environment (CI sets this via setup-java action)
    console.log('JAVA_HOME:', process.env.JAVA_HOME);
    console.log('PATH:', process.env.PATH?.slice(0, 200));

    const emulatorProcess = spawn('npx', ['firebase', 'emulators:start', '--only', 'auth,firestore'], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'], // Capture stdout/stderr for debugging
      env: process.env,
    });

    // Log emulator errors for debugging
    if (emulatorProcess.stderr) {
      emulatorProcess.stderr.on('data', (data) => {
        // Log errors immediately for debugging
        console.error('Emulator stderr:', data.toString());
      });
    }

    emulatorProcess.on('error', (err) => {
      console.error('Emulator process error:', err);
    });

    emulatorProcess.unref();

    // Wait for BOTH emulators to be ready
    console.log('Waiting for emulators to start...');
    const maxAttempts = 60; // Increased to 60 seconds for CI

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const authReady = await isPortResponding(9099);
      const firestoreReady = await isPortResponding(8080);

      if (attempt % 5 === 0) {
        console.log(`  Attempt ${attempt + 1}/${maxAttempts}: Auth=${authReady}, Firestore=${firestoreReady}`);
      }

      if (authReady && firestoreReady) {
        console.log('✅ Firebase Emulators ready!');
        console.log('   - Auth Emulator: http://localhost:9099');
        console.log('   - Firestore Emulator: http://localhost:8080');
        console.log('   - Emulator UI: http://localhost:4000');
        return;
      }

      await sleep(1000); // Async sleep, non-blocking
    }

    throw new Error('Firebase Emulators failed to start after 60 seconds');
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
export async function stopEmulators(): Promise<void> {
  console.log('Stopping Firebase Emulators...');

  try {
    const { execSync } = await import('child_process');

    // Kill emulator processes (cross-platform)
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM java.exe /FI "WINDOWTITLE eq firebase*" 2>nul || true', { stdio: 'ignore' });
    } else {
      execSync('pkill -f "firebase.*emulators" 2>/dev/null || true', { stdio: 'ignore' });
    }

    // Kill ports as backup
    await Promise.all([
      killPort(9099),
      killPort(8080),
      killPort(4000),
    ]);

    console.log('✅ Firebase Emulators stopped');
  } catch (error) {
    console.error('Error stopping emulators:', error);
  }
}
