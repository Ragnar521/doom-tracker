import { useAchievements } from '../hooks/useAchievements';
import type { AchievementCategory } from '../lib/achievements';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  streak: 'STREAK',
  performance: 'PERFORMANCE',
  special: 'SPECIAL',
  hidden: 'HIDDEN',
};

const CATEGORY_ORDER: AchievementCategory[] = ['streak', 'performance', 'special', 'hidden'];

interface AchievementCardProps {
  iconSrc: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progressData?: { current: number; target: number };
  isHidden: boolean;
}

function AchievementCard({
  iconSrc,
  name,
  description,
  isUnlocked,
  unlockedAt,
  progressData,
  isHidden,
}: AchievementCardProps) {
  // Don't show hidden achievements that are locked
  if (isHidden && !isUnlocked) return null;

  const progressPercent = progressData
    ? Math.min(100, (progressData.current / progressData.target) * 100)
    : 0;

  return (
    <div className={`achievement-card p-3 rounded ${isUnlocked ? 'unlocked' : 'locked'}`}>
      <div className="flex items-start gap-3">
        <img
          src={iconSrc}
          alt={name}
          className={`achievement-icon ${isUnlocked ? 'unlocked' : 'locked'}`}
        />
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-bold ${isUnlocked ? 'text-doom-gold' : 'text-gray-500'}`}>
            {name}
          </p>
          <p className="text-[8px] text-gray-400 mt-0.5">{description}</p>

          {/* Progress bar for locked achievements with progress */}
          {!isUnlocked && progressData && (
            <div className="mt-2">
              <div className="achievement-progress h-1.5 rounded overflow-hidden">
                <div
                  className="achievement-progress-fill h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[7px] text-gray-500 mt-0.5">
                {progressData.current} / {progressData.target}
              </p>
            </div>
          )}

          {/* Unlock date for unlocked achievements */}
          {isUnlocked && unlockedAt && (
            <p className="text-[7px] text-doom-gold mt-1">
              Unlocked {unlockedAt.toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Check mark for unlocked */}
        {isUnlocked && (
          <span className="text-doom-gold text-lg">✓</span>
        )}
      </div>
    </div>
  );
}

export default function Achievements() {
  const { achievements, unlockedCount, loading } = useAchievements();

  if (loading) {
    return <LoadingSpinner size="lg" text="LOADING GLORY..." />;
  }

  // Group achievements by category
  const byCategory = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = achievements.filter(a => a.category === category);
    return acc;
  }, {} as Record<AchievementCategory, typeof achievements>);

  // Count visible achievements (exclude locked hidden ones)
  const visibleCount = achievements.filter(a => !(a.category === 'hidden' && !a.isUnlocked)).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="doom-panel p-3 text-center">
        <h2 className="text-doom-gold text-lg font-bold">ACHIEVEMENTS</h2>
        <p className="text-gray-500 text-[8px]">GLORY AWAITS</p>
        <div className="mt-2 flex justify-center items-center gap-2">
          <span className="text-doom-gold text-xl font-bold">{unlockedCount}</span>
          <span className="text-gray-500 text-[10px]">/ {visibleCount} UNLOCKED</span>
        </div>
      </div>

      {/* Achievement Categories */}
      {CATEGORY_ORDER.map(category => {
        const categoryAchievements = byCategory[category];

        // Don't show hidden category if all are locked
        if (category === 'hidden') {
          const hasUnlocked = categoryAchievements.some(a => a.isUnlocked);
          if (!hasUnlocked) return null;
        }

        // Don't show empty categories
        const visibleAchievements = categoryAchievements.filter(
          a => !(a.category === 'hidden' && !a.isUnlocked)
        );
        if (visibleAchievements.length === 0) return null;

        return (
          <div key={category} className="doom-panel p-3">
            <h3 className="text-gray-400 text-[10px] mb-3 tracking-widest">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="space-y-2">
              {categoryAchievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  iconSrc={achievement.iconSrc}
                  name={achievement.name}
                  description={achievement.description}
                  isUnlocked={achievement.isUnlocked}
                  unlockedAt={achievement.unlockedAt}
                  progressData={achievement.progressData}
                  isHidden={achievement.category === 'hidden'}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
