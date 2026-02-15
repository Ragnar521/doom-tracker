# Rep & Tear - Claude Context File

This document provides comprehensive context for Claude Code to effectively work with the Rep & Tear codebase.

## Project Overview

**Rep & Tear** is a DOOM-themed progressive web app for tracking weekly gym workouts. It gamifies fitness through visual feedback (DoomGuy face states), achievements, streak tracking, and retro aesthetics.

**Live Status:** Deployed on Vercel
**Initial Launch:** January 4, 2026
**Active Development:** Yes
**Primary Language:** TypeScript
**Framework:** React 19.2 + Vite

## Project Structure

```
doom-tracker/
├── .claude/                    # Claude context files
│   └── CLAUDE.md              # This file
├── src/
│   ├── assets/                # Static image assets
│   │   ├── faces/            # 80+ DoomGuy face sprites (PNG)
│   │   │   ├── index.ts      # Face exports and type definitions
│   │   │   └── face_*.png    # Organized by state and direction
│   │   ├── achievements/     # 18+ achievement badge icons
│   │   └── icons/            # Navigation icons (5 pages)
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── FormError.tsx
│   │   ├── DoomFace.tsx      # Main character face component (complex)
│   │   ├── WeekTracker.tsx   # 7-day workout grid
│   │   ├── WeekNavigation.tsx
│   │   ├── StatsPanel.tsx
│   │   ├── BottomNavigation.tsx
│   │   ├── AchievementToast.tsx
│   │   ├── Confetti.tsx
│   │   ├── BoostButton.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── Toast.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── OfflineIndicator.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── AuthButton.tsx
│   │   ├── ProfileEditor.tsx # Profile editing component (v1.3+)
│   │   └── WelcomeToast.tsx
│   ├── contexts/             # React Context providers (global state)
│   │   ├── AuthContext.tsx   # Firebase auth + user state
│   │   ├── AchievementContext.tsx  # Achievement system state
│   │   └── BoostContext.tsx  # Motivation boost state
│   ├── hooks/                # Custom React hooks (data layer)
│   │   ├── useWeek.ts        # Single week CRUD operations
│   │   ├── useStats.ts       # Calculated statistics
│   │   ├── useAllWeeks.ts    # Multi-week aggregation
│   │   ├── useAchievements.ts # Achievement unlock logic
│   │   ├── useFriends.ts     # Friend system operations
│   │   └── useProfile.ts     # Profile management (v1.3+)
│   ├── lib/                  # Utilities and configuration
│   │   ├── firebase.ts       # Firebase initialization
│   │   ├── achievements.ts   # Achievement definitions (18+)
│   │   ├── weekUtils.ts      # Date/week calculations (ISO 8601)
│   │   └── music.ts          # Audio utilities
│   ├── pages/                # Route components
│   │   ├── Tracker.tsx       # Main workout tracking view
│   │   ├── Dashboard.tsx     # Analytics and statistics
│   │   ├── Achievements.tsx  # Achievement showcase
│   │   ├── Squad.tsx         # Friend system page (v1.1+)
│   │   ├── Settings.tsx      # Account settings
│   │   └── Login.tsx         # Authentication page
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                # Utility functions
│   │   └── migrateFriendSystem.ts  # Friend system migration
│   ├── App.tsx               # Root component + routing setup
│   ├── main.tsx              # Entry point (React render)
│   └── index.css             # Global styles + DOOM theme (629 lines)
├── doom-assets/              # Original asset sources (not used in build)
│   ├── faces/
│   ├── achievement-icons/
│   ├── icons/
│   ├── fonts/
│   └── hud/
├── public/                   # Static files served as-is
├── .env.local                # Firebase config (NOT in git)
├── .gitignore
├── eslint.config.js          # ESLint 9 flat config
├── index.html                # HTML entry point
├── package.json
├── package-lock.json
├── postcss.config.js         # PostCSS with Tailwind
├── tailwind.config.js        # Tailwind theme extensions
├── tsconfig.json             # TypeScript config (main)
├── tsconfig.app.json         # App-specific TS config
├── tsconfig.node.json        # Node/build TS config
├── vite.config.ts            # Vite build configuration
├── vercel.json               # Vercel deployment config
├── README.md                 # Developer documentation
└── PRODUCT.md                # Product strategy & roadmap
```

