interface WeekTrackerProps {
  workouts: boolean[];
  onToggleDay: (dayIndex: number) => void;
}

const DAY_NAMES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export default function WeekTracker({ workouts, onToggleDay }: WeekTrackerProps) {
  return (
    <div className="doom-panel p-4">
      <div className="grid grid-cols-7 gap-1">
        {workouts.map((completed, index) => (
          <button
            key={index}
            data-day={index}
            data-completed={completed}
            onClick={() => onToggleDay(index)}
            className={`
              day-button aspect-square flex flex-col items-center justify-center
              rounded transition-all duration-200
              ${completed ? 'completed' : 'hover:border-gray-500'}
            `}
          >
            <span className={`text-[8px] font-bold ${completed ? 'text-doom-green' : 'text-gray-400'}`}>
              {DAY_NAMES[index]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
