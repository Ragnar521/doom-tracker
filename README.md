# Rep & Tear - DOOM Gym Tracker

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/doom-tracker)

A DOOM-themed progressive web app for tracking weekly gym workouts with Firebase authentication and real-time synchronization. Turn your fitness journey into a nostalgic battle against the demons of laziness.

## What is Rep & Tear?

Rep & Tear transforms gym tracking into an immersive DOOM experience. Watch the iconic DoomGuy face evolve based on your weekly workout performance—from CRITICAL (0 workouts) to GOD MODE (6+ workouts). The app gamifies fitness with achievements, streak tracking, visual analytics, and motivational features inspired by the legendary FPS franchise.

**Target Users:** Gym enthusiasts, retro gamers, and anyone who wants to make fitness tracking more engaging.

## Key Features

### Current Features

- **Dynamic DOOM Face System** - Iconic DoomGuy face changes based on weekly performance:
  - 0 workouts = CRITICAL (red, barely alive)
  - 1 workout = HURT BAD (badly damaged)
  - 2 workouts = DAMAGED (moderate injury)
  - 3 workouts = HEALTHY (minimum target met ✓)
  - 4 workouts = STRONG (ideal target ⭐)
  - 5 workouts = BERSERK (entering beast mode)
  - 6-7 workouts = GOD MODE (golden glow 🔥)

- **Face Animations & Effects**
  - Random head turning (left/right)
  - "Ouch" face when removing workouts
  - Golden pulsing glow for God Mode
  - Boost mode grin face
  - Reactive blinking

- **Weekly Tracker**
  - 7-day grid (Monday-Sunday)
  - Click to toggle workout completion
  - Week navigation (previous/next/jump to current)
  - Week status markers (Normal/Sick/Vacation)
  - Target probability calculator

- **Achievement System** (18+ achievements)
  - **Streak:** First Blood, Week Warrior, Consistency, Month of Pain, Quarter Beast, Half Year Hero, Year of Beast
  - **Performance:** God Mode Activated, Overachiever, Unstoppable, Century Club (100), Beast Milestone (250), Gym Rat (500), Legend (1000)
  - **Special:** Speed Demon, Monday Motivation, Weekend Warrior, Comeback Kid
  - **Hidden:** Unlockable secret achievements
  - Progress tracking for long-term goals
  - Toast notifications with confetti on unlock

- **Dashboard Analytics**
  - Total workouts and current streak
  - Longest streak tracking
  - Average workouts per week
  - Success rate percentage
  - Day frequency heatmap (favorite workout days)
  - Last 12 weeks visual grid

- **Multi-User Authentication**
  - Firebase Google OAuth
  - Email/password authentication
  - Protected routes
  - New user welcome toast

- **Data Persistence**
  - Firebase Firestore (authenticated users)
  - LocalStorage fallback (guest mode)
  - Automatic sync across devices
  - Offline indicator

- **Boost Motivation**
  - DOOM music button (opens YouTube playlist)
  - Boost mode effects and animations
  - Audio player integration

- **Squad System (Friend Feature)** 🆕
  - Unique friend codes for easy sharing
  - Add/remove friends instantly (bi-directional)
  - See friends' current week workout progress
  - View exact workout days for each friend
  - Friend status with face state colors
  - Sorted by status (struggling marines first)
  - Privacy: friends can see your workout days
  - Weekly leaderboard (current week rankings)
  - Top 3 podium visualization (gold/silver/bronze)

- **Profile Management** 🆕
  - Edit display name (max 30 characters)
  - Inline editing on Settings page
  - Changes sync to Squad system automatically
  - Avatar displays as first letter of name/email
  - OAuth users get avatar from Google account
  - Note: Custom avatar upload not available (requires paid Firebase plan)

- **Retro UI/UX**
  - Authentic DOOM aesthetics
  - CRT scanlines effect
  - Pixelated fonts and graphics
  - Retro panels and borders
  - Mobile-first responsive design
  - Bottom navigation (Tracker/Dashboard/Achievements/Squad/Settings)

## Tech Stack

### Frontend
- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Vite 7.2** - Build tool and dev server
- **React Router 7.11** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first styling

### Backend & Services
- **Firebase 12.7**
  - Authentication (Google OAuth, Email/Password)
  - Firestore (real-time database)
  - Hosting ready

### Development Tools
- **ESLint 9** - Code linting
- **TypeScript ESLint** - TypeScript-specific rules
- **PostCSS & Autoprefixer** - CSS processing

## Architecture

