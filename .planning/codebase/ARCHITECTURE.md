# Architecture

**Analysis Date:** 2026-02-25

## Pattern Overview

**Overall:** Component-Based SPA with Hook-Driven Data Layer

**Key Characteristics:**
- React 19 functional components with hooks for all state management
- Firebase-first backend with localStorage fallback for guest users
- Context-based global state for auth, achievements, and boost features
- Custom hooks encapsulate all data persistence and business logic
- Client-side routing with React Router 7
- Optimistic UI updates with async persistence

## Layers

**Presentation Layer:**
- Purpose: UI components and user interaction
- Location: `src/components/`, `src/pages/`
- Contains: React components, visual logic, event handlers
- Depends on: Contexts (AuthContext, AchievementContext, BoostContext), Custom Hooks (useWeek, useStats, useFriends), UI primitives
- Used by: App router (`src/App.tsx`)

**State Management Layer:**
- Purpose: Global application state and cross-component coordination
- Location: `src/contexts/`
- Contains: React Context providers (AuthContext, AchievementContext, BoostContext)
- Depends on: Firebase SDK (`firebase/auth`), Custom Hooks (useAchievements)
- Used by: Components, Pages, Custom Hooks via context hooks (useAuth, useAchievementContext, useBoost)

**Data Access Layer:**
- Purpose: Business logic and data persistence operations
- Location: `src/hooks/`
- Contains: Custom hooks for CRUD operations (`useWeek.ts`), calculations (`useStats.ts`), aggregations (`useAllWeeks.ts`), social features (`useFriends.ts`, `useProfile.ts`), gamification (`useAchievements.ts`)
- Depends on: Firebase SDK (`firebase/firestore`), AuthContext, Utility functions
- Used by: Components, Pages, Contexts

**Utility Layer:**
- Purpose: Pure functions, configurations, type definitions
- Location: `src/lib/`, `src/types/`, `src/utils/`
- Contains: Firebase config (`lib/firebase.ts`), week calculations (`lib/weekUtils.ts`), achievement definitions (`lib/achievements.ts`), TypeScript types (`types/index.ts`), migration utilities (`utils/migrateFriendSystem.ts`)
- Depends on: External SDKs only (Firebase SDK)
- Used by: All layers

**Asset Layer:**
- Purpose: Static resources and asset management
- Location: `src/assets/`
- Contains: Images (faces, achievements, icons), asset index files (`faces/index.ts`)
- Depends on: Nothing
- Used by: Components

## Data Flow

**User Interaction Flow:**

1. User triggers event in Component (e.g., clicks workout day button in `WeekTracker.tsx`)
2. Component calls event handler (e.g., `handleToggleDay` in `Tracker.tsx`)
3. Event handler calls Custom Hook method (e.g., `toggleDay()` from `useWeek.ts`)
4. Hook updates local React state optimistically (immediate UI feedback)
5. Hook persists to Firebase/localStorage asynchronously (`saveData()` method)
6. React re-renders component with new state
7. Related hooks may trigger (e.g., `recalculateStats()` in `useStats.ts`)
8. Achievement system checks for unlocks via `AchievementContext`

**Authentication Flow:**

1. User interacts with Login page (`pages/Login.tsx`)
2. Login page calls `useAuth()` context methods (`signInWithGoogle`, `signInWithEmail`, etc.)
3. `AuthContext.tsx` executes Firebase Auth operation (signInWithPopup, signInWithEmailAndPassword)
4. Firebase triggers `onAuthStateChanged` listener in `AuthContext`
5. `AuthContext` updates user state (`setUser`)
6. `ProtectedRoute.tsx` component detects user change
7. If authenticated, renders children; otherwise redirects to `/login`
8. All custom hooks detect `user` change in useEffect dependencies and reload data

**Data Persistence Flow (Authenticated):**

1. Hook receives data mutation request (e.g., `toggleDay(0)`)
2. Hook updates local React state immediately via `setData()` (optimistic update)
3. Hook calls Firebase SDK methods (`setDoc(docRef, data)`)
4. Firestore persists data to cloud asynchronously
5. Server timestamp applied via `serverTimestamp()`
6. Other devices/sessions require refresh to see changes (no real-time listeners currently)

