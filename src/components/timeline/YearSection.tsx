import { useState, useMemo } from 'react';
import type { WeekRecord } from '../../hooks/useAllWeeks';
import { calculateYearStatsWithTrends } from '../../lib/periodStats';
import StatChip from './StatChip';
import TrendIndicator from './TrendIndicator';
import MonthSection from './MonthSection';

interface YearSectionProps {
  year: number;
  yearWeeks: WeekRecord[];
  monthGroups: Map<number, WeekRecord[]>;
  previousYearWeeks?: WeekRecord[];
  previousYearMonthGroups?: Map<number, WeekRecord[]>;
  yearAgoMonthGroups?: Map<number, WeekRecord[]>;
}

export default function YearSection({
  year,
  yearWeeks,
  monthGroups,
  previousYearWeeks = [],
  previousYearMonthGroups,
  yearAgoMonthGroups
}: YearSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(
    () => calculateYearStatsWithTrends(yearWeeks, previousYearWeeks),
    [yearWeeks, previousYearWeeks]
  );

  return (
    <div className="doom-panel mb-2">
      {/* Header button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-2
                   text-doom-gold hover:text-doom-gold/80 transition-colors"
      >
        <span className="text-xl">{expanded ? '▼' : '▶'}</span>
        <span className="text-xl font-bold">{year}</span>
      </button>

      {/* Stats (always visible) */}
      <div className="px-3 pb-3 flex flex-wrap gap-2">
        <StatChip label="TOTAL" value={`${stats.totalWorkouts} workouts`} />
        <StatChip label="AVG/WEEK" value={stats.avgPerWeek.toFixed(1)} />
        <StatChip label="SUCCESS" value={`${stats.successRate.toFixed(0)}%`} />
        <StatChip label="STREAK" value={`${stats.longestStreak} weeks`} />
        <StatChip label="GOD MODE" value={`${stats.godModeCount} weeks`} color="text-doom-gold" />
        {stats.bestWeek && (
          <StatChip label="BEST" value={`${stats.bestWeek.count} workouts`} />
        )}
        <TrendIndicator trend={stats.trendVsPreviousYear} label={`vs ${year - 1}`} />
      </div>

      {/* Expanded month sections */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 transition-all duration-300">
          {Array.from(monthGroups.entries())
            .sort((a, b) => a[0] - b[0]) // Jan-Dec
            .map(([month, weeks]) => {
              // Get previous month weeks (handle year boundary)
              const previousMonth = (month - 1 + 12) % 12;
              const previousMonthWeeks = month === 0
                ? previousYearMonthGroups?.get(11) || []
                : monthGroups.get(previousMonth) || [];

              // Get year-ago month weeks
              const yearAgoMonthWeeks = yearAgoMonthGroups?.get(month) || [];

              return (
                <MonthSection
                  key={month}
                  year={year}
                  month={month}
                  weeks={weeks}
                  previousMonthWeeks={previousMonthWeeks}
                  yearAgoMonthWeeks={yearAgoMonthWeeks}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
