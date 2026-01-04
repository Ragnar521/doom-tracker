import {
  formatWeekDisplay,
  isCurrentWeek,
  isFutureWeek,
  getPreviousWeekId,
  getNextWeekId,
  getCurrentWeekId,
} from '../lib/weekUtils';
import type { WeekStatus } from '../hooks/useWeek';

interface WeekNavigationProps {
  weekId: string;
  status: WeekStatus;
  onWeekChange: (weekId: string) => void;
  onStatusChange: (status: WeekStatus) => void;
}

const STATUS_CONFIG: Record<WeekStatus, { label: string; class: string }> = {
  normal: { label: 'NORMAL', class: 'normal' },
  sick: { label: 'SICK', class: 'warning' },
  vacation: { label: 'VACATION', class: 'vacation' },
};

export default function WeekNavigation({
  weekId,
  status,
  onWeekChange,
  onStatusChange,
}: WeekNavigationProps) {
  const { week, year, dateRange } = formatWeekDisplay(weekId);
  const isCurrent = isCurrentWeek(weekId);
  const canGoNext = !isFutureWeek(getNextWeekId(weekId));

  const handlePrevious = () => {
    onWeekChange(getPreviousWeekId(weekId));
  };

  const handleNext = () => {
    if (canGoNext) {
      onWeekChange(getNextWeekId(weekId));
    }
  };

  const handleToday = () => {
    onWeekChange(getCurrentWeekId());
  };

  const cycleStatus = () => {
    const statuses: WeekStatus[] = ['normal', 'sick', 'vacation'];
    const currentIndex = statuses.indexOf(status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    onStatusChange(statuses[nextIndex]);
  };

  const statusConfig = STATUS_CONFIG[status];

  return (
    <div className="doom-panel p-3">
      <div className="flex items-center justify-between">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          className="nav-button w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
          aria-label="Previous week"
        >
          ←
        </button>

        {/* Week info */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-doom-red text-sm font-bold">
              WEEK {week} / {year}
            </h2>
            <button
              onClick={cycleStatus}
              className={`status-badge ${statusConfig.class}`}
              title="Click to change status"
            >
              {statusConfig.label}
            </button>
          </div>
          <p className="text-gray-500 text-[8px] mt-1">{dateRange}</p>
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`nav-button w-8 h-8 flex items-center justify-center ${
            canGoNext ? 'text-gray-400 hover:text-white' : 'text-gray-700 cursor-not-allowed'
          }`}
          aria-label="Next week"
        >
          →
        </button>
      </div>

      {/* Today button */}
      {!isCurrent && (
        <button
          onClick={handleToday}
          className="doom-button w-full mt-3 py-1 text-[10px] text-white font-bold"
        >
          TODAY
        </button>
      )}
    </div>
  );
}
