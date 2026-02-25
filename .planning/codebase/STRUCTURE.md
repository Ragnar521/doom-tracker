# Codebase Structure

**Analysis Date:** 2026-02-25

## Directory Layout

```
doom-tracker/
├── .claude/                    # Claude Code configuration
│   ├── CLAUDE.md              # Comprehensive project context (this file)
│   ├── commands/              # Custom Claude commands
│   ├── get-shit-done/         # GSD workflow system
│   └── hooks/                 # Claude lifecycle hooks
├── .github/                   # GitHub configuration
│   └── workflows/             # CI/CD workflows (playwright.yml, claude.yml)
├── .planning/                 # Project planning documents
│   └── codebase/             # Codebase analysis (ARCHITECTURE.md, STRUCTURE.md)
├── tests/                     # E2E test suite (Playwright)
│   ├── e2e/                  # Test spec files
│   ├── utils/                # Test helpers
│   └── fixtures/             # Test data
├── src/                       # Application source code
│   ├── assets/               # Static images
│   │   ├── faces/           # DoomGuy face sprites (80+ PNGs)
│   │   ├── achievements/    # Achievement badge icons (18+ PNGs)
│   │   └── icons/           # Navigation icons (5 PNGs)
│   ├── components/           # React components
│   │   └── ui/              # Reusable UI primitives
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and configuration
│   ├── pages/                # Route components
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── App.tsx               # Root component + routing
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles + DOOM theme
├── doom-assets/              # Original asset sources (not used in build)
├── public/                   # Static files served as-is
├── dist/                     # Build output (generated)
├── node_modules/             # Dependencies (generated)
└── [config files]            # Configuration files (root level)
```

## Directory Purposes

**`src/assets/`:**
- Purpose: Static image assets compiled into the bundle
- Contains: PNG images organized by type (faces, achievements, icons)
- Key files: `faces/index.ts` (exports all face sprites), `faces/face_*.png` (80+ sprites organized by state and direction)
- Special notes: Images use `image-rendering: pixelated` CSS for retro look, all images must be imported in index.ts to be usable

**`src/components/`:**
- Purpose: Reusable React components (presentation logic)
- Contains: Feature components, layout components, animation components, UI components
- Key files: `DoomFace.tsx` (main character face with animation), `WeekTracker.tsx` (7-day workout grid), `WeekNavigation.tsx` (week selector with status badge), `BottomNavigation.tsx` (5-page navigation), `WeeklyLeaderboard.tsx` (friend rankings)
- Subdirectory: `ui/` contains primitive components (`Button.tsx`, `Input.tsx`, `Modal.tsx`, `FormError.tsx`)

**`src/contexts/`:**
- Purpose: React Context providers for global state
- Contains: 3 context providers (Auth, Achievement, Boost)
- Key files: `AuthContext.tsx` (Firebase auth + user state), `AchievementContext.tsx` (achievement system state + toast container), `BoostContext.tsx` (motivation boost state)
- Pattern: Each exports Provider component and custom hook (e.g., `useAuth()`)

**`src/hooks/`:**
- Purpose: Custom React hooks (data layer)
- Contains: Data fetching, CRUD operations, business logic, calculations
- Key files: `useWeek.ts` (single week CRUD), `useStats.ts` (stats calculations + streaks), `useAllWeeks.ts` (multi-week aggregation), `useAchievements.ts` (achievement unlock logic), `useFriends.ts` (friend system operations), `useProfile.ts` (profile management)
- Pattern: All hooks handle both Firebase (authenticated) and localStorage (guest) persistence

**`src/lib/`:**
- Purpose: Pure functions, configurations, shared utilities
- Contains: Firebase config, week calculations, achievement definitions, music utilities
- Key files: `firebase.ts` (Firebase initialization + exports auth/db/storage), `weekUtils.ts` (ISO 8601 week calculations), `achievements.ts` (18+ achievement definitions with conditions), `music.ts` (audio utilities)
- Special notes: `firebase.ts` connects to emulators when `VITE_USE_EMULATOR=true`

**`src/pages/`:**
- Purpose: Route-level components (one per route)
- Contains: 6 page components (Tracker, Dashboard, Achievements, Squad, Settings, Login)
- Key files: `Tracker.tsx` (main workout tracking view, root `/`), `Login.tsx` (authentication page, public route), `Squad.tsx` (friend system page), `Dashboard.tsx` (analytics and statistics), `Achievements.tsx` (achievement showcase), `Settings.tsx` (account settings)
- Pattern: Pages compose components and hooks, handle page-specific logic

**`src/types/`:**
- Purpose: TypeScript type definitions and interfaces
- Contains: Shared types used across the application
- Key files: `index.ts` (exports WorkoutDay, WorkoutStats, FaceState, FaceDirection, FriendProfile, FriendStats, Friend)
- Pattern: Types exported from single index file for easy imports

**`src/utils/`:**
- Purpose: Utility functions not fitting in lib/
- Contains: Migration scripts, helper functions
- Key files: `migrateFriendSystem.ts` (creates parent user documents for friend discovery)
- Special notes: Migration utility exposed to window object for manual execution

