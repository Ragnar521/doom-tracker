# External Integrations

**Analysis Date:** 2026-02-25

## APIs & External Services

**Firebase Platform (12.7.0):**
- Firebase Authentication - User identity and session management
  - SDK/Client: `firebase/auth` from `src/lib/firebase.ts`
  - Initialized: `getAuth(app)`, exported as `auth`
  - Emulator: `localhost:9099` (test mode only)
  - Auth providers configured: Google OAuth, Email/Password

- Firebase Firestore - NoSQL real-time database
  - SDK/Client: `firebase/firestore` from `src/lib/firebase.ts`
  - Initialized: `getFirestore(app)`, exported as `db`
  - Emulator: `localhost:8080` (test mode only)
  - Real-time listeners enabled (workout sync, friend updates)

- Firebase Storage - File storage (initialized but not actively used)
  - SDK/Client: `firebase/storage` from `src/lib/firebase.ts`
  - Initialized: `getStorage(app)`, exported as `storage`
  - Note: Not used for avatar uploads (requires paid Blaze plan)

**YouTube:**
- Embedded player for DOOM soundtrack (boost motivation feature)
  - Usage: Opened in new tab via boost button on Tracker page
  - Implementation: `src/lib/music.ts` and `src/contexts/BoostContext.tsx`
  - No API key required (public YouTube links)
  - No iframe embedding (opens external tab)

## Data Storage

**Databases:**
- Firestore (Firebase)
  - Connection: Configured via 6 environment variables (`VITE_FIREBASE_*`)
  - Client: Firebase SDK (`firebase/firestore`)
  - Collections structure:
    - `users/{uid}` - User parent documents (must exist for friend discovery)
    - `users/{uid}/weeks/{weekId}` - Workout data (format: `2026-W08`, contains `workouts: boolean[]`, `status: string`, `startDate: string`, `updatedAt: Timestamp`)
    - `users/{uid}/achievements/{docId}` - Achievement unlock records
    - `users/{uid}/profile/info` - User profile (friend code, display name, photo URL, created/updated timestamps)
    - `users/{uid}/friends/{friendUid}` - Friend relationships (bi-directional, contains `addedAt: Timestamp`)
  - Indexes: Configured in `firestore.indexes.json` (currently minimal, no complex queries)
  - Security: Rules defined in `firestore.rules` (authenticated read/write with friend discovery permissions)
  - Week ID format: ISO 8601 (`YYYY-Www`, e.g., `2026-W08`)

**File Storage:**
- Local filesystem only (static assets)
  - Face sprites: `src/assets/faces/*.png` (80+ DoomGuy face variations)
  - Achievement icons: `src/assets/achievements/*.png` (18+ badge icons)
  - Navigation icons: `src/assets/icons/*.png` (5 navigation icons)
  - All images imported via Vite (bundled in build)
- Firebase Storage initialized but unused (no file uploads implemented)
  - Avatar uploads not supported (requires paid Firebase Blaze plan)
  - OAuth users (Google) get photoURL from their provider automatically

**Caching:**
- Browser LocalStorage
  - Fallback for unauthenticated users (guest mode)
  - Keys: `doom-tracker-week-{weekId}` (workout data per week)
  - Hybrid approach: Authenticated users use Firestore, guests use LocalStorage
  - Implementation: `src/hooks/useWeek.ts`, `src/hooks/useStats.ts`, `src/hooks/useAllWeeks.ts`, `src/hooks/useAchievements.ts`
  - No garbage collection (grows indefinitely, ~10,000 weeks capacity)
  - Offline support: Authenticated users cache in LocalStorage when offline

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication
  - Implementation: `src/contexts/AuthContext.tsx`

  - **Google OAuth (primary method):**
    - Provider: `GoogleAuthProvider` from `src/lib/firebase.ts`
    - Flow: `signInWithPopup(auth, googleProvider)`
    - Scopes: Default (profile, email)
    - Photo URL: Automatically provided from Google account

  - **Email/Password (secondary method):**
    - Sign in: `signInWithEmailAndPassword(auth, email, password)`
    - Sign up: `createUserWithEmailAndPassword(auth, email, password)`
    - Validation: 6+ character password requirement
    - Confirm password field in registration mode

  - **Password reset:**
    - Flow: `sendPasswordResetEmail(auth, email)`
    - UI: Modal popup on login page
    - Delivery: Email link from Firebase

  - **Session management:**
    - Listener: `onAuthStateChanged(auth, callback)` in `AuthContext.tsx`
    - Persistence: Browser default (local storage)
    - Auto-refresh: Handled by Firebase SDK

  - **Error handling:**
    - Custom error message mapping for Firebase error codes
    - Examples: `auth/invalid-credential`, `auth/user-not-found`, `auth/email-already-in-use`, `auth/weak-password`, `auth/network-request-failed`
    - UI feedback: Toast notifications with user-friendly messages

  - **New user detection:**
    - Logic: Compare `metadata.creationTime` vs `metadata.lastSignInTime`
    - Use case: Show welcome toast on first sign-in
    - Friend code generation: Automatic on first sign-in (format: `ABCD1234#5678`)

## Monitoring & Observability

**Error Tracking:**
- None (console logging only)
  - Errors logged via `console.error()` in hooks and contexts
  - Firestore errors caught in try-catch blocks
  - Authentication errors mapped to user-friendly messages
  - No third-party error tracking (Sentry, Rollbar, etc.)

