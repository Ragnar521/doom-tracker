import { useEffect, useState } from 'react';
import type { Achievement } from '../lib/achievements';
import Confetti from './Confetti';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: (id: string) => void;
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger entrance animation and confetti
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      setShowConfetti(true);
    }, 100);

    // Auto dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(achievement.id), 300);
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [achievement.id, onDismiss]);

  const handleClick = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(achievement.id), 300);
  };

  return (
    <>
      <Confetti trigger={showConfetti} />
      <div
        onClick={handleClick}
        className={`
          fixed top-4 left-1/2 -translate-x-1/2 z-50
          achievement-toast cursor-pointer
          transition-all duration-300 ease-out
          ${isVisible && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}
        `}
      >
        <div className="doom-panel p-4 border-2 border-doom-gold">
          <div className="flex items-center gap-3">
            <img
              src={achievement.iconSrc}
              alt={achievement.name}
              className="achievement-icon-toast animate-bounce"
            />
            <div>
              <p className="text-doom-gold text-[10px] tracking-widest mb-1">ACHIEVEMENT UNLOCKED</p>
              <p className="text-white text-sm font-bold">{achievement.name}</p>
              <p className="text-gray-400 text-[8px]">{achievement.description}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface AchievementToastContainerProps {
  achievements: Achievement[];
  onDismiss: (id: string) => void;
}

export function AchievementToastContainer({ achievements, onDismiss }: AchievementToastContainerProps) {
  if (achievements.length === 0) return null;

  // Show only the first achievement
  const currentAchievement = achievements[0];

  return <AchievementToast achievement={currentAchievement} onDismiss={onDismiss} />;
}