**`tests/`:**
- Purpose: End-to-end testing with Playwright
- Contains: Test specs, utilities, fixtures
- Key files: `e2e/auth.spec.ts` (9 authentication tests), `utils/setup.ts` (helper functions like clearStorage, getFaceState), `README.md` (testing documentation)
- Coverage: 45 tests passing (9 scenarios × 5 browsers: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari)

**`.github/workflows/`:**
- Purpose: CI/CD automation
- Contains: GitHub Actions workflow files
- Key files: `playwright.yml` (E2E tests on PR/push), `claude.yml` (Claude Code integration), `claude-code-review.yml` (automated PR reviews)
- Pattern: Runs linting, build, and all tests on every pull request

**`doom-assets/`:**
- Purpose: Original source assets (not used in production build)
- Contains: Original sprites, fonts, icons before optimization
- Special notes: Assets copied to `src/assets/` for actual use, this is just a reference/backup folder

**`public/`:**
- Purpose: Static files served as-is (no bundling)
- Contains: Favicon, manifest, robots.txt, music files
- Special notes: Files served at root URL (e.g., `/favicon.ico`)

## Key File Locations

**Entry Points:**
- `index.html`: HTML entry point (Vite loads this)
- `src/main.tsx`: JavaScript entry point (mounts React app)
- `src/App.tsx`: React Router setup and route definitions

**Configuration:**
- `package.json`: Dependencies, scripts, project metadata
- `vite.config.ts`: Vite build configuration
- `tsconfig.json`: TypeScript compiler options (references app and node configs)
- `tsconfig.app.json`: TypeScript config for application code
- `tsconfig.node.json`: TypeScript config for build/config files
- `tailwind.config.js`: Tailwind CSS theme customization (doom-red, doom-gold, doom-green, doom-bg)
- `postcss.config.js`: PostCSS plugins (Tailwind)
- `eslint.config.js`: ESLint 9 flat config
- `playwright.config.ts`: Playwright test configuration
- `firebase.json`: Firebase emulator configuration
- `firestore.rules`: Firestore security rules
- `firestore.indexes.json`: Firestore indexes
- `vercel.json`: Vercel deployment config (SPA rewrites)

**Core Logic:**
- `src/hooks/useWeek.ts`: Week data CRUD operations
- `src/hooks/useStats.ts`: Statistics calculations and streak logic
- `src/lib/weekUtils.ts`: Week ID generation and date calculations
- `src/lib/achievements.ts`: Achievement definitions and conditions
- `src/contexts/AuthContext.tsx`: Authentication logic and user state

**Testing:**
- `tests/e2e/auth.spec.ts`: Authentication page tests
- `tests/utils/setup.ts`: Test helper functions
- `playwright.config.ts`: Test runner configuration

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `DoomFace.tsx`, `WeekTracker.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useWeek.ts`, `useStats.ts`)
- Utils/Libs: camelCase (e.g., `weekUtils.ts`, `firebase.ts`)
- Pages: PascalCase (e.g., `Tracker.tsx`, `Dashboard.tsx`)
- Types: camelCase or PascalCase (e.g., `index.ts`)
- Tests: kebab-case with `.spec.ts` suffix (e.g., `auth.spec.ts`)

**Directories:**
- Lowercase with hyphens for build dirs (e.g., `doom-assets/`)
- camelCase for source dirs (e.g., `contexts/`, `hooks/`)
- Singular form preferred (e.g., `lib/` not `libs/`)

**Components:**
- Component names match file names (e.g., `DoomFace.tsx` exports `DoomFace`)
- Default exports for components
- Subdirectory `ui/` for primitive/reusable components

**CSS Classes:**
- DOOM theme classes prefixed with `doom-` (e.g., `doom-panel`, `doom-button`, `doom-red`)
- Utility classes in `src/index.css` under `@layer utilities`
- Animation classes in `src/index.css` with `@keyframes` definitions

**Variables:**
- camelCase for local variables and functions (e.g., `workoutCount`, `handleToggleDay`)
- UPPER_SNAKE_CASE for constants (e.g., `STORAGE_KEY`, `TARGET`)
- Interfaces use PascalCase (e.g., `WeekData`, `UserStats`)

## Where to Add New Code

**New Page:**
- Implementation: `src/pages/YourPage.tsx`
- Route: Add to `src/App.tsx` in `<Routes>` section
- Navigation: Add button to `src/components/BottomNavigation.tsx`
- Icon: Add to `src/assets/icons/` and import in component
- Protection: Wrap route with `<ProtectedRoute>` if auth required

**New Component:**
- Feature component: `src/components/YourComponent.tsx`
- UI primitive: `src/components/ui/YourPrimitive.tsx`
- Tests: `tests/e2e/your-feature.spec.ts`
- Pattern: Export default function, import dependencies at top, TypeScript interfaces for props

**New Hook:**
- Implementation: `src/hooks/useYourHook.ts`
- Pattern: Export default function with `use` prefix, handle both Firebase and localStorage, return object with state and methods
- Example: `export function useYourHook() { const { user } = useAuth(); ... return { data, loading, yourMethod }; }`

