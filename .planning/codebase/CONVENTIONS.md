# Coding Conventions

**Analysis Date:** 2026-02-25

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `DoomFace.tsx`, `WeekTracker.tsx`, `ProfileEditor.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useWeek.ts`, `useStats.ts`, `useAchievements.ts`)
- Utilities/Libraries: camelCase (e.g., `weekUtils.ts`, `achievements.ts`, `firebase.ts`)
- Types: `index.ts` (centralized type definitions)
- Pages: PascalCase (e.g., `Tracker.tsx`, `Dashboard.tsx`, `Login.tsx`)
- Test files: kebab-case with `.spec.ts` suffix (e.g., `auth.spec.ts`, `navigation.spec.ts`)

**Functions:**
- Regular functions: camelCase (e.g., `getFaceImage`, `validateEmail`, `toggleDay`)
- Event handlers: `handle` prefix (e.g., `handleSubmit`, `handleToggleDay`, `handleClick`)
- Async operations: descriptive names (e.g., `loadData`, `saveData`, `recalculateStats`)
- Utility functions: camelCase, verb-first (e.g., `getWeekId`, `formatWeekDisplay`, `isCurrentWeek`)

**Variables:**
- Constants (module-level): SCREAMING_SNAKE_CASE (e.g., `STORAGE_KEY`, `FACE_CONFIG`, `TARGET`)
- React state: descriptive camelCase (e.g., `selectedWeekId`, `isSubmitting`, `showOuch`)
- Props destructured: camelCase matching prop names
- Booleans: `is`, `has`, `should` prefix (e.g., `isLoading`, `hasComeback`, `showGrin`)

**Types:**
- Interfaces: PascalCase (e.g., `DoomFaceProps`, `WeekData`, `AuthContextType`)
- Type aliases: PascalCase (e.g., `FaceLevel`, `WeekStatus`, `AuthMode`)
- Enums: Not used (prefer union types)
- Generic union types: PascalCase (e.g., `FaceDirection = 'center' | 'left' | 'right' | 'ouch'`)

## Code Style

**Formatting:**
- No explicit formatter (no Prettier config detected)
- Indentation: 2 spaces
- Line width: ~120 characters (observed)
- Semicolons: Used consistently
- Quotes: Single quotes for strings, no backticks unless needed for interpolation
- Trailing commas: Used in multiline objects/arrays

**Linting:**
- Tool: ESLint 9 (flat config format)
- Config file: `eslint.config.js`
- Rules enabled:
  - `@eslint/js` recommended
  - `typescript-eslint` recommended
  - `eslint-plugin-react-hooks` flat recommended
  - `eslint-plugin-react-refresh` vite preset
- Target: ES2020
- Globals: Browser environment
- Ignores: `dist/` directory

**Key ESLint Patterns:**
- `eslint-disable-next-line` used sparingly for intentional violations
- Example: `// eslint-disable-next-line react-hooks/set-state-in-effect` in `DoomFace.tsx`
- Example: `// eslint-disable-next-line react-hooks/exhaustive-deps` in `Tracker.tsx` for intentional dependency omission
- Example: `// eslint-disable-next-line react-refresh/only-export-components` in `AuthContext.tsx` for custom hook exports

## Import Organization

**Order:**
1. External dependencies (React, Firebase, third-party)
2. Internal contexts (from `../contexts/`)
3. Internal hooks (from `../hooks/`)
4. Internal utilities/libraries (from `../lib/`)
5. Components (from `../components/`)
6. Types (using `type` import)
7. Assets (images, fonts)

**Example from `src/components/DoomFace.tsx`:**
```typescript
import { useEffect, useState } from 'react';
import { useBoost } from '../contexts/BoostContext';
import { faces, type FaceName } from '../assets/faces';
```

**Example from `src/hooks/useWeek.ts`:**
```typescript
import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatWeekStartDate, getCurrentWeekId } from '../lib/weekUtils';
```

**Path Aliases:**
- None used (relative imports only)
- Imports use `../` navigation from component location

**Type Imports:**
- Use `type` keyword for type-only imports (e.g., `import type { WeekRecord, DashboardStats }`)
- Inline type imports when mixed (e.g., `import { faces, type FaceName }`)

## Error Handling

**Patterns:**
- Try-catch blocks for async operations (Firebase, network)
- Console.error for logging errors
- User-facing error messages via state (displayed in UI)
- Firebase error codes mapped to friendly messages

