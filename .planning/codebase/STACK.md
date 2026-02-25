# Technology Stack

**Analysis Date:** 2026-02-25

## Languages

**Primary:**
- TypeScript ~5.9.3 - All application code (`.ts`, `.tsx` files)
  - Strict mode enabled
  - React 19 types via `@types/react` 19.2.5, `@types/react-dom` 19.2.3
  - Node types via `@types/node` 24.10.1

**Secondary:**
- JavaScript (ES2022+) - Configuration files
  - `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`
  - Build tooling and dev server configuration

**Styling:**
- CSS3 - Global styles and animations
  - `src/index.css` (629 lines) - DOOM-themed custom animations, keyframes, utilities
- Tailwind CSS 3.4.19 - Utility-first styling framework

## Runtime

**Environment:**
- Browser (Client-side only)
  - ES2022+ features required
  - IndexedDB support required (Firebase)
  - LocalStorage support required (guest mode)
  - Modern APIs: `navigator.onLine`, `Temporal` polyfill not needed (using ISO week calculations)

**Development Runtime:**
- Node.js 18+ (implied by package versions)
  - Required for Vite, build tools, Firebase emulators
  - Package manager: npm (lockfile present)

**Package Manager:**
- npm (exact version not specified)
- Lockfile: `package-lock.json` present (version control enabled)

## Frameworks

**Core:**
- React 19.2.0 - UI library
  - Concurrent rendering features enabled
  - Hooks-only architecture (no class components)
  - Fast Refresh enabled via `@vitejs/plugin-react` 5.1.1
- React DOM 19.2.0 - DOM rendering
- React Router DOM 7.11.0 - Client-side routing
  - BrowserRouter for SPA navigation
  - Routes: `/`, `/dashboard`, `/achievements`, `/squad`, `/settings`, `/login`

**Testing:**
- Playwright 1.58.2 - E2E testing framework
  - Configuration: `playwright.config.ts`
  - Test files: `tests/e2e/*.spec.ts`
  - Browsers: Chromium, Firefox, WebKit
  - Mobile viewports: Pixel 5, iPhone 12
  - Current coverage: 45 tests passing (9 scenarios × 5 browsers)

**Build/Dev:**
- Vite 7.2.4 - Build tool and dev server
  - Plugin: `@vitejs/plugin-react` 5.1.1 (Babel-based Fast Refresh)
  - Dev server: `localhost:5173`
  - HMR enabled
  - Build output: `dist/`
- TypeScript Compiler ~5.9.3 - Type checking
  - Config: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
  - Build command: `tsc -b && vite build`

**Linting:**
- ESLint 9.39.1 - Code linting (flat config format)
  - `@eslint/js` 9.39.1 - Base ESLint rules
  - `typescript-eslint` 8.46.4 - TypeScript-specific rules
  - `eslint-plugin-react-hooks` 7.0.1 - React Hooks rules
  - `eslint-plugin-react-refresh` 0.4.24 - Fast Refresh validation
  - Config: `eslint.config.js` (flat config, not legacy `.eslintrc`)

**CSS Processing:**
- PostCSS 8.5.6 - CSS transformation
  - Plugin: Tailwind CSS 3.4.19
  - Plugin: Autoprefixer 10.4.23
  - Config: `postcss.config.js`

## Key Dependencies

**Critical:**
- firebase 12.7.0 - Backend-as-a-Service platform
  - Authentication (Google OAuth, Email/Password)
  - Firestore (NoSQL database, real-time sync)
  - Storage (initialized but unused)
  - Why critical: Core data persistence and auth layer
- react 19.2.0 - UI rendering engine
  - Why critical: Application framework
- react-router-dom 7.11.0 - Navigation
  - Why critical: Multi-page SPA routing

**Infrastructure:**
- tailwindcss 3.4.19 - Styling system
  - Custom theme extensions in `tailwind.config.js`
  - DOOM color palette: `doom-red`, `doom-gold`, `doom-green`, `doom-bg`
- firebase-tools 15.7.0 - Local development emulators
  - Auth emulator: `localhost:9099`
  - Firestore emulator: `localhost:8080`
  - Emulator UI: `localhost:4000`
  - Required for testing authenticated features

**Testing Tools:**
- @playwright/test 1.58.2 - Test runner and assertions
  - Global setup/teardown for Firebase emulators
  - HTML reporter for test results
  - Video recording on failures

## Configuration

**Environment:**
- Development: `.env.local` (gitignored)
  - 6 Firebase config variables (`VITE_FIREBASE_*`)
  - All vars prefixed with `VITE_` for Vite exposure to client
- Testing: `.env.test` (gitignored)
  - Template: `.env.test.example` (checked in)
  - `VITE_USE_EMULATOR=true` for emulator mode
  - Dummy Firebase values (safe for testing)
- Production: Vercel environment variables
  - Same 6 Firebase vars required
  - Set via Vercel dashboard

**Key configs required:**
- `VITE_FIREBASE_API_KEY` - Firebase project API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Authentication domain
- `VITE_FIREBASE_PROJECT_ID` - Project identifier
- `VITE_FIREBASE_STORAGE_BUCKET` - Storage bucket URL
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - FCM sender ID
- `VITE_FIREBASE_APP_ID` - App identifier

**Build:**
- Vite configuration: `vite.config.ts`
  - React plugin with Fast Refresh
  - Build target: ES2022+
  - Output dir: `dist/`
- TypeScript configuration: `tsconfig.json`
  - Strict mode enabled
  - Module: ESNext
  - ModuleResolution: Bundler
  - Target: ES2022
  - JSX: react-jsx (React 17+ transform)
- Vercel configuration: `vercel.json`
  - SPA rewrites (all routes → `/index.html`)
  - Clean URLs disabled

## Platform Requirements

**Development:**
- Node.js 18+ (for Vite, build tools, Firebase emulators)
- npm 7+ (for workspaces support, though not currently used)
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- 100MB+ disk space (node_modules)
- Git (version control)

**Production:**
- Modern browser only (client-side only app):
  - Chrome/Edge 90+
  - Firefox 88+
  - Safari 14+
  - Mobile browsers (iOS Safari 14+, Chrome Android 90+)
- IndexedDB support (Firebase requirement)
- LocalStorage support (guest mode fallback)
- JavaScript enabled (no SSR/SSG fallback)
- Internet connection required for authenticated features
  - Guest mode works fully offline

**Deployment target:**
- Vercel (serverless platform)
  - Build command: `npm run build`
  - Output directory: `dist`
  - Node.js version: 18.x (Vercel default)
  - Environment: Node.js for build, static hosting for runtime

**Firebase requirements:**
- Firebase project (free Spark plan sufficient)
- Authentication methods enabled:
  - Google OAuth provider
  - Email/Password provider
- Firestore database created
- Authorized domains configured (localhost, production domain)
- Security rules deployed (`firestore.rules`)

---

*Stack analysis: 2026-02-25*
