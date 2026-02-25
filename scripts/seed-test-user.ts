/**
 * Seed script for creating a test user with 52 weeks of realistic workout data.
 *
 * Usage:
 *   npx tsx scripts/seed-test-user.ts
 *
 * Prerequisites:
 *   - Firebase service account key at ~/Downloads/rep-and-tear-firebase-adminsdk-fbsvc-b28f9baf08.json
 *   - Test user already created in Firebase Auth
 *   - npm install -D firebase-admin tsx
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

// ── Configuration ──────────────────────────────────────────────────────────────

const TEST_UID = 'HZzub5QpvwdqCp2vhipNJOVF6QB3';
const DISPLAY_NAME = 'DoomSlayer';
const SERVICE_ACCOUNT_PATH = resolve(
  homedir(),
  'Downloads/rep-and-tear-firebase-adminsdk-fbsvc-b28f9baf08.json'
);

// ── Firebase Init ──────────────────────────────────────────────────────────────

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// ── Week Utilities (mirrors src/lib/weekUtils.ts) ──────────────────────────────

function getWeekId(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getWeekStart(weekId: string): Date {
  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - dayOfWeek + 1);
  const targetMonday = new Date(week1Monday);
  targetMonday.setDate(week1Monday.getDate() + (week - 1) * 7);
  return targetMonday;
}

function getPreviousWeekId(weekId: string): string {
  const weekStart = getWeekStart(weekId);
  weekStart.setDate(weekStart.getDate() - 7);
  return getWeekId(weekStart);
}

function formatWeekStartDate(weekId: string): string {
  const start = getWeekStart(weekId);
  return start.toISOString().split('T')[0];
}

function getCurrentWeekId(): string {
  return getWeekId(new Date());
}

// ── Seed Data Generation ───────────────────────────────────────────────────────

// Seeded random for reproducibility
let seed = 42;
function seededRandom(): number {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

type WeekStatus = 'normal' | 'sick' | 'vacation';

interface GeneratedWeek {
  weekId: string;
  workouts: boolean[];
  status: WeekStatus;
  startDate: string;
}

/**
 * Generate 52 weeks of realistic workout data.
 *
 * The pattern tells a story:
 * - Weeks 52-49 ago: Getting started (1-3 workouts, inconsistent)
 * - Weeks 48-40 ago: Building momentum (3-4 workouts, first streak)
 * - Week 39 ago: Got sick for a week
 * - Weeks 38-35 ago: Comeback, strong (4-5 workouts)
 * - Weeks 34-30 ago: Plateau (3-4 workouts)
 * - Week 29 ago: Vacation week
 * - Weeks 28-17 ago: Best stretch — 12 week streak with god mode weeks mixed in
 * - Weeks 16-14 ago: Slight dip (2-3 workouts)
 * - Weeks 13-8 ago: Recovery, building back (3-5 workouts)
 * - Weeks 7-1 ago: Current strong streak (4-5 workouts, recent momentum)
 * - Current week: 3 workouts so far (Mon, Wed, Fri pattern)
 */
