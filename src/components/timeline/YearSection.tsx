import { useState, useMemo } from 'react';
import type { WeekRecord } from '../../hooks/useAllWeeks';
import { calculateYearStats } from '../../hooks/usePeriodStats';
import StatChip from './StatChip';
import MonthSection from './MonthSection';

interface YearSectionProps {
  year: number;
  yearWeeks: WeekRecord[];
  monthGroups: Map<number, WeekRecord[]>;
}

export default function YearSection({ year, yearWeeks, monthGroups }: YearSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => calculateYearStats(yearWeeks), [yearWeeks]);

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
      </div>

      {/* Expanded month sections */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 transition-all duration-300">
          {Array.from(monthGroups.entries())
            .sort((a, b) => a[0] - b[0]) // Jan-Dec
            .map(([month, weeks]) => (
              <MonthSection key={month} year={year} month={month} weeks={weeks} />
            ))}
        </div>
      )}
    </div>
  );
}