```
doom-tracker/
├── src/
│   ├── assets/              # Static assets
│   │   ├── faces/          # DoomGuy face sprites (PNG)
│   │   ├── achievements/   # Achievement icons (PNG)
│   │   └── icons/          # Navigation icons (PNG)
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components (Button, Input, etc.)
│   │   ├── DoomFace.tsx   # Main character face logic
│   │   ├── WeekTracker.tsx
│   │   ├── StatsPanel.tsx
│   │   ├── BottomNavigation.tsx
│   │   └── ...
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── AchievementContext.tsx
│   │   └── BoostContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useWeek.ts     # Week data management
│   │   ├── useStats.ts    # Statistics calculations
│   │   ├── useAllWeeks.ts # Multi-week aggregation
│   │   ├── useAchievements.ts
│   │   └── useFriends.ts  # Friend system operations
│   ├── lib/               # Utilities and configs
│   │   ├── firebase.ts    # Firebase setup
│   │   ├── achievements.ts # Achievement definitions
│   │   ├── weekUtils.ts   # Date/week helpers
│   │   └── music.ts       # Audio utilities
│   ├── pages/             # Route pages
│   │   ├── Tracker.tsx    # Main tracking view
│   │   ├── Dashboard.tsx  # Analytics view
│   │   ├── Achievements.tsx
│   │   ├── Squad.tsx      # Friend system page
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   │   └── migrateFriendSystem.ts  # Friend system migration
│   ├── App.tsx            # Root component with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles + DOOM theme
├── doom-assets/           # Original asset source files
├── public/                # Static public files
├── .env.local            # Firebase config (not in git)
├── vercel.json           # Vercel deployment config
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind theme extensions
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies
```

### Data Model

**Week Document** (`users/{uid}/weeks/{weekId}`)
```typescript
{
  startDate: string;           // ISO date of Monday
  workouts: boolean[];         // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  status: 'normal' | 'sick' | 'vacation';
  updatedAt: Timestamp;
}
```

**User Profile** (`users/{uid}/profile/info`)
```typescript
{
  friendCode: string;          // Unique code (e.g., "ABCD1234#5678")
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
}
```

**Friends** (`users/{uid}/friends/{friendUid}`)
```typescript
{
  addedAt: Timestamp;
}
```

**Week ID Format:** `YYYY-Www` (e.g., `2026-W02`)

