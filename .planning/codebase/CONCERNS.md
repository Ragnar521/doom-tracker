# Codebase Concerns

**Analysis Date:** 2026-02-25

## Tech Debt

**Incomplete Friend Statistics:**
- Issue: Friend streak and total workout calculations are stubbed out with hardcoded zeros
- Files: `src/hooks/useFriends.ts` (lines 123-124, 254-255)
- Impact: Friends cannot see each other's streaks or total workouts, only current week data
- Fix approach: Implement full stats calculation by loading all weeks for each friend (requires additional Firestore reads)
```typescript
// TODO comments in useFriends.ts:
currentStreak: 0, // TODO: Calculate from all weeks
totalWorkouts: 0, // TODO: Calculate from all weeks
```

**Duplicate Friend Loading Logic:**
- Issue: Friend loading logic is duplicated in two places (initial load and after adding friend)
- Files: `src/hooks/useFriends.ts` (lines 82-165, 226-285)
- Impact: ~100 lines of duplicated code that must be kept in sync, increases maintenance burden
- Fix approach: Extract to shared function `loadFriendsList()` or use state refresh pattern

**N+1 Query Problem in Friend System:**
- Issue: Friend discovery iterates through ALL users to find friend code match
- Files: `src/hooks/useFriends.ts` (lines 184-202)
- Impact: Scales poorly as user base grows, potential performance degradation at 100+ users
- Fix approach: Add Firestore index on `friendCode` field or create reverse lookup collection (`friendCodes/{code} -> {uid}`)

**LocalStorage Indefinite Growth:**
- Issue: Guest mode stores week data in localStorage with no garbage collection
- Files: `src/hooks/useWeek.ts`, `src/hooks/useAllWeeks.ts` (lines 60-77)
- Impact: LocalStorage grows indefinitely (5-10MB browser limit), could cause storage quota errors after ~10,000 weeks of data
- Fix approach: Implement cleanup of weeks older than 2-3 years or migrate to IndexedDB

**Manual Friend System Migration:**
- Issue: Existing users must manually run `window.migrateFriendSystem()` in browser console
- Files: `src/utils/migrateFriendSystem.ts` (entire file)
- Impact: Poor UX, many users won't know to do this, friend discovery fails for unmigrated users
- Fix approach: Auto-detect missing parent document on login and create automatically in AuthContext

**Friend Code Collision Risk:**
- Issue: Friend code uses only 4-digit random suffix (10,000 possible combinations per UID prefix)
- Files: `src/hooks/useFriends.ts` (lines 16-21)
- Impact: Low but non-zero collision probability with same UID prefix (first 8 chars)
- Fix approach: Check for existing code before generation, use longer suffix (6 digits), or use UUID

## Known Bugs

**None Currently Documented:**
- No explicit bug tracking found in code comments
- TODO items are for missing features, not bugs

## Security Considerations

**Environment Variables Exposure:**
- Risk: `.env.local` file present (contains Firebase API keys)
- Files: `.env.local` (noted as present in file listing)
- Current mitigation: File in `.gitignore`, Vercel environment variables for production
- Recommendations: Firebase API keys have domain restrictions in Firebase Console, verify they're configured

**Broad Read Access in Firestore Rules:**
- Risk: All authenticated users can read any user's profile, weeks, and friends data
- Files: `firestore.rules` (lines 8, 15, 30)
- Current mitigation: Required for friend system functionality, data is non-sensitive (workout boolean flags)
- Recommendations: Consider adding rate limiting or monitoring for abuse, data is intentionally social

**No Rate Limiting on Friend Adds:**
- Risk: Users could spam friend requests or enumerate all users
- Files: `src/hooks/useFriends.ts` (addFriend function)
- Current mitigation: None
- Recommendations: Add Firestore Security Rules limit on write operations per minute, or client-side throttling

**Password Reset Security Disclosure:**
- Risk: Password reset returns success for non-existent emails (prevents email enumeration but mentioned in code)
- Files: `src/pages/Login.tsx` (lines 157-159)
- Current mitigation: Returns success for `auth/user-not-found` to prevent email enumeration
- Recommendations: Good security practice, no changes needed

## Performance Bottlenecks

