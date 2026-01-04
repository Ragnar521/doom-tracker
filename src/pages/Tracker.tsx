import { useState } from 'react';
import DoomFace from '../components/DoomFace';
import WeekTracker from '../components/WeekTracker';
import WeekNavigation from '../components/WeekNavigation';
import StatsPanel from '../components/StatsPanel';
import BoostButton from '../components/BoostButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { useWeek } from '../hooks/useWeek';
import { useStats } from '../hooks/useStats';
import { getCurrentWeekId } from '../lib/weekUtils';

export default function Tracker() {
  const [selectedWeekId, setSelectedWeekId] = useState(getCurrentWeekId());
  const { data: weekData, loading: weekLoading, toggleDay, setStatus, workoutCount } = useWeek(selectedWeekId);
  const { stats, loading: statsLoading, updateStats } = useStats();

  const [showOuch, setShowOuch] = useState(false);

  const handleToggleDay = async (dayIndex: number) => {
    const wasCompleted = weekData.workouts[dayIndex];

    if (wasCompleted) {
      setShowOuch(true);
      setTimeout(() => setShowOuch(false), 1000);
    }

    await toggleDay(dayIndex);
    await updateStats(wasCompleted ? -1 : 1);
  };

  // Calculate progress percentage
  const progressPercent = Math.min(100, (workoutCount / 7) * 100);
  const targetPercent = Math.min(100, Math.round((workoutCount / 3) * 100));

  if (weekLoading || statsLoading) {
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

      {/* Stats */}
      <StatsPanel stats={stats} />

      {/* Progress Bar */}
      <div className="doom-panel p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-500 text-[8px]">PROBABILITY TO HIT TARGET</span>
          <span className="text-doom-green text-[10px] font-bold">
            {targetPercent}%
          </span>
        </div>
        <div className="progress-bar h-3 rounded overflow-hidden">
          <div
            className="progress-fill h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[7px]">
          <span className={workoutCount >= 3 ? 'text-doom-green' : 'text-gray-600'}>
            MIN (3) {workoutCount >= 3 && '✓'}
          </span>
          <span className={workoutCount >= 4 ? 'text-doom-gold' : 'text-gray-600'}>
            IDEAL (4) {workoutCount >= 4 && '✓'}
          </span>
          <span className={workoutCount >= 5 ? 'text-doom-red' : 'text-gray-600'}>
            BONUS (5+) {workoutCount >= 5 && '✓'}
          </span>
        </div>
      </div>

      {/* Boost Button */}
      <BoostButton />
    </div>
  );
}