**Data Persistence Flow (Guest):**

1. Hook receives data mutation request
2. Hook updates local React state immediately via `setData()`
3. Hook calls `localStorage.setItem(key, JSON.stringify(data))` synchronously
4. Data persists to browser storage only (no cross-device sync)

**State Management:**
- Local component state via `useState` for UI-only concerns (modal visibility, loading states, selected week)
- Context state for cross-component features (auth user, achievement notifications, boost mode)
- Custom hooks for data-backed state (weeks, stats, friends, profile)
- No external state management library (Redux, Zustand, MobX) used

## Key Abstractions

**Week Data Model:**
- Purpose: Represents a single ISO week of workout tracking
- Examples: `src/hooks/useWeek.ts` (CRUD operations), `src/lib/weekUtils.ts` (date calculations)
- Pattern: ISO 8601 week numbering (YYYY-Www format), Monday-Sunday range, 7-boolean array for workouts
- Data Structure: `{ startDate: string, workouts: boolean[], status: 'normal' | 'sick' | 'vacation', updatedAt: Date }`
- Firestore Path: `users/{uid}/weeks/{weekId}`
- Operations: `toggleDay(index)`, `setStatus(status)`, calculate `workoutCount`

**Stats Aggregation:**
- Purpose: Calculate metrics across all weeks (streaks, totals, averages)
- Examples: `src/hooks/useStats.ts` (main calculations), `src/hooks/useAllWeeks.ts` (multi-week data)
- Pattern: Firestore query all weeks orderBy startDate desc, compute in-memory, cache result in stats document
- Data Structure: `{ totalWorkouts: number, currentStreak: number, longestStreak: number }`
- Firestore Path: `users/{uid}/stats/current`
- Operations: `recalculateStats()` (full recalc), `updateStats(delta)` (quick update)
- Streak Logic: 3+ workouts = success week, sick/vacation weeks skipped, consecutive successes counted

**Achievement System:**
- Purpose: Track and unlock achievement badges based on user progress
- Examples: `src/lib/achievements.ts` (definitions), `src/hooks/useAchievements.ts` (logic), `src/contexts/AchievementContext.tsx` (global state)
- Pattern: Definition array with condition functions, check on stats change, persist unlocks to Firestore, display toast notifications
- Data Structure: `{ id: string, name: string, description: string, iconSrc: string, category: string, condition: (stats, weeks) => boolean }`
- Firestore Path: `users/{uid}/achievements/unlocked` (document with unlocked IDs array)
- Operations: Check conditions, unlock achievement, dismiss notification, show confetti

**Friend System:**
- Purpose: Bi-directional friend connections with workout visibility
- Examples: `src/hooks/useFriends.ts` (operations), `src/pages/Squad.tsx` (UI), `src/components/WeeklyLeaderboard.tsx` (ranking)
- Pattern: Unique friend code per user, Firestore query for discovery, bi-directional friend document writes
- Data Structure: Friend code in `users/{uid}/profile/info`, friend links in `users/{uid}/friends/{friendUid}`
- Friend Code Format: `ABCD1234#5678` (generated from UID + random suffix)
- Operations: `addFriend(code)`, `removeFriend(uid)`, `loadFriendStats()`, calculate leaderboard rankings

**Face State Mapping:**
- Purpose: Visual representation of workout progress via DoomGuy face sprites
- Examples: `src/components/DoomFace.tsx` (rendering), `src/types/index.ts` (type definitions), `src/assets/faces/index.ts` (sprite imports)
- Pattern: Workout count maps to face level (0-6), each level has multiple sprites (center, left, right, ouch), random looking animation
- Face States: critical (0), hurt (1), damaged (2), healthy (3), strong (4), godmode (5+)
- Animation: Random direction changes every 900-1100ms, ouch face on workout removal (500ms), god mode glow effect
- Operations: Calculate face level from workout count, select sprite based on direction/state, animate transitions

## Entry Points

**Application Bootstrap:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html`, Vite injects script tag
- Responsibilities: Mount React root to `#root` element, wrap App in `StrictMode` and `AuthProvider`, import global CSS (`index.css`), import migration utility