**New Utility Function:**
- Shared utilities: `src/lib/yourUtil.ts`
- Migration scripts: `src/utils/yourMigration.ts`
- Pattern: Export named functions, pure functions preferred, no side effects

**New Type:**
- Add to: `src/types/index.ts`
- Pattern: Export interface or type, use PascalCase for type names
- Example: `export interface YourType { field: string; }`

**New Achievement:**
- Add icon: `src/assets/achievements/your_achievement.png`
- Define: Add to `ACHIEVEMENTS` array in `src/lib/achievements.ts`
- Include: `id`, `name`, `description`, `iconSrc`, `category`, `condition` function
- Optional: Add `progress` function for progress tracking

**New Face State:**
- Add images: `src/assets/faces/face_X_state.png` (X = workout count)
- Import: Add to `src/assets/faces/index.ts`
- Logic: Update `FACE_CONFIG` in `src/components/DoomFace.tsx`
- Pattern: Each state needs center, left, right, and optionally ouch variants

**New Context:**
- Implementation: `src/contexts/YourContext.tsx`
- Pattern: Create context with `createContext()`, export Provider component, export custom hook (e.g., `useYour()`)
- Provider: Add to `src/App.tsx` wrapping Routes
- Example structure: Interface, Context creation, Provider component, custom hook with error checking

**New Test:**
- Spec file: `tests/e2e/your-feature.spec.ts`
- Helper: Add utilities to `tests/utils/setup.ts` if reusable
- Pattern: Use `test.describe()` for grouping, `test.beforeEach()` for setup, descriptive test names starting with "should"
- Run: `npm run test:e2e` locally before committing

## Special Directories

**`node_modules/`:**
- Purpose: NPM dependencies
- Generated: Yes (via `npm install`)
- Committed: No (in `.gitignore`)
- Size: Large (~500MB)

**`dist/`:**
- Purpose: Vite build output (production bundle)
- Generated: Yes (via `npm run build`)
- Committed: No (in `.gitignore`)
- Deployed: Yes (to Vercel)

**`test-results/`:**
- Purpose: Playwright test results and artifacts
- Generated: Yes (during test runs)
- Committed: No (in `.gitignore`)
- Artifacts: Screenshots, videos, traces for debugging

**`playwright-report/`:**
- Purpose: HTML test report
- Generated: Yes (via `npm run test:e2e`)
- Committed: No (in `.gitignore`)
- View: `npx playwright show-report`

**`.venv/`:**
- Purpose: Python virtual environment (for Firebase tools)
- Generated: Yes (if using Python Firebase CLI)
- Committed: No (in `.gitignore`)

**`.planning/`:**
- Purpose: Project planning and codebase documentation
- Generated: Yes (by GSD commands)
- Committed: Yes (intentionally tracked for planning continuity)
- Contains: Codebase analysis (ARCHITECTURE.md, STRUCTURE.md), implementation plans, phase documents

## Import Patterns

**Order:**
1. External dependencies (React, Firebase, etc.)
2. Contexts (via custom hooks like `useAuth()`)
3. Custom hooks (via `../hooks/`)
4. Components (via `../components/`)
5. Types (via `../types/`)
6. Assets (via `../assets/`)
7. Utilities (via `../lib/` or `../utils/`)

**Example:**
```typescript
// 1. External
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';

// 2. Contexts
import { useAuth } from '../contexts/AuthContext';

// 3. Hooks
import { useWeek } from '../hooks/useWeek';

// 4. Components
import DoomFace from '../components/DoomFace';

// 5. Types
import type { WeekData } from '../types';

// 6. Assets
import logo from '../assets/logo.png';

// 7. Utilities
import { getCurrentWeekId } from '../lib/weekUtils';
```

**Path Aliases:**
- None currently configured
- All imports use relative paths (`../`)
- Consider adding `@/` alias in future for cleaner imports

## Special Notes

**Firebase Configuration:**
- Environment variables in `.env.local` (NOT committed)
- Required vars: `VITE_FIREBASE_*` (API key, auth domain, project ID, etc.)
- Emulator mode: `VITE_USE_EMULATOR=true` in `.env.test`

**Asset Management:**
- All images must be imported in JavaScript to be bundled
- Face sprites organized: `face_{count}_{state}_{direction}.png`
- Achievement icons: `{achievement_id}.png`
- Navigation icons: `{page_name}.png`

**Testing Files:**
- Test utilities in `tests/utils/setup.ts` (clearStorage, waitForAppReady, getFaceState, etc.)
- Fixture data in `tests/fixtures/` (if needed)
- Test config in `playwright.config.ts` (5 browsers configured)

**Generated Files (Do Not Edit):**
- `package-lock.json` (only update via npm commands)
- `dist/` directory (build output)
- `node_modules/` directory (dependencies)
- `playwright-report/` (test reports)
- `test-results/` (test artifacts)

---

*Structure analysis: 2026-02-25*