**Multiple Firestore Reads Per Friend:**
- Problem: Each friend requires 3 separate Firestore reads (profile, current week, eventually all weeks for stats)
- Files: `src/hooks/useFriends.ts` (lines 97-145)
- Cause: Sequential reads for profile + week data per friend
- Improvement path: Batch reads using `Promise.all()`, or denormalize frequently accessed data into profile document

**Unnecessary Re-renders on Face Animation:**
- Problem: Face direction state updates every 900-1100ms causing re-renders
- Files: `src/components/DoomFace.tsx` (lines 96-127)
- Cause: `setDirection()` called in interval triggers component re-render
- Improvement path: Use CSS animations instead of state-driven animations, or React.memo on parent components

**No Pagination for Friend List:**
- Problem: Loads all friends at once on Squad page load
- Files: `src/hooks/useFriends.ts` (lines 82-165)
- Cause: Simple implementation, getDocs() loads all documents
- Improvement path: Implement pagination (load 20 friends at a time) or virtual scrolling for 100+ friend lists

**All Weeks Loaded on Dashboard:**
- Problem: Dashboard loads entire workout history from Firestore
- Files: `src/hooks/useAllWeeks.ts` (lines 32-84)
- Cause: `getDocs()` without limit clause
- Improvement path: Add query limits (e.g., last 52 weeks only), implement lazy loading for historical data

**Unoptimized Week Iteration:**
- Problem: Streak calculation iterates backwards through weeks with hardcoded 200 iteration limit
- Files: `src/hooks/useAllWeeks.ts` (lines 146-180)
- Cause: Defensive programming against infinite loops
- Improvement path: Pre-sort weeks by date, use early termination when first gap is found (for current streak)

## Fragile Areas

**Face Animation Timing Dependencies:**
- Files: `src/components/DoomFace.tsx` (lines 87-127)
- Why fragile: Multiple useEffect hooks with timing dependencies (ouch overrides grin, random intervals)
- Safe modification: Always test all face states (0-7 workouts) after changes, verify no visual glitches
- Test coverage: None (visual/manual testing required)

**ISO Week Calculation Edge Cases:**
- Files: `src/lib/weekUtils.ts` (entire file)
- Why fragile: ISO 8601 week numbering is complex (Week 53 exists in some years, Dec 29-31 can be Week 1 of next year)
- Safe modification: Add unit tests for edge cases (year boundaries, Week 53), use established library (date-fns) instead
- Test coverage: None (needs unit tests)

**Streak Logic with Week Status:**
- Files: `src/hooks/useAllWeeks.ts` (lines 136-189), `src/hooks/useStats.ts`
- Why fragile: Complex logic with sick/vacation skipping, current week conditional counting
- Safe modification: Write comprehensive tests before changes, document edge cases clearly
- Test coverage: None (critical path untested)

**Friend System Bi-directional Writes:**
- Files: `src/hooks/useFriends.ts` (lines 217-223)
- Why fragile: Writes to both users' friend lists, no transaction/rollback if second write fails
- Safe modification: Use Firestore batch writes or transactions to ensure atomicity
- Test coverage: None (E2E tests needed for failure scenarios)

## Scaling Limits

**Firebase Free Tier Quotas:**
- Current capacity: 50k reads, 20k writes, 1GB storage per day
- Limit: ~500 active users per day (estimated based on typical usage)
- Scaling path: Upgrade to Blaze (pay-as-you-go) plan, implement caching, reduce read frequency

**Friend Discovery Query:**
- Current capacity: Works up to ~100 users, degrades at 1000+ users
- Limit: O(n) search through all users, no indexing on friendCode
- Scaling path: Create reverse lookup collection or Firestore index on friendCode field

**LocalStorage Size Limit:**
- Current capacity: ~10,000 weeks of data per user (5-10MB browser limit)
- Limit: 192 years of tracking (not realistic concern)
- Scaling path: Migrate to IndexedDB for unlimited storage

**Firestore Document Size:**
- Current capacity: Each week document is ~200 bytes (well within 1MB limit)
- Limit: No practical limit for current data model
- Scaling path: N/A

## Dependencies at Risk

**React 19 Stability:**
- Risk: React 19.2 is relatively new (released Dec 2024)
- Impact: Potential for breaking changes or undiscovered bugs
- Migration plan: Pin to exact version, test thoroughly before upgrades, monitor React release notes