**Logs:**
- Browser console only
  - Development: Vite HMR logs, Firebase debug logs (when enabled via `setLogLevel('debug')`)
  - Production: User-facing error toasts, console errors for debugging
  - No server-side logging (client-side only app)
  - No analytics tracking (Google Analytics, Mixpanel, etc.)

## CI/CD & Deployment

**Hosting:**
- Vercel (primary)
  - Configuration: `vercel.json` (SPA routing rewrites)
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variables: Set in Vercel dashboard (same 6 vars as `.env.local`)
  - Automatic deployments: On git push to `main` branch
  - Preview deployments: On pull requests
  - Domain: Custom domain configured (not localhost)

**CI Pipeline:**
- GitHub Actions
  - **Playwright E2E Tests** (`.github/workflows/playwright.yml`):
    - Triggers: Pull requests to `main`, pushes to `main`
    - Steps:
      1. Checkout code
      2. Setup Node.js 20
      3. Install dependencies (`npm ci`)
      4. Install Playwright browsers
      5. Lint with ESLint (`npm run lint`)
      6. Build with Vite (`npm run build`)
      7. Run Playwright E2E tests (`npm run test:e2e`)
      8. Upload HTML reports and videos as artifacts (on failure)
    - Test server: Vite preview server on `localhost:4173`
    - Firebase emulators: Auth (port 9099), Firestore (port 8080), UI (port 4000)
    - Global setup: `tests/setup/globalSetup.ts` (starts emulators, waits for readiness)
    - Global teardown: `tests/setup/globalTeardown.ts` (stops emulators via pkill)
    - Current coverage: 45 tests passing (9 scenarios × 5 browsers)

  - **Claude Code Integration** (`.github/workflows/claude.yml`):
    - Purpose: AI-assisted code reviews and suggestions

  - **Claude Code Review** (`.github/workflows/claude-code-review.yml`):
    - Purpose: Automated PR reviews via Claude AI

**Firebase Emulators (Development/Testing):**
- Configuration: `firebase.json`
- Services:
  - Auth: `localhost:9099`
  - Firestore: `localhost:8080`
  - Emulator UI: `localhost:4000`
- Data persistence: Not enabled (ephemeral data between runs)
- Startup: `firebase emulators:start`
- Detection: `process.env.VITE_USE_EMULATOR === 'true'` (build-time only)
- Security: Emulator mode cannot be enabled by production users (build-time check only)

## Environment Configuration

**Required env vars (production):**
- `VITE_FIREBASE_API_KEY` - Firebase project API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase authentication domain (e.g., `project.firebaseapp.com`)
- `VITE_FIREBASE_PROJECT_ID` - Firebase project identifier
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket URL (e.g., `project.appspot.com`)
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase Cloud Messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app identifier (unique per app)

**Optional env vars (testing):**
- `VITE_USE_EMULATOR=true` - Enables Firebase emulator mode
  - Build-time only (not runtime toggle)
  - Security: Prevents production users from accidentally enabling emulator mode
  - Configured in `.env.test` (gitignored)
  - Test values: Dummy Firebase config values (see `.env.test.example`)

**Secrets location:**
- Development: `.env.local` (gitignored, never committed)
- Testing: `.env.test` (gitignored, template: `.env.test.example` is safe to commit)
- Production: Vercel environment variables dashboard (encrypted at rest)
- CI: GitHub Actions secrets (injected at runtime, not exposed in logs)

**Important security notes:**
- All env vars prefixed with `VITE_` are exposed to client-side code
- Firebase API key is NOT a secret (public in client bundle)
- Security enforced via Firestore security rules, not API key
- Never commit `.env.local` or `.env.test` to git (listed in `.gitignore`)

## Webhooks & Callbacks

**Incoming:**
- None (fully client-side application, no server-side endpoints)

**Outgoing:**
- None (no webhooks to external services)
- OAuth callbacks handled by Firebase SDK (Google sign-in redirect)

## Network Configuration

**CORS:**
- Firebase handles CORS for Firestore/Auth requests automatically
- No custom CORS configuration needed
- All requests to `*.firebaseio.com`, `*.googleapis.com` allowed by Firebase

**Domain Allowlist:**
- Firebase Console → Authentication → Settings → Authorized domains
- Required domains:
  - `localhost` (development)
  - Production domain(s) (e.g., `rep-tear.vercel.app`)
- Unauthorized domains: Sign-in attempts blocked by Firebase

**API Rate Limits:**
- Firebase Free Tier (Spark plan):
  - **Firestore:**
    - 50,000 document reads/day
    - 20,000 document writes/day
    - 20,000 document deletes/day
    - 1GB stored data
    - 10GB/month network egress
  - **Authentication:**
    - Unlimited sign-in attempts (rate limited per IP)
    - Email/password: 100 requests/hour per IP
  - **Storage:**
    - 5GB stored
    - 1GB/day downloads
    - 20,000 uploads/day
  - **Hosting:**
    - N/A (using Vercel, not Firebase Hosting)
- Current usage: Minimal (well within free tier limits)
- Monitoring: Firebase Console → Usage tab

**Offline Behavior:**
- Detection: `navigator.onLine` API via `src/components/OfflineIndicator.tsx`
- Guest mode: Works fully offline with LocalStorage
- Authenticated mode:
  - Firestore SDK queues writes when offline
  - Automatic sync when connection restored
  - LocalStorage cache fallback for reads
- User feedback: Yellow "OFFLINE" badge in UI

---

*Integration audit: 2026-02-25*