**Router & Layout:**
- Location: `src/App.tsx`
- Triggers: `AuthProvider` renders children after auth state initialized
- Responsibilities: Setup `BrowserRouter`, define routes (/, /login, /dashboard, /achievements, /squad, /settings), wrap protected routes in `ProtectedRoute`, provide `AchievementProvider` and `BoostProvider`, render `AppLayout` with navigation

**Authentication Gate:**
- Location: `src/components/ProtectedRoute.tsx`
- Triggers: Route requires authentication (all routes except `/login`)
- Responsibilities: Check `user` from `useAuth()`, show `LoadingSpinner` while auth loading, redirect to `/login` if not authenticated, render children if authenticated

**Public Entry:**
- Location: `src/pages/Login.tsx`
- Triggers: User visits `/login` or redirected from `ProtectedRoute`
- Responsibilities: Display auth forms (login, register, password reset modal), handle form validation, call auth context methods, display Firebase error messages, redirect to `/` on success

**Main Application:**
- Location: `src/pages/Tracker.tsx`
- Triggers: Authenticated user visits root `/`
- Responsibilities: Display current week tracker, manage workout day toggles, show DoomGuy face, coordinate stats recalculation, show progress bar and boost button, handle week navigation

## Error Handling

**Strategy:** Fail gracefully with user-facing messages, log to console for debugging

**Patterns:**
- Firebase Auth errors mapped to user-friendly messages via `getFirebaseErrorMessage()` function in `src/contexts/AuthContext.tsx`
- Try-catch blocks in all async hook operations (`useWeek.ts`, `useStats.ts`, `useFriends.ts`, `useProfile.ts`, `useAchievements.ts`)
- Error state variables in hooks (e.g., `const [error, setError] = useState<string | null>(null)`)
- Toast notifications for operation failures (add friend error, save data error) via `src/components/Toast.tsx`
- Console.error for debugging without interrupting user flow (all catch blocks log error)
- No global error boundary component currently implemented (errors isolated to component level)
- Firebase operations throw errors up to calling components for handling

## Cross-Cutting Concerns

**Logging:**
- Console.error for exceptions in all try-catch blocks
- Console.log for Firebase emulator connection notice in `src/lib/firebase.ts`
- Console.warn for emulator connection issues
- No structured logging service or error tracking (Sentry, LogRocket) currently integrated

**Validation:**
- Client-side form validation in `src/pages/Login.tsx` (email format via regex, password length >= 6, password match for registration)
- Firebase Auth handles server-side validation and returns error codes
- Friend code format validation in `src/hooks/useFriends.ts` (checks for # separator and numeric suffix)
- Week ID format validation implicit in `src/lib/weekUtils.ts` functions (ISO 8601 format enforcement)
- No validation library (Zod, Yup) currently used

**Authentication:**
- Centralized in `src/contexts/AuthContext.tsx`
- Firebase Auth SDK with Google OAuth and Email/Password providers
- Protected routes via `src/components/ProtectedRoute.tsx` wrapper component
- User object accessible via `useAuth()` hook throughout application
- Optional Firebase emulator connection for testing (controlled by `VITE_USE_EMULATOR` environment variable in `src/lib/firebase.ts`)
- Session persistence handled by Firebase Auth (defaults to LOCAL persistence)

**Data Synchronization:**
- Optimistic updates (UI updates immediately before server confirms)
- No Firestore real-time listeners currently implemented (onSnapshot)
- Multi-device sync requires manual refresh (reload page to see changes from other devices)
- LocalStorage fallback for guest users (no sync across devices or browsers)
- Stats recalculation triggered manually after data mutations via `recalculateStats()` in components

**Offline Support:**
- Detection via `navigator.onLine` in `src/components/OfflineIndicator.tsx`
- Yellow indicator badge shows when offline
- Guest mode fully functional offline (localStorage only, no network required)
- Authenticated mode shows indicator but Firestore operations may fail without network
- No offline queue or service worker currently implemented
- No PWA manifest or install prompt

---

*Architecture analysis: 2026-02-25*