**Firebase SDK Major Version:**
- Risk: Firebase 12.7 is latest, major version bumps can have breaking changes
- Impact: Auth, Firestore APIs could change
- Migration plan: Review Firebase release notes before upgrades, test authentication flow thoroughly

**Vite 7.2:**
- Risk: Vite 7 is recent (released 2024), ecosystem plugins may lag
- Impact: Build tool changes could affect deployment
- Migration plan: Pin to minor version, test builds in staging before production updates

**No Dependency Audit:**
- Risk: 36 console.log/warn/error statements found (debugging code in production)
- Impact: Performance overhead, potential information leakage
- Migration plan: Remove or wrap in development-only conditionals, use proper logging library

## Missing Critical Features

**No Unit Tests:**
- Problem: Zero unit tests found in `src/` directory
- Blocks: Confident refactoring, regression prevention
- Priority: High (critical paths like streak calculation are untested)

**No Error Boundaries:**
- Problem: React Error Boundaries not implemented
- Blocks: Graceful error handling, prevents white screen of death
- Priority: Medium (production stability concern)

**No Loading Skeletons:**
- Problem: Generic loading spinners, no skeleton screens
- Blocks: Professional UX, perceived performance
- Priority: Low (UX polish)

**No Offline Queue:**
- Problem: Offline indicator shows but writes may fail silently
- Blocks: True PWA offline-first experience
- Priority: Medium (data loss risk for offline users)

**No Firestore Indexes:**
- Problem: `firestore.indexes.json` file not analyzed (may be empty)
- Blocks: Efficient queries as data grows
- Priority: Medium (performance degrades without indexes)

## Test Coverage Gaps

**Authentication Flow:**
- What's not tested: Firebase authentication integration (Google OAuth, email/password)
- Files: `src/contexts/AuthContext.tsx`, `src/pages/Login.tsx`
- Risk: Breaking changes to auth flow won't be caught
- Priority: High (critical user flow)
- Note: 45 E2E tests cover Login page UI only, not actual Firebase auth

**Workout Tracking:**
- What's not tested: Toggle workouts, week navigation, status changes
- Files: `src/hooks/useWeek.ts`, `src/pages/Tracker.tsx`, `src/components/WeekTracker.tsx`
- Risk: Core feature could break unnoticed
- Priority: High (primary app functionality)

**Streak Calculation:**
- What's not tested: Complex streak logic with sick/vacation skipping
- Files: `src/hooks/useAllWeeks.ts` (lines 136-189), `src/hooks/useStats.ts`
- Risk: Off-by-one errors, edge case failures (current week counting, year boundaries)
- Priority: High (user-facing metric, complex logic)

**Achievement Unlock Logic:**
- What's not tested: Achievement condition functions, progress calculations
- Files: `src/lib/achievements.ts` (18+ achievement definitions)
- Risk: Achievements may unlock incorrectly or not at all
- Priority: Medium (engagement feature, but non-critical)

**Friend System:**
- What's not tested: Add/remove friends, friend code generation, friend data loading
- Files: `src/hooks/useFriends.ts`, `src/pages/Squad.tsx`, `src/components/WeeklyLeaderboard.tsx`
- Risk: Social features could break, data inconsistency
- Priority: Medium (v1.1+ feature, not core functionality)

**ISO Week Utilities:**
- What's not tested: Week calculation, date conversions, edge cases (Week 53, year boundaries)
- Files: `src/lib/weekUtils.ts` (entire file)
- Risk: Date bugs are notoriously difficult to debug in production
- Priority: High (foundational utility used throughout app)

**LocalStorage Fallback:**
- What's not tested: Guest mode persistence, data migration to Firebase on login
- Files: `src/hooks/useWeek.ts`, `src/hooks/useAllWeeks.ts`
- Risk: Data loss or corruption for guest users
- Priority: Medium (guest mode is secondary path)

**Face State Transitions:**
- What's not tested: Face state changes based on workout count, animation timing
- Files: `src/components/DoomFace.tsx`
- Risk: Visual bugs, incorrect face states displayed
- Priority: Low (visual feature, easily caught manually)

---

*Concerns audit: 2026-02-25*