function generateWeekData(): GeneratedWeek[] {
  const currentWeekId = getCurrentWeekId();
  const weeks: GeneratedWeek[] = [];

  // Work backwards from current week
  let weekId = currentWeekId;

  // Define workout patterns for each "phase" of the story
  // Each entry: [weeksAgo, workoutCount, status]
  // workoutCount of -1 means "random within range"
  interface WeekPlan {
    workoutTarget: number; // exact count, or use range
    minWorkouts?: number;
    maxWorkouts?: number;
    status: WeekStatus;
    preferredDays?: number[]; // indices 0-6 (Mon-Sun), preferred workout days
  }

  const weekPlans: WeekPlan[] = [];

  // Current week (week 0): 3 workouts — Mon, Wed, Fri
  weekPlans.push({
    workoutTarget: 3,
    status: 'normal',
    preferredDays: [0, 2, 4], // Mon, Wed, Fri
  });

  // Weeks 1-7: Strong current streak (4-5 workouts)
  for (let i = 0; i < 7; i++) {
    weekPlans.push({
      workoutTarget: 0,
      minWorkouts: 4,
      maxWorkouts: 5,
      status: 'normal',
      preferredDays: [0, 1, 2, 3, 4], // Weekdays
    });
  }

  // Weeks 8-13: Recovery phase (3-5 workouts)
  for (let i = 0; i < 6; i++) {
    weekPlans.push({
      workoutTarget: 0,
      minWorkouts: 3,
      maxWorkouts: 5,
      status: 'normal',
      preferredDays: [0, 2, 3, 4, 5], // Mon, Wed-Sat
    });
  }

  // Weeks 14-16: Slight dip (2-3 workouts)
  for (let i = 0; i < 3; i++) {
    weekPlans.push({
      workoutTarget: 0,
      minWorkouts: 2,
      maxWorkouts: 3,
      status: 'normal',
    });
  }

  // Weeks 17-28: Best stretch — 12 weeks (mix of 4-6 workouts, god mode weeks)
  const bestStretchPatterns = [5, 4, 6, 5, 4, 5, 5, 6, 4, 5, 7, 5];
  for (const count of bestStretchPatterns) {
    weekPlans.push({
      workoutTarget: count,
      status: 'normal',
      preferredDays: count >= 6 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4],
    });
  }

  // Week 29: Vacation
  weekPlans.push({
    workoutTarget: 0,
    status: 'vacation',
  });

  // Weeks 30-34: Plateau (3-4 workouts)
  for (let i = 0; i < 5; i++) {
    weekPlans.push({
      workoutTarget: 0,
      minWorkouts: 3,
      maxWorkouts: 4,
      status: 'normal',
    });
  }

  // Weeks 35-38: Comeback after sick, strong (4-5 workouts)
  for (let i = 0; i < 4; i++) {
    weekPlans.push({
      workoutTarget: 0,
      minWorkouts: 4,
      maxWorkouts: 5,
      status: 'normal',
    });
  }

  // Week 39: Sick week
  weekPlans.push({
    workoutTarget: 1,
    status: 'sick',
  });

  // Weeks 40-48: Building momentum (3-4 workouts)
  for (let i = 0; i < 9; i++) {
    weekPlans.push({
      workoutTarget: 0,
      minWorkouts: 3,
      maxWorkouts: 4,
      status: 'normal',
    });
  }

  // Weeks 49-52: Getting started (1-3 workouts)
  const startingPatterns = [1, 2, 2, 3];
  for (const count of startingPatterns) {
    weekPlans.push({
      workoutTarget: count,
      status: 'normal',
    });
  }

  // Generate actual week data
  for (let i = 0; i < weekPlans.length && i < 53; i++) {
    const plan = weekPlans[i];

    // Determine workout count
    let workoutCount: number;
    if (plan.workoutTarget > 0 || plan.status !== 'normal') {
      workoutCount = plan.workoutTarget;
    } else {
      const min = plan.minWorkouts ?? 0;
      const max = plan.maxWorkouts ?? 7;
      workoutCount = min + Math.floor(seededRandom() * (max - min + 1));
    }

    // Generate workout days
    const workouts = [false, false, false, false, false, false, false];

    if (workoutCount > 0) {
      // Use preferred days first, then fill randomly
      const preferred = plan.preferredDays ?? [0, 1, 2, 3, 4, 5, 6];
      const shuffled = [...preferred].sort(() => seededRandom() - 0.5);
      const remaining = [0, 1, 2, 3, 4, 5, 6]
        .filter((d) => !preferred.includes(d))
        .sort(() => seededRandom() - 0.5);
      const allDays = [...shuffled, ...remaining];

      for (let d = 0; d < Math.min(workoutCount, 7); d++) {
        workouts[allDays[d]] = true;
      }
    }

    weeks.push({
      weekId,
      workouts,
      status: plan.status,
      startDate: formatWeekStartDate(weekId),
    });

    weekId = getPreviousWeekId(weekId);
  }

  return weeks;
}

// ── Generate Friend Code ───────────────────────────────────────────────────────

function generateFriendCode(uid: string): string {
  const base = uid.substring(0, 8).toUpperCase();
  const suffix = Math.floor(seededRandom() * 9999)
    .toString()
    .padStart(4, '0');
  return `${base}#${suffix}`;
}

// ── Determine Achievements ─────────────────────────────────────────────────────

interface WeekRecord {
  weekId: string;
  workouts: boolean[];
  status: WeekStatus;
  workoutCount: number;
}

