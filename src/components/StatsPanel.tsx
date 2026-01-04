import type { UserStats } from '../hooks/useStats';

interface StatsPanelProps {
  stats: UserStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Streak */}
      <div className="doom-panel p-3">
        <p className="text-gray-500 text-[8px] mb-1 text-center tracking-widest">STREAK</p>
        <p className="font-doom text-3xl text-doom-red text-center">{stats.currentStreak}</p>
        <p className="text-[8px] text-gray-600 text-center">WEEKS</p>
      </div>

      {/* Total Gains */}
      <div className="doom-panel p-3">
        <p className="text-gray-500 text-[8px] mb-1 text-center tracking-widest">TOTAL GAINS</p>
        <p className="font-doom text-3xl text-doom-red text-center">{stats.totalWorkouts}</p>
        <p className="text-[8px] text-gray-600 text-center">WORKOUTS</p>
      </div>
    </div>
  );
}
