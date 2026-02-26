import { useState, useEffect } from 'react';
import DoomFace from '../components/DoomFace';
import WeekTracker from '../components/WeekTracker';
import WeekNavigation from '../components/WeekNavigation';
import StatsPanel from '../components/StatsPanel';
import BoostButton from '../components/BoostButton';
import LoadingSpinner from '../components/LoadingSpinner';
import XPBar from '../components/XPBar';
import LevelUpToast from '../components/LevelUpToast';
import XPBreakdownModal from '../components/XPBreakdownModal';
import { useWeek } from '../hooks/useWeek';
import { useStats } from '../hooks/useStats';
import { useXP } from '../hooks/useXP';
import { useAllWeeks } from '../hooks/useAllWeeks';
import { useAchievementContext } from '../contexts/AchievementContext';
import { getCurrentWeekId } from '../lib/weekUtils';

export default function Tracker() {
  const [selectedWeekId, setSelectedWeekId] = useState(getCurrentWeekId());
  const [showOuch, setShowOuch] = useState(false);
  const [showXPBreakdown, setShowXPBreakdown] = useState(false);

  // Load all weeks data for XP calculation
  const { weeks, stats: allWeeksStats, loading: allWeeksLoading } = useAllWeeks();
  const { unlockedCount } = useAchievementContext();

  // Initialize XP hook
  const {
    totalXP,
    achievementXP,
    currentRank,
    nextRank,
    xpToNextRank,
    levelUpEvent,
    addXP,
    recalculateXP,
    dismissLevelUp,
    loading: xpLoading,
  } = useXP(weeks, allWeeksStats.currentStreak, unlockedCount, allWeeksLoading);

  // Initialize week hook with XP callbacks
  const { data: weekData, loading: weekLoading, toggleDay, setStatus, workoutCount } = useWeek(
    selectedWeekId,
    {
      onXPDelta: addXP,
      onXPRecalculate: recalculateXP,
      currentStreak: allWeeksStats.currentStreak,
    }
  );

  const { stats, loading: statsLoading, recalculateStats } = useStats();

  // Recalculate stats on mount to ensure streak is up to date
  useEffect(() => {
    if (!statsLoading) {
      // Always recalculate to ensure fresh data
      recalculateStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsLoading]);

  const handleToggleDay = async (dayIndex: number) => {
    const wasCompleted = weekData.workouts[dayIndex];

    if (wasCompleted) {
      setShowOuch(true);
      setTimeout(() => setShowOuch(false), 1000);
    }

    await toggleDay(dayIndex);
    await recalculateStats();
  };

  if (weekLoading || statsLoading || allWeeksLoading) {
    return <LoadingSpinner size="lg" text="LOADING BATTLE DATA..." />;
  }

  return (
    <div className="space-y-3">
      {/* Doom Face Panel */}
      <div className="doom-panel p-4">
        <DoomFace workoutCount={workoutCount} showOuch={showOuch} />
      </div>

      {/* Week Navigation */}
      <WeekNavigation
        weekId={selectedWeekId}
        status={weekData.status}
        onWeekChange={setSelectedWeekId}
        onStatusChange={setStatus}
      />

      {/* Week Tracker */}
      <WeekTracker
        workouts={weekData.workouts}
        onToggleDay={handleToggleDay}
      />

      {/* XP Progress Bar */}
      <XPBar
        currentRank={currentRank}
        nextRank={nextRank}
        totalXP={totalXP}
        onClick={() => setShowXPBreakdown(true)}
        levelUpEvent={levelUpEvent}
        loading={xpLoading}
      />

      {/* Stats */}
      <StatsPanel stats={stats} />

      {/* Boost Button */}
      <BoostButton />

      {/* Level-up Toast */}
      {levelUpEvent && (
        <LevelUpToast event={levelUpEvent} onDismiss={dismissLevelUp} />
      )}

      {/* XP Breakdown Modal */}
      <XPBreakdownModal
        isOpen={showXPBreakdown}
        onClose={() => setShowXPBreakdown(false)}
        workoutCount={workoutCount}
        currentStreak={allWeeksStats.currentStreak}
        weekStatus={weekData.status}
        totalXP={totalXP}
        achievementXP={achievementXP}
        currentRank={currentRank}
        nextRank={nextRank}
        xpToNextRank={xpToNextRank}
      />
    </div>
  );
}