function determineUnlockedAchievements(weekRecords: WeekRecord[]): string[] {
  const totalWorkouts = weekRecords.reduce((s, w) => s + w.workoutCount, 0);
  const normalWeeks = weekRecords.filter((w) => w.status === 'normal');
  const successfulWeeks = normalWeeks.filter((w) => w.workoutCount >= 3);

  // Calculate longest streak
  const sorted = [...weekRecords].sort((a, b) =>
    a.weekId.localeCompare(b.weekId)
  );
  let longestStreak = 0;
  let tempStreak = 0;
  for (const w of sorted) {
    if (w.status !== 'normal') continue;
    if (w.workoutCount >= 3) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // God mode weeks (5+ workouts)
  const godModeWeeks = normalWeeks.filter((w) => w.workoutCount >= 5);

  // Consecutive god mode
  let maxConsecutiveGodMode = 0;
  let consecutiveGodMode = 0;
  for (const w of sorted) {
    if (w.status !== 'normal') continue;
    if (w.workoutCount >= 5) {
      consecutiveGodMode++;
      maxConsecutiveGodMode = Math.max(
        maxConsecutiveGodMode,
        consecutiveGodMode
      );
    } else {
      consecutiveGodMode = 0;
    }
  }

  // Monday workouts
  const mondayWorkouts = weekRecords.filter((w) => w.workouts[0]).length;

  // Weekend workouts
  const weekendWorkouts = weekRecords.reduce((count, w) => {
    return count + (w.workouts[5] ? 1 : 0) + (w.workouts[6] ? 1 : 0);
  }, 0);

  // Speed demon (3 workouts by Wednesday)
  const hasSpeedDemon = weekRecords.some((w) => {
    const earlyWorkouts = w.workouts.slice(0, 3).filter(Boolean).length;
    return earlyWorkouts >= 3;
  });

  // Comeback kid
  const hasComeback = sorted.some((w, i) => {
    if (i === 0) return false;
    const prev = sorted[i - 1];
    return (
      (prev.status === 'sick' || prev.status === 'vacation') &&
      w.status === 'normal' &&
      w.workoutCount >= 3
    );
  });

  // Perfect month (4 consecutive weeks with 4+ workouts)
  let perfectMonth = false;
  let consecutive4Plus = 0;
  for (const w of sorted) {
    if (w.status !== 'normal') continue;
    if (w.workoutCount >= 4) {
      consecutive4Plus++;
      if (consecutive4Plus >= 4) {
        perfectMonth = true;
        break;
      }
    } else {
      consecutive4Plus = 0;
    }
  }

  const unlocked: string[] = [];

  // Streak achievements
  if (totalWorkouts >= 1) unlocked.push('FIRST_BLOOD');
  if (successfulWeeks.length > 0) unlocked.push('WEEK_WARRIOR');
  if (longestStreak >= 4) {
    unlocked.push('CONSISTENCY');
    unlocked.push('MONTH_OF_PAIN');
  }
  if (longestStreak >= 12) unlocked.push('QUARTER_BEAST');
  // Not 26+ so no HALF_YEAR_HERO or YEAR_OF_BEAST

  // Performance
  if (godModeWeeks.length >= 1) unlocked.push('GOD_MODE_ACTIVATED');
  if (godModeWeeks.length >= 5) unlocked.push('OVERACHIEVER');
  if (maxConsecutiveGodMode >= 3) unlocked.push('UNSTOPPABLE');
  if (totalWorkouts >= 100) unlocked.push('CENTURY_CLUB');
  // 52 weeks × ~4 avg = ~200 total, so BEAST_MILESTONE (250) unlikely

  // Special
  if (hasSpeedDemon) unlocked.push('SPEED_DEMON');
  if (mondayWorkouts >= 10) unlocked.push('MONDAY_MOTIVATION');
  if (weekendWorkouts >= 10) unlocked.push('WEEKEND_WARRIOR');
  if (hasComeback) unlocked.push('COMEBACK_KID');

  // Hidden
  if (perfectMonth) unlocked.push('PERFECT_MONTH');

  return unlocked;
}

// ── Main Seed Function ─────────────────────────────────────────────────────────

async function seedTestUser() {
  console.log('🔥 Starting test user data seed...\n');

  const weeks = generateWeekData();
  const weekRecords: WeekRecord[] = weeks.map((w) => ({
    weekId: w.weekId,
    workouts: w.workouts,
    status: w.status,
    workoutCount: w.workouts.filter(Boolean).length,
  }));

  // Print summary
  const totalWorkouts = weekRecords.reduce((s, w) => s + w.workoutCount, 0);
  const sickWeeks = weekRecords.filter((w) => w.status === 'sick').length;
  const vacationWeeks = weekRecords.filter(
    (w) => w.status === 'vacation'
  ).length;
  const godModeWeeks = weekRecords.filter(
    (w) => w.status === 'normal' && w.workoutCount >= 5
  ).length;

  console.log(`📊 Data Summary:`);
  console.log(`   Weeks: ${weeks.length}`);
  console.log(`   Total workouts: ${totalWorkouts}`);
  console.log(`   God Mode weeks (5+): ${godModeWeeks}`);
  console.log(`   Sick weeks: ${sickWeeks}`);
  console.log(`   Vacation weeks: ${vacationWeeks}`);
  console.log(`   Average workouts/week: ${(totalWorkouts / weeks.length).toFixed(1)}\n`);

  // 1. Create parent user document
  console.log('📝 Writing parent user document...');
  await db.doc(`users/${TEST_UID}`).set({
    createdAt: FieldValue.serverTimestamp(),
  });

  // 2. Write all week documents
  console.log(`📝 Writing ${weeks.length} week documents...`);
  const batch1 = db.batch();
  for (const week of weeks) {
    const ref = db.doc(`users/${TEST_UID}/weeks/${week.weekId}`);
    batch1.set(ref, {
      startDate: week.startDate,
      workouts: week.workouts,
      status: week.status,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch1.commit();
  console.log('   ✅ Weeks written');

  // 3. Write profile
  console.log('📝 Writing profile...');
  const friendCode = generateFriendCode(TEST_UID);
  await db.doc(`users/${TEST_UID}/profile/info`).set({
    friendCode,
    displayName: DISPLAY_NAME,
    photoURL: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`   ✅ Profile written (friend code: ${friendCode})`);

  // 4. Calculate and write stats
  console.log('📝 Writing stats...');
  const currentWeekId = getCurrentWeekId();

  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let isCurrentStreak = true;

  const currentWeekData = weekRecords.find((w) => w.weekId === currentWeekId);
  const currentWeekComplete =
    currentWeekData &&
    currentWeekData.workoutCount >= 3 &&
    currentWeekData.status === 'normal';

  // Sort chronologically
  const sortedWeeks = [...weekRecords].sort((a, b) =>
    b.weekId.localeCompare(a.weekId)
  );

  // Skip current week, start from previous
  let checkIdx = sortedWeeks.findIndex((w) => w.weekId === currentWeekId);
  if (checkIdx >= 0) checkIdx++; // Start from next (previous week)

  for (let i = checkIdx; i < sortedWeeks.length; i++) {
    const w = sortedWeeks[i];
    if (w.status === 'sick' || w.status === 'vacation') continue;
    if (w.workoutCount >= 3) {
      tempStreak++;
      if (isCurrentStreak) currentStreak = tempStreak;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      isCurrentStreak = false;
      tempStreak = 0;
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;
  if (currentWeekComplete) currentStreak++;

  await db.doc(`users/${TEST_UID}/stats/current`).set({
    totalWorkouts,
    currentStreak,
    longestStreak,
  });
  console.log(`   ✅ Stats written (streak: ${currentStreak}, longest: ${longestStreak}, total: ${totalWorkouts})`);

  // 5. Write achievements
  const unlockedAchievements = determineUnlockedAchievements(weekRecords);
  console.log(`📝 Writing ${unlockedAchievements.length} achievements...`);

  const batch2 = db.batch();
  // Spread unlock dates across the history for realism
  for (let i = 0; i < unlockedAchievements.length; i++) {
    const id = unlockedAchievements[i];
    const ref = db.doc(`users/${TEST_UID}/achievements/${id}`);
    // Stagger unlock dates — earlier achievements unlocked earlier
    const daysAgo = Math.floor(
      ((unlockedAchievements.length - i) / unlockedAchievements.length) * 300
    );
    const unlockedAt = new Date();
    unlockedAt.setDate(unlockedAt.getDate() - daysAgo);
    batch2.set(ref, { unlockedAt });
  }
  await batch2.commit();
  console.log(`   ✅ Achievements: ${unlockedAchievements.join(', ')}`);

  // Final summary
  console.log('\n🎮 Seed complete!');
  console.log(`   User UID: ${TEST_UID}`);
  console.log(`   Email: test@reptear.app`);
  console.log(`   Password: RepAndTear123!`);
  console.log(`   Friend Code: ${friendCode}`);
  console.log(`   Display Name: ${DISPLAY_NAME}`);
  console.log(`\n   Log in at your app URL to see the data.`);
}

// Run
seedTestUser().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
