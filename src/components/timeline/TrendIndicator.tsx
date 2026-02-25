import type { TrendData } from '../../lib/trendUtils';

interface TrendIndicatorProps {
  trend: TrendData | null;
  label?: string;
}

/**
 * TrendIndicator displays percentage change with arrow and optional context label.
 * Mirrors StatChip pattern for visual consistency within timeline sections.
 * Uses DOOM theme colors (green=improvement, red=decline, gray=stable).
 * Returns null when no trend data available (hides indicator).
 */
export default function TrendIndicator({ trend, label }: TrendIndicatorProps) {
  if (!trend) return null;

  // Determine color based on direction
  const colorClass =
    trend.direction === 'up'
      ? 'text-doom-green'
      : trend.direction === 'down'
        ? 'text-doom-red'
        : 'text-gray-500';

  return (
    <div className="bg-gray-900 border border-gray-800 px-2 py-1 rounded inline-flex items-center gap-1">
      <span className={`${colorClass} text-[9px] font-bold`}>
        {trend.display}
      </span>
      {label && (
        <span className="text-gray-500 text-[8px]">
          {label}
        </span>
      )}
    </div>
  );
}
