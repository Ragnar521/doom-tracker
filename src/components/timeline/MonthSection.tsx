import { useState, useMemo } from 'react';
import type { WeekRecord } from '../../hooks/useAllWeeks';
import { calculateMonthStatsWithTrends } from '../../hooks/usePeriodStats';
import StatChip from './StatChip';
import TrendIndicator from './TrendIndicator';
import WeekGrid from './WeekGrid';

interface MonthSectionProps {
  year: number;
  month: number;
  weeks: WeekRecord[];
  previousMonthWeeks?: WeekRecord[];
  yearAgoMonthWeeks?: WeekRecord[];
}

export default function MonthSection({
  year,
  month,
  weeks,
  previousMonthWeeks = [],
  yearAgoMonthWeeks = []
}: MonthSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(
    () => calculateMonthStatsWithTrends(weeks, previousMonthWeeks, yearAgoMonthWeeks),
    [weeks, previousMonthWeeks, yearAgoMonthWeeks]
  );

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });

  // Calculate previous month name for trend label
  const previousMonth = (month - 1 + 12) % 12;
  const previousMonthName = new Date(year, previousMonth).toLocaleDateString('en-US', { month: 'short' });

  // Calculate year-ago label
  const yearAgoYear = year - 1;
  const yearAgoLabel = `vs ${monthName.slice(0, 3)} '${yearAgoYear.toString().slice(-2)}`;

  return (
    <div className="doom-panel mb-2">
      {/* Header button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-2 text-left flex items-center gap-2
                   text-doom-gold hover:text-doom-gold/80 transition-colors"
      >
        <span className="text-sm">{expanded ? '▼' : '▶'}</span>
        <span className="text-sm font-bold tracking-wider">{monthName.toUpperCase()}</span>
      </button>

      {/* Stats (always visible) */}
      <div className="flex flex-wrap gap-2 px-2 pb-2">
        <StatChip label="TOTAL" value={`${stats.totalWorkouts} workouts`} />
        <StatChip label="AVG/WEEK" value={stats.avgPerWeek.toFixed(1)} />
        <StatChip label="SUCCESS" value={`${stats.successRate.toFixed(0)}%`} />
        {stats.bestWeek && (
          <StatChip label="BEST" value={`${stats.bestWeek.count} workouts`} />
        )}
        <TrendIndicator trend={stats.trendVsPreviousMonth} label={`vs ${previousMonthName}`} />
        <TrendIndicator trend={stats.trendVsYearAgo} label={yearAgoLabel} />
      </div>

      {/* Expanded week grid */}
      {expanded && (
        <div className="px-2 pb-2 transition-all duration-300">
          <WeekGrid weeks={weeks} />
        </div>
      )}
    </div>
  );
}