**Example from `src/contexts/AuthContext.tsx`:**
```typescript
try {
  setError(null);
  setLoading(true);
  await signInWithEmailAndPassword(auth, email, password);
  setIsNewUser(false);
} catch (err: unknown) {
  const firebaseError = err as { code?: string };
  setError(getFirebaseErrorMessage(firebaseError.code || ''));
  throw err;
} finally {
  setLoading(false);
}
```

**Error Mapping:**
```typescript
function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'EMAIL ALREADY IN USE';
    case 'auth/invalid-email':
      return 'INVALID EMAIL FORMAT';
    // ... etc
    default:
      return 'AUTHENTICATION FAILED';
  }
}
```

**Form Validation:**
- Client-side validation before submission
- Validation functions return `string | null` (error message or null)
- Example: `validateEmail(value: string): string | null`
- Display errors using FormError component or inline error text

## Logging

**Framework:** Browser console (no third-party logging library)

**Patterns:**
- `console.error()` for errors (used in catch blocks)
- `console.warn()` in test setup for emulator unavailability
- No `console.log` in production code (removed or commented)

**Example from `src/hooks/useWeek.ts`:**
```typescript
catch (error) {
  console.error('Error loading week data:', error);
}
```

**Test Logging:**
```typescript
console.warn('⚠️  Firebase Emulators unavailable — authenticated tests will be skipped');
```

## Comments

**When to Comment:**
- Complex business logic (face state calculations, streak logic)
- Non-obvious algorithms (ISO week calculations)
- Workarounds or intentional deviations
- Test descriptions (E2E test purposes)
- Section headers in large files

**JSDoc/TSDoc:**
- Used extensively for utility functions in `src/lib/weekUtils.ts`
- Used for test helper functions in `tests/utils/setup.ts`
- Used for test suite descriptions (multi-line comments)
- Interface/type definitions: minimal or no JSDoc (TypeScript provides type info)

**Example from `src/lib/weekUtils.ts`:**
```typescript
/**
 * Get ISO week ID from a date (e.g., "2025-W01")
 */
export function getWeekId(date: Date = new Date()): string {
  // ...
}
```

**Example from `tests/e2e/auth.spec.ts`:**
```typescript
/**
 * Authentication E2E Tests
 *
 * Tests the core authentication page UI and interactions.
 * These tests verify the login/register flow without actual authentication.
 *
 * Note: Actual authentication is tested separately with Firebase emulators.
 */
```

**Inline Comments:**
- Czech comments present in some files (e.g., `DoomFace.tsx`: `// Mapování počtu workoutů na face konfiguraci`)
- English comments preferred for new code
- Explain "why" not "what" (code is self-documenting)

## Function Design

**Size:**
- Small, focused functions (single responsibility)
- Custom hooks: 50-150 lines typically
- Components: 100-200 lines average
- Large components broken into sub-components (e.g., UI components, feature components)

**Parameters:**
- Prefer object destructuring for components (props interface)
- Max 3-4 positional parameters for utility functions
- Optional parameters use `?` or default values
- Example: `function useWeek(weekId: string = getCurrentWeekId())`

**Return Values:**
- Custom hooks return objects with named properties (e.g., `{ data, loading, toggleDay, setStatus, workoutCount }`)
- Utility functions return single typed values
- Validation functions return `string | null` for error messages
- Boolean helpers return `boolean`
- Async functions return `Promise<void>` or `Promise<T>`

**Example Hook Return Pattern:**
```typescript
return {
  data,
  loading,
  toggleDay,
  setStatus,
  workoutCount,
};
```

## Module Design

**Exports:**
- Single default export for components (e.g., `export default function DoomFace()`)
- Named exports for utilities (e.g., `export function getWeekId()`)
- Named exports for types (e.g., `export type WeekStatus`)
- Context providers: named exports for provider and hook
- Assets: named exports from index files

**Example from `src/contexts/AuthContext.tsx`:**
```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  // ...
}

export function useAuth() {
  // ...
}
```

**Barrel Files:**
- Used for assets: `src/assets/faces/index.ts` exports all face images
- Used for types: `src/types/index.ts` exports all type definitions
- Not used for components (direct imports preferred)

**Example from `src/assets/faces/index.ts`:**
```typescript
export type FaceName =
  | 'face_0_critical'
  | 'face_1_hurt'
  // ... etc

export const faces: Record<FaceName, string> = {
  face_0_critical,
  face_1_hurt,
  // ... etc
};
```