## Setup

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- (Optional) Vercel account for deployment

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/doom-tracker.git
cd doom-tracker
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get these values from your [Firebase Console](https://console.firebase.google.com/):
- Create a new project (or use existing)
- Enable Authentication > Sign-in method > Google & Email/Password
- Enable Firestore Database > Create database (start in production mode)
- Go to Project Settings > Your apps > Web app > Copy config values

4. Firestore Security Rules

Apply these rules in Firebase Console > Firestore Database > Rules:

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

## Running the App

### Development Mode

```bash
npm run dev
```

The app runs at `http://localhost:5173`

Features in dev mode:
- Hot Module Replacement (HMR)
- Fast refresh
- TypeScript type checking
- ESLint warnings in console

### Production Build

```bash
npm run build
```

Output: `dist/` folder with optimized static files

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket

2. Import project in [Vercel Dashboard](https://vercel.com/new)

3. Add environment variables in Vercel project settings (same as `.env.local`)

4. Deploy

The `vercel.json` config handles SPA routing automatically.

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

### Other Platforms

The app is a static SPA and can be deployed to:
- Netlify
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

## Usage Guide

### First Time Setup

1. Visit the app and click "Sign in with Google" or create an account
2. You'll see a welcome toast on first login
3. Start tracking workouts immediately

### Tracking Workouts

1. Go to **Tracker** page (home)
2. Click any day button to toggle workout completion
3. Watch the DOOM face change as you add workouts
4. Navigate between weeks using arrow buttons
5. Mark weeks as "Sick" or "Vacation" via the week status button

### Viewing Progress

1. Go to **Dashboard** for analytics:
   - Total stats (workouts, streaks, averages)
   - Day frequency heatmap
   - Recent weeks visualization

2. Go to **Achievements** to see:
   - Unlocked achievements with dates
   - Locked achievements with progress bars
   - Hidden achievements (only visible when unlocked)

### Boost Motivation

Click the "BOOST MOTIVATION" button on Tracker page to:
- Open DOOM soundtrack on YouTube
- Trigger boost mode animations
- See the grin face

### Squad (Friends)

1. Go to **Squad** page
2. Copy your friend code and share it with friends
3. Enter a friend's code in the "Add Marine" field
4. Click "ADD" to instantly add them to your squad
5. View your friends' current week progress:
   - See their face state (CRITICAL to GOD MODE)
   - View their exact workout days
   - Check their weekly workout count
6. Remove friends using the "REMOVE" button on their card

**Note:** New users are automatically assigned a friend code. Existing users may need to run `window.migrateFriendSystem()` in the browser console once.

### Settings

1. Go to **Settings** page
2. **Account Section:**
   - Edit display name by clicking "EDIT"
   - View your email address
   - Sign out when needed
3. **About Section:**
   - Click "HOW IT WORKS" to expand a detailed guide explaining:
     - Weekly goals and workout targets
     - DoomGuy face states and what they mean
     - How streak calculations work
     - Achievement system overview
     - Squad features explained
     - Data sync information
   - View app version and credits
4. **Data Section:**
   - See your current data storage method (cloud or local)

## Troubleshooting

### Issue: "Firebase initialization error"
**Solution:**
- Verify all Firebase env variables in `.env.local`
- Ensure the Firebase project exists and is active
- Check Firebase Console for API restrictions

### Issue: "Authentication failed"
**Solution:**
- Enable Google/Email authentication in Firebase Console
- Add your domain to Firebase authorized domains (Authentication > Settings)
- For localhost, ensure `localhost` is in authorized domains

### Issue: "Data not syncing across devices"
**Solution:**
- Confirm you're logged in with the same account
- Check Firestore rules allow read/write access
- Verify internet connection (offline indicator should show if disconnected)
- Check browser console for Firestore errors

### Issue: "Achievements not unlocking"
**Solution:**
- Achievements are calculated on page load and after workout changes
- Some achievements require specific conditions (check descriptions)
- Hidden achievements only appear when unlocked

### Issue: "Week navigation showing wrong dates"
**Solution:**
- Weeks start on Monday (ISO 8601 standard)
- Week IDs use format `YYYY-Www` (e.g., `2026-W02`)
- Check system date/time settings

### Issue: "Images not loading"
**Solution:**
- Run `npm run build` and check for build errors
- Verify all image imports in `src/assets/faces/index.ts`
- Clear browser cache

### Issue: "MARINE NOT FOUND" when adding friends
**Solution:**
- Ensure both users have signed in at least once
- Run `window.migrateFriendSystem()` in browser console for existing users
- Verify Firestore security rules allow reading other users' profiles
- Check that friend code is typed correctly (case-sensitive)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test thoroughly
4. Run linting: `npm run lint`
5. Build: `npm run build` (ensure no errors)
6. Commit with descriptive messages
7. Push and create a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Use functional components with hooks
- Keep components small and focused
- Comment complex logic
- Use Tailwind classes for styling

### Adding New Achievements

1. Add icon to `src/assets/achievements/`
2. Import icon in `src/lib/achievements.ts`
3. Add achievement definition to `ACHIEVEMENTS` array
4. Define condition function (uses stats and weeks data)
5. Optional: Add progress function for visual feedback
6. Test unlock conditions thoroughly

### Testing Checklist

- [ ] Test on mobile viewport
- [ ] Test authentication flow (login/logout)
- [ ] Test workout toggle functionality
- [ ] Test week navigation
- [ ] Test streak calculations
- [ ] Test achievement unlocks
- [ ] Test offline behavior
- [ ] Test across different browsers

## Project History

**Initial Commit** (2026-01-04)
- Complete DOOM-themed gym tracker with all core features
- Firebase authentication and Firestore integration
- 18 achievements across 4 categories
- Full responsive design
- Week navigation and status management

**Squad Feature Update** (2026-01-10)
- ✨ Added friend system with unique friend codes
- ✨ Real-time friend workout tracking
- ✨ Instant bi-directional friend adding
- ✨ Friend status visualization with face states
- 🔧 Updated Firestore security rules for friend discovery
- 🔧 Created migration utility for existing users
- 📱 Added Squad navigation (5th nav item)

**Recent Updates**
- `452de06` - Status improvements
- `154214a` - Version fix
- `bc4e994` - Vercel deployment fix
- `9ffbc4b` - Bug fixes
- `941d2b5` - Login flow fixes
- `3e1e61f` - Asset loading fixes

## Roadmap

See `PRODUCT.md` for detailed product vision, feature roadmap, and marketing strategy.

## License

This project uses DOOM-inspired assets and themes. The original DOOM assets are owned by id Software/Bethesda. This project is a fan tribute for educational and personal use.

Code is provided as-is for portfolio and learning purposes.

## Credits

- **DOOM** franchise by id Software
- Achievement icons generated with AI assistance
- Font: Press Start 2P (Google Fonts)
- Font: AmazDooM (DOOM font)

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Review existing issues and PRs
- Check the troubleshooting section above

---

**Until it is done. Rep & Tear.**
