import type { WeekRecord } from '../../hooks/useAllWeeks';
import { getWeekNumber, getHealthColor, getStatusBorderClass } from '../../lib/weekUtils';

interface WeekGridProps {
  weeks: WeekRecord[];
}

export default function WeekGrid({ weeks }: WeekGridProps) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {weeks.map((week) => {
        const weekNum = getWeekNumber(week.weekId);
        const bgColor = getHealthColor(week.workoutCount);
        const borderClass = getStatusBorderClass(week.status);

        return (
          <div
            key={week.weekId}
            className={`aspect-square rounded ${bgColor} ${borderClass}
                       flex items-center justify-center
                       text-[8px] text-white font-bold`}
            title={`Week ${weekNum}: ${week.workoutCount} workouts`}
          >
            {week.workoutCount}
          </div>
        );
      })}
    </div>
  );
}