## TypeScript Conventions

**Strict Mode:**
- Enabled: `"strict": true` in `tsconfig.app.json`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

**Type Definitions:**
- Explicit return types preferred (not always enforced)
- Prop interfaces defined above component
- Custom types in `src/types/index.ts` or local to file
- Generic types: minimal use, mostly in library code

**Type Assertions:**
- Avoid `any` (strict mode enforced)
- Use `unknown` for error objects, then cast: `err as { code?: string }`
- Use type guards where appropriate

**React-Specific:**
- Component props: `interface ComponentNameProps extends ...`
- Event types: use React's built-in types (e.g., `FormEvent`, `MouseEvent`)
- Ref types: `forwardRef<HTMLInputElement, InputProps>`
- Children: `ReactNode` type

**Example:**
```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: ReactNode;
}
```

## React Patterns

**Component Structure:**
```typescript
// 1. Imports
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component function
export default function MyComponent({ title }: Props) {
  // 3a. Context hooks
  const { user } = useAuth();

  // 3b. State hooks
  const [count, setCount] = useState(0);

  // 3c. Custom hooks
  const { data, loading } = useWeek();

  // 3d. Derived values
  const isActive = count > 0;

  // 3e. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3f. Event handlers
  const handleClick = () => {
    setCount(c => c + 1);
  };

  // 3g. Conditional rendering (early returns)
  if (loading) return <LoadingSpinner />;

  // 3h. Main render
  return <div>{/* JSX */}</div>;
}
```

**State Updates:**
- Immutable updates (spread operators)
- Functional setState when depending on previous state
- Example: `setCount(c => c + 1)` not `setCount(count + 1)`
- Arrays: spread and map (e.g., `const newWorkouts = [...data.workouts]`)

**useCallback Pattern:**
```typescript
const toggleDay = useCallback(async (dayIndex: number) => {
  const newWorkouts = [...data.workouts];
  newWorkouts[dayIndex] = !newWorkouts[dayIndex];

  const newData: WeekData = {
    ...data,
    workouts: newWorkouts,
    updatedAt: new Date(),
  };

  setData(newData);
  await saveData(newData);
}, [data, saveData]);
```

## Styling Patterns

**Tailwind Classes:**
- Utility-first approach
- Template literals for conditional classes
- Example: `className={\`\${baseStyles} \${variantStyles[variant]} \${className}\`}`
- No `clsx` or `classnames` library (manual string concatenation)

**Custom Classes (from `src/index.css`):**
- `doom-panel` - 3D beveled panel with gradient
- `doom-frame` - Golden border frame
- `doom-button` - Red gradient button with 3D effect
- `day-button` - Workout day button
- `god-mode-glow` - Pulsing gold animation (keyframes)
- `ultra-god-glow` - Intense gold animation (6+ workouts)

**Tailwind Theme Extensions (`tailwind.config.js`):**
```javascript
colors: {
  'doom-red': '#b91c1c',
  'doom-gold': '#d4af37',
  'doom-green': '#22c55e',
  'doom-bg': '#0a0a0a',
}
fontFamily: {
  doom: ['AmazDoom', 'sans-serif'],
  pixel: ['"Press Start 2P"', 'monospace'],
}
```

**Responsive Design:**
- Mobile-first approach
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Example: vertical stack on mobile, horizontal on desktop

**Animation:**
- CSS keyframes defined in `index.css`
- Applied via Tailwind classes
- Example: `animation: pulse-gold 1.5s ease-in-out infinite`

## State Management

**Local State:**
- `useState` for component-specific state
- Example: `const [showOuch, setShowOuch] = useState(false);`

**Global State (Context):**
- `AuthContext` - User authentication state
- `AchievementContext` - Achievement system state
- `BoostContext` - Motivation boost state
- Pattern: Provider component + custom hook

**Data Fetching:**
- Custom hooks (`useWeek`, `useStats`, `useAllWeeks`, `useFriends`)
- Firebase SDK directly (no React Query or SWR)
- LocalStorage fallback for guest users

**Computed Values:**
- Derived in component body (not state)
- Example: `const workoutCount = data.workouts.filter(Boolean).length;`
- Memoized with `useMemo` for expensive calculations (not heavily used)

---

*Convention analysis: 2026-02-25*
