import { useAllWeeks } from '../hooks/useAllWeeks';
import { getWeekNumber, getHealthColor, getStatusBorderClass } from '../lib/weekUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTimelineData } from '../hooks/useTimelineData';
import YearSection from '../components/timeline/YearSection';

const DAY_NAMES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

function StatCard({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="doom-panel p-3 text-center">
      <p className="text-gray-500 text-[8px] mb-1">{label}</p>
      <p className="text-2xl font-bold text-doom-red">{value}</p>
      {sublabel && <p className="text-[8px] text-gray-600">{sublabel}</p>}
    </div>
  );
}

function getHeatmapColor(count: number, max: number): string {
  if (max === 0) return 'bg-gray-800';
  const intensity = count / max;
  if (intensity >= 0.8) return 'bg-doom-green';
  if (intensity >= 0.6) return 'bg-green-700';
  if (intensity >= 0.4) return 'bg-green-800';
  if (intensity >= 0.2) return 'bg-green-900';
  return 'bg-gray-800';
}

export default function Dashboard() {
  const { stats, loading } = useAllWeeks();
  const { availableYears, getYearWeeks, yearMonthGroups } = useTimelineData();

  if (loading) {
    return <LoadingSpinner size="lg" text="CALCULATING DAMAGE..." />;
  }

  const maxDayFrequency = Math.max(...stats.dayFrequency);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="doom-panel p-3 text-center">
        <h2 className="text-doom-red text-lg font-bold">DAMAGE REPORT</h2>
        <p className="text-gray-500 text-[8px]">YOUR BATTLE STATISTICS</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="TOTAL WORKOUTS" value={stats.totalWorkouts} />
        <StatCard label="CURRENT STREAK" value={stats.currentStreak} sublabel="WEEKS" />
        <StatCard label="LONGEST STREAK" value={stats.longestStreak} sublabel="WEEKS" />
        <StatCard label="AVG PER WEEK" value={stats.averagePerWeek.toFixed(1)} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="SUCCESS RATE" value={`${stats.successRate.toFixed(0)}%`} />
        <StatCard label="TOTAL WEEKS" value={stats.totalWeeks} />
        <StatCard
          label="BEST WEEK"
          value={stats.bestWeek ? stats.bestWeek.count : '-'}
          sublabel={stats.bestWeek ? `W${getWeekNumber(stats.bestWeek.weekId)}` : undefined}
        />
      </div>

      {/* Day Frequency Heatmap */}
      <div className="doom-panel p-3">
        <h3 className="text-gray-400 text-[10px] mb-3 text-center tracking-widest">FAVORITE BATTLE DAYS</h3>
        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map((day, idx) => (
            <div key={day} className="text-center">
              <p className="text-[8px] text-gray-500 mb-1">{day}</p>
              <div
                className={`aspect-square rounded ${getHeatmapColor(stats.dayFrequency[idx], maxDayFrequency)}`}
                title={`${stats.dayFrequency[idx]} workouts`}
              />
              <p className="text-[8px] text-gray-600 mt-1">{stats.dayFrequency[idx]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Weeks Grid */}
      <div className="doom-panel p-3">
        <h3 className="text-gray-400 text-[10px] mb-3 text-center tracking-widest">LAST 12 WEEKS</h3>
        <div className="grid grid-cols-6 gap-1">
          {stats.recentWeeks.map((week) => (
            <div
              key={week.weekId}
              className={`aspect-square rounded ${getHealthColor(week.workoutCount)} ${getStatusBorderClass(week.status)} flex items-center justify-center`}
              title={`Week ${getWeekNumber(week.weekId)}: ${week.workoutCount} workouts`}
            >
              <span className="text-[8px] text-white font-bold">{week.workoutCount}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-3 text-[7px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-doom-red" /> 1-2
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-yellow-600" /> 3-4
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-green-600" /> 5
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-doom-green" /> 6-7
          </span>
        </div>
      </div>

      {/* Historical Timeline - appears only if historical data exists */}
      {availableYears.length > 0 && (
        <div className="doom-panel p-3">
          <h3 className="text-gray-400 text-[10px] mb-3 text-center tracking-widest">
            COMPLETE BATTLE HISTORY
          </h3>
          <div className="space-y-2">
            {availableYears.map((year, index) => {
              const yearWeeks = getYearWeeks(year);
              const monthGroups = yearMonthGroups.get(year) || new Map();

              // Get previous year data for year-over-year trends
              const previousYear = availableYears[index + 1];
              const previousYearWeeks = previousYear ? getYearWeeks(previousYear) : [];
              const previousYearMonthGroups = previousYear ? yearMonthGroups.get(previousYear) : undefined;

              // Get year-ago data for year-over-year month comparisons
              const yearAgo = year - 1;
              const yearAgoMonthGroups = yearMonthGroups.get(yearAgo);

              return (
                <YearSection
                  key={year}
                  year={year}
                  yearWeeks={yearWeeks}
                  monthGroups={monthGroups}
                  previousYearWeeks={previousYearWeeks}
                  previousYearMonthGroups={previousYearMonthGroups}
                  yearAgoMonthGroups={yearAgoMonthGroups}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