## Tech Stack

### Core Framework
- **React 19.2** - Latest React with concurrent features
- **TypeScript ~5.9** - Type safety throughout
- **Vite 7.2** - Build tool (fast HMR, optimized builds)
- **React Router 7.11** - Client-side routing

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Custom CSS** - Extensive DOOM-themed animations in `index.css`

### Backend & Services
- **Firebase 12.7** - BaaS platform
  - Authentication (Google OAuth, Email/Password)
  - Firestore (NoSQL database)
  - Real-time sync across devices
- **Fallback:** LocalStorage for guest users

### Development Tools
- **ESLint 9** - Linting with flat config
- **TypeScript ESLint** - TS-specific rules
- **React Hooks ESLint** - Hook rules enforcement
- **React Refresh ESLint** - Fast refresh validation

### Deployment
- **Vercel** - Hosting platform
- **SPA Routing** - Handled via vercel.json rewrites

## Key Architecture Patterns

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Custom Hook (useWeek, useStats, etc.)
    ↓
Firebase/LocalStorage
    ↓
State Update (React setState)
    ↓
Component Re-render
```

### State Management

1. **Local Component State** - useState for UI-only state
2. **React Context** - Auth, Achievements, Boost (cross-component)
3. **Custom Hooks** - Data fetching and business logic
4. **Firebase/LocalStorage** - Persistent storage

### Data Persistence Strategy

- **Authenticated Users:** Firebase Firestore (real-time sync)
- **Guest Users:** LocalStorage (per-device)
- **Optimistic Updates:** UI updates immediately, sync in background
- **Offline Support:** LocalStorage cache + offline indicator

## Data Models

### Week Document Structure

**Firestore Path:** `users/{uid}/weeks/{weekId}`

```typescript
{
  startDate: string;           // ISO date of Monday (e.g., "2026-01-06")
  workouts: boolean[];         // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  status: 'normal' | 'sick' | 'vacation';
  updatedAt: Timestamp;        // Firebase server timestamp
}
```

### Week ID Format

Format: `YYYY-Www` (ISO 8601 week numbering)
- Example: `2026-W02`
- Week starts Monday, ends Sunday
- Generated by `getCurrentWeekId()` in `lib/weekUtils.ts`

### Face States

```typescript
0 workouts → 'critical' (face_0_critical.png)
1 workout  → 'hurt'     (face_1_hurt.png)
2 workouts → 'damaged'  (face_2_damaged.png)
3 workouts → 'healthy'  (face_3_healthy.png) ✓ minimum target
4 workouts → 'strong'   (face_4_strong.png) ⭐ ideal target
5 workouts → 'godmode'  (face_5_6_godmode.png) 🔥 berserk
6-7 workouts → 'godmode' (face_godmode_eyes.png) 🔥🔥 ultra god mode
```

Each state has variations: `center`, `left`, `right`, `ouch`

### Achievement System

18+ achievements defined in `src/lib/achievements.ts`

Categories:
- **Streak:** Consistency-based (4-52 weeks)
- **Performance:** Volume-based (1-1000 workouts, God Mode weeks)
- **Special:** Behavior-based (Monday workouts, comebacks)
- **Hidden:** Secret achievements (unlocked only)

Each achievement has:
```typescript
{
  id: string;
  name: string;
  description: string;
  iconSrc: string;
  category: AchievementCategory;
  condition: (stats, weeks) => boolean;
  progress?: (stats, weeks) => { current, target };
}
```

## Coding Conventions

### TypeScript

1. **Strict Mode:** Enabled in tsconfig.json
2. **Explicit Types:** Prefer explicit return types on functions
3. **Interface over Type:** Use `interface` for object shapes
4. **Type Guards:** Use type predicates where needed
5. **No `any`:** Avoid `any`, use `unknown` if necessary

### React

1. **Functional Components:** No class components
2. **Hooks:** Use hooks for state and side effects
3. **Custom Hooks:** Extract reusable logic to custom hooks
4. **Props:** Destructure props in function signature
5. **Event Handlers:** Prefix with `handle` (e.g., `handleClick`)
6. **Context:** Use for truly global state only

### File Naming

- **Components:** PascalCase (e.g., `DoomFace.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useWeek.ts`)
- **Utils/Libs:** camelCase (e.g., `weekUtils.ts`)
- **Types:** PascalCase or camelCase (e.g., `index.ts`)
- **Pages:** PascalCase (e.g., `Dashboard.tsx`)

### Import Order

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';

// 2. Internal absolute imports (contexts, hooks, lib)
import { useAuth } from '../contexts/AuthContext';
import { useWeek } from '../hooks/useWeek';
import { getCurrentWeekId } from '../lib/weekUtils';

// 3. Components
import DoomFace from '../components/DoomFace';
import WeekTracker from '../components/WeekTracker';

// 4. Types
import type { WeekData, WeekStatus } from '../types';

// 5. Assets
import logo from '../assets/logo.png';
```

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// 2. Types/Interfaces
interface Props {
  title: string;
  onClose: () => void;
}

// 3. Component
export default function MyComponent({ title, onClose }: Props) {
  // 3a. Hooks
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  // 3b. Derived state
  const isActive = count > 0;

  // 3c. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3d. Event handlers
  const handleClick = () => {
    setCount(c => c + 1);
  };

  // 3e. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Styling

1. **Tailwind First:** Use Tailwind utilities for most styling
2. **Custom Classes:** Define in `index.css` for complex/reusable styles
3. **Class Naming:** Use `doom-*` prefix for DOOM-themed classes
4. **Responsive:** Mobile-first approach
5. **Animations:** Define keyframes in CSS, apply via Tailwind

### State Updates

1. **Immutable:** Always return new objects/arrays
2. **Functional Updates:** Use `setState(prev => ...)` when depending on previous state
3. **Batching:** Multiple setState calls are batched in React 18+

### Error Handling

1. **Try-Catch:** Wrap async operations
2. **User Feedback:** Show error toasts/messages
3. **Console Errors:** Log errors for debugging
4. **Firebase Errors:** Map error codes to user-friendly messages (see `AuthContext.tsx`)

## Common Commands

### Development

```bash
# Start dev server (localhost:5173)
npm run dev

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit with descriptive message
git commit -m "Add feature: description"

# Push to remote
git push origin feature/your-feature-name
```

### Firebase

```bash
# Install Firebase CLI (one-time)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy to Firebase Hosting (alternative to Vercel)
firebase deploy --only hosting
```

### Testing (Not Currently Implemented)

```bash
# No test suite configured yet
# Future: npm test (Vitest recommended)
```

## Project-Specific Context

### Week Calculations

- **Week Start:** Monday (ISO 8601 standard)
- **Week ID Generation:** `getCurrentWeekId()` in `weekUtils.ts`
- **Navigation:** Weeks are navigated by incrementing/decrementing week numbers
- **Status:** Weeks can be marked "sick" or "vacation" to exclude from streak calculations

### Streak Logic

Defined in `src/hooks/useStats.ts` and `src/hooks/useAllWeeks.ts`

**Streak Requirements:**
- 3+ workouts in a week = success
- Consecutive successful weeks = streak
- Sick/vacation weeks don't break streak (skipped in calculation)
- Current streak counts from most recent success back
- Longest streak is historical maximum

### Achievement Unlocking

- **Check Frequency:** On app load, after workout toggle, after stats recalculation
- **Storage:** Unlocked achievements stored in Firestore (`users/{uid}/achievements`)
- **Notifications:** Toast + confetti animation on unlock
- **Hidden Achievements:** Only visible after unlock

### Face Animation System

Implemented in `src/components/DoomFace.tsx`

**Behaviors:**
- **Random Looking:** Every 900-1100ms (random variation for organic feel), face looks left/right/center
  - Applies to: Hurt Bad (1), Damaged (2), Healthy (3), Strong (4), Berserk (5)
  - Direction probabilities: 50% center, 25% left, 25% right
- **Ouch Face:** Shows when workout is removed (500ms)
- **Grin Face:** Shows during boost mode
- **God Mode:** Special golden glow effect + yellow eyes, no left/right movement (static)
- **Critical:** No animations, static face (only 1 sprite available)
- **Blinking:** Removed in v1.4 (caused unwanted face disappearing)

### Offline Behavior

- **Detection:** `OfflineIndicator.tsx` monitors `navigator.onLine`
- **Guest Mode:** Works fully offline with LocalStorage
- **Authenticated:** Writes queue when offline, syncs when online
- **User Feedback:** Yellow badge shows when offline

### Boost Mode

Triggered by "BOOST MOTIVATION" button on Tracker page

**Effects:**
- Opens DOOM soundtrack on YouTube (new tab)
- Shows grin face for 10 seconds
- Red pulsing frame animation
- Faster face animation speed

### Squad System (Friend Feature)

Added in v1.1 (January 10, 2026)

Implemented in `src/pages/Squad.tsx` and `src/hooks/useFriends.ts`

**Friend Code System:**
- Each user gets unique code on first sign-in (format: `ABCD1234#5678`)
- Generated from user UID + random 4-digit suffix
- Stored in `users/{uid}/profile/info` document

**Data Structure:**
```typescript
users/{uid}/
  profile/info: {
    friendCode: string,
    displayName: string,
    photoURL: string | null,
    createdAt: Timestamp
  }
  friends/{friendUid}: {
    addedAt: Timestamp
  }
```

**Key Features:**
- Instant bi-directional friend adding (no approval needed)
- Friends can see each other's exact workout days
- Friend list sorted by status (struggling marines first)
- Real-time workout progress tracking
- Remove friends functionality

**Important Notes:**
- Parent `users/{uid}` document MUST exist for friend discovery
- New users automatically get parent document created
- Existing users may need migration via `window.migrateFriendSystem()`
- Firestore rules allow authenticated users to read other users' profiles

### Weekly Leaderboard (v1.2+)

Added in January 14, 2026

Implemented in `src/components/WeeklyLeaderboard.tsx`

**Features:**
- Shows ranking of user + all friends based on current week workouts
- Top 3 positions have special badge styling (gold, silver, bronze)
- Current user is highlighted with red border
- Displays workout count (X/7) and face state for each entry
- Sorted by workout count (descending), ties broken alphabetically
- Limited to top 10 for display, shows "+X more marines" if more exist
- Only visible when user has at least 1 friend

**Rank Badges:**
- 1st place: Gold badge (`bg-doom-gold`)
- 2nd place: Silver badge (`bg-gray-400`)
- 3rd place: Bronze badge (`bg-yellow-700`)
- 4th+: Gray badge (`bg-gray-800`)

**Integration:**
- Appears on Squad page between "Add Marine" and "Friends List"
- Uses existing friend data (no additional Firestore queries)
- Combines current user's workout data with friends' data

**Visual Design:**
- DOOM-themed panel with gold title
- Compact card layout for each entry
- Face state color coding (critical→godmode)
- Current user gets `bg-doom-red/20` highlight

### Profile Editing System (v1.3+)

Added in January 15, 2026

Implemented in `src/pages/Settings.tsx`, `src/components/ProfileEditor.tsx`, and `src/hooks/useProfile.ts`

**Features:**
- Users can edit their display name (max 30 characters)
- Display name updates in Firebase Auth and Firestore profile
- Changes propagate to Squad system (friends see updated name)
- Inline editing on Settings page (no modal popup)
- Toast notifications for success/error states

**Important Notes:**
- **NO AVATAR UPLOAD** - Firebase Storage requires paid plan (Blaze)
- Avatar displays as first letter of display name or email
- OAuth users (Google) get photoURL from their Google account automatically
- Custom avatars not supported to avoid Firebase Storage costs

**Data Structure:**
```typescript
users/{uid}/profile/info: {
  friendCode: string,
  displayName: string,
  photoURL: string | null,  // Only from OAuth, not uploadable
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**UI Flow:**
1. Settings page shows "EDIT" button next to "ACCOUNT" header
2. Clicking "EDIT" expands inline editing form (auto-opens input field)
3. User can change display name
4. "CANCEL" button collapses form back to view mode
5. Successful save auto-collapses and shows toast notification

### "How It Works" Section (v1.3+)

Added in January 15, 2026

Implemented in `src/pages/Settings.tsx` within the ABOUT panel

**Features:**
- Expandable section with detailed app explanation
- Toggle button: "► HOW IT WORKS" / "▼ HIDE HOW IT WORKS"
- Comprehensive guide covering:
  - 🎯 Weekly Goals - Target requirements (3+ workouts)
  - 💪 DoomGuy States - All face states from Critical to God Mode
  - 🔥 Streaks - How streak counting works (current week logic)
  - 🏆 Achievements - Badge system overview
  - 👥 Squad - Friend features explained
  - 💾 Data Sync - Cloud vs local storage info
- DOOM-themed styling with gold headers
- Collapsible to save space when not needed

**UI Location:**
- Settings page → ABOUT panel → "HOW IT WORKS" button
- Expands in-place within the ABOUT panel
- Stays expanded until user clicks to hide

**Content Structure:**
Each section has:
- Gold colored header (e.g., "WEEKLY GOALS")
- Clear explanation in gray text
- Color-coded keywords (doom-green, doom-gold, doom-red)
- Bulleted lists for DoomGuy states
- Ending motto: "RIP & TEAR, UNTIL IT IS DONE!"

### "Credits & Legal" Section (v1.3+)

Added in January 15, 2026

Implemented in `src/pages/Settings.tsx` within the ABOUT panel

**Features:**
- Expandable section with legal disclaimer and credits
- Toggle button: "► CREDITS & LEGAL" / "▼ HIDE CREDITS & LEGAL"
- Gray styling (less prominent than "How It Works")
- Comprehensive information covering:
  - Legal disclaimer (unofficial fan project)
  - Graphics & Sound credits (© id Software/Bethesda)
  - Development credits (created by Ragnar521)
  - Open-source and educational purpose statement
- Fair use compliance statement

**UI Location:**
- Settings page → ABOUT panel → "CREDITS & LEGAL" button
- Located below "HOW IT WORKS" button
- Expands in-place within the ABOUT panel
- Stays expanded until user clicks to hide

**Content Structure:**
- Centered disclaimer text (small gray font)
- Three sections with headers:
  1. "GRAPHICS & SOUND" - Copyright notice
  2. "DEVELOPMENT" - Creator credit (Ragnar521 in gold)
  3. Educational purpose statement
- Professional tone, legal compliance focused

### Color Scheme

Defined in `tailwind.config.js`:
- `doom-red`: #b91c1c (critical states)
- `doom-gold`: #d4af37 (achievements, god mode)
- `doom-green`: #22c55e (success states)
- `doom-bg`: #0a0a0a (background)

### Custom CSS Classes

Key classes in `index.css`:
- `.scanlines` - CRT scanline effect
- `.doom-panel` - 3D beveled panel
- `.doom-frame` - Golden frame for face
- `.god-mode-glow` - Pulsing golden glow
- `.ultra-god-glow` - Intense golden glow (6+ workouts)
- `.doom-button` - Red gradient button
- `.day-button` - Workout day button
- `.achievement-card` - Achievement display card
- `.confetti` - Particle animation

## Firebase Configuration

### Environment Variables

Required in `.env.local` (not in git):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Firestore Security Rules

**Updated for v1.1+ (Squad System)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow authenticated users to read any user (for friend discovery)
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;

      match /weeks/{weekId} {
        // Allow friends to read workout data
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == userId;
      }

      match /achievements/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /profile/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        allow read: if request.auth != null;  // Friend discovery
      }

      match /friends/{friendId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == friendId;  // Bi-directional adds
      }
    }
  }
}
```

### Authentication Methods Enabled

- Google OAuth (primary)
- Email/Password (secondary)

## Known Issues & Quirks

### Image Loading

- All face images must be imported in `src/assets/faces/index.ts`
- Image paths use absolute imports from `/src/assets/`
- `image-rendering: pixelated` is critical for retro look

### Week Navigation Edge Cases

- Weeks in the far future (50+ years) may have edge cases
- Week 53 in some years (ISO 8601 has 52 or 53 weeks)
- Currently not validated, assumed normal usage patterns

### Firebase Costs

- Free tier: 50k reads, 20k writes, 1GB storage per day
- Current usage: Minimal (well within free tier)
- Monitor if user base grows significantly

### LocalStorage Limitations

- 5-10MB limit per origin (browser-dependent)
- Estimated capacity: ~10,000 weeks of data per user
- No garbage collection (grows indefinitely)

### Browser Compatibility

- Requires modern JavaScript (ES2020+)
- CSS Grid and Flexbox (IE11 not supported)
- Firebase requires IndexedDB support

## Development Workflow

### Adding a New Page

1. Create component in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation button in `src/components/BottomNavigation.tsx`
4. Add icon to `src/assets/icons/` if needed
5. Update this file with new page context

### Adding a New Achievement

1. Add icon PNG to `src/assets/achievements/`
2. Import in `src/lib/achievements.ts`
3. Add to `ACHIEVEMENTS` array with condition function
4. Test condition logic thoroughly
5. Update `PRODUCT.md` roadmap if major addition

### Modifying Face States

1. Add/modify images in `src/assets/faces/`
2. Update imports in `src/assets/faces/index.ts`
3. Modify logic in `src/components/DoomFace.tsx`
4. Update `FACE_CONFIG` object if adding new levels
5. Update README.md feature list

### Styling Changes

1. **Utility Classes:** Add to Tailwind config if reusable
2. **Custom Classes:** Add to `src/index.css` under `@layer utilities`
3. **Animations:** Define keyframes in CSS, apply via class
4. **Test Responsive:** Check mobile (375px), tablet (768px), desktop (1024px)

## Testing Guidelines (When Implemented)

### Unit Tests (Vitest Recommended)

- Test utility functions (`weekUtils.ts`, `achievements.ts`)
- Test achievement conditions
- Test custom hooks in isolation
- Mock Firebase in tests

### Integration Tests

- Test full user flows (login → track workout → check stats)
- Test week navigation
- Test achievement unlocking

### E2E Tests (Playwright Recommended)

- Test critical paths (signup, track workout, view dashboard)
- Test across browsers (Chrome, Firefox, Safari)
- Test mobile viewport

## Performance Considerations

### Bundle Size

Current optimizations:
- Code splitting by route (React.lazy)
- Tree-shaking enabled (Vite default)
- Dynamic imports for heavy components
- Image assets optimized (PNG-8 where possible)

### Render Optimizations

- `useMemo` for expensive calculations
- `useCallback` for event handlers passed to children
- `React.memo` for pure components (not currently used)

### Firebase Query Optimization

- Index-free queries (simple gets by document ID)
- Batch reads where possible
- Cache with LocalStorage fallback

## Debugging Tips

### Firebase Issues

```typescript
// Enable Firebase debug logging
import { setLogLevel } from 'firebase/app';
setLogLevel('debug');
```

### React DevTools

- Install React DevTools browser extension
- Inspect component props and state
- Profile render performance

### Network Issues

- Check browser Network tab for Firestore requests
- Verify CORS settings if API errors
- Check Firebase Console for quota limits

### CSS Issues

- Use browser DevTools to inspect computed styles
- Check Tailwind Play CDN for utility class reference
- Verify custom class precedence in index.css

## Security Notes

### Firebase Rules

- All data scoped to authenticated user UID
- No public read/write access
- Email enumeration protection enabled in Firebase Console

### Environment Variables

- NEVER commit `.env.local` to git
- Use Vercel environment variables for deployment
- Rotate Firebase API keys if exposed

### User Data

- No PII beyond Firebase Auth (email, name, photo URL)
- Workout data is minimal (just boolean flags)
- No health metrics stored (intentionally simple)

## Future Considerations

### Planned Features (See PRODUCT.md)

- Social features (friends, leaderboards)
- PWA features (installable, push notifications)
- Enhanced analytics (export, charts)
- Premium tier (subscription)
- Integrations (Apple Health, Google Fit)

### Technical Debt

- Add comprehensive test suite
- Implement error boundary components
- Add loading skeletons for better UX
- Optimize image loading (lazy load, WebP)
- Add service worker for true offline support

### Scalability

- Current architecture scales to ~10k users
- Beyond that, consider:
  - Firestore query pagination
  - CDN for static assets
  - Background jobs for heavy calculations
  - Separate backend for complex logic

## Claude-Specific Notes

### When Working on This Project

1. **Always Read First:** Use Read tool before editing files
2. **Maintain Consistency:** Follow existing patterns
3. **Test Changes:** Suggest manual testing steps
4. **Update Docs:** Remind to update README.md if public-facing changes
5. **Check Types:** Ensure TypeScript compiles (`npm run build`)
6. **Respect DOOM Theme:** Keep retro aesthetic intact

### Common Tasks

**"Add a new achievement"**
→ Edit `src/lib/achievements.ts`, add to ACHIEVEMENTS array

**"Fix styling issue"**
→ Check `src/index.css` first, then component Tailwind classes

**"Add new page"**
→ Create in `src/pages/`, update `src/App.tsx` routing

**"Change face behavior"**
→ Edit `src/components/DoomFace.tsx` logic

**"Modify week calculation"**
→ Edit `src/lib/weekUtils.ts`

**"Change streak logic"**
→ Edit `src/hooks/useStats.ts` and `src/hooks/useAllWeeks.ts`

**"Add friend feature functionality"**
→ Edit `src/hooks/useFriends.ts` for data operations, `src/pages/Squad.tsx` for UI

**"Fix friend discovery issues"**
→ Check Firestore security rules, verify parent user documents exist, run migration utility

### Files to Avoid Editing Without Good Reason

- `package-lock.json` (only via npm commands)
- `vite.config.ts` (working well, rarely needs changes)
- `tsconfig.json` (stable configuration)
- `doom-assets/` folder (source assets, not used in build)

### Always Check Before Committing

```bash
npm run lint     # Check for linting errors
npm run build    # Ensure build succeeds
git status       # Review changed files
```

## Resources

- [React 19 Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [DOOM Wiki](https://doomwiki.org) - For lore/asset reference

---

**Version History:**
- v1.0 (Jan 4, 2026) - Initial release with core features
- v1.1 (Jan 10, 2026) - Added Squad system (friend feature)
- v1.2 (Jan 14, 2026) - Added Weekly Leaderboard
- v1.2.2 (Jan 15, 2026) - Added profile editing (display name only, no avatar upload due to Firebase Storage costs)
- v1.4 (Feb 15, 2026) - Improved face animation system (faster, more organic timing, removed buggy blinking)

**Last Updated:** February 15, 2026
**Maintainer:** Development Team
**Claude Version:** Optimized for Claude Sonnet 4.5+

*Rep & Tear, until it is done.*
