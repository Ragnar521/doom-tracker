import { useEffect, useState } from 'react';
import type { LevelUpEvent } from '../types';
import Confetti from './Confetti';

interface LevelUpToastProps {
  event: LevelUpEvent;
  onDismiss: () => void;
}

export default function LevelUpToast({ event, onDismiss }: LevelUpToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger entrance animation and confetti
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      setShowConfetti(true);
    }, 100);

    // Auto dismiss after 5 seconds (longer than achievement toast for more impact)
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(), 300);
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  const handleClick = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(), 300);
  };

  return (
    <>
      <Confetti trigger={showConfetti} />
      <div
        onClick={handleClick}
        className={`
          fixed top-4 left-1/2 -translate-x-1/2 z-50
          cursor-pointer
          transition-all duration-300 ease-out
          ${isVisible && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}
        `}
      >
        <div className="doom-panel p-4 border-2 border-doom-gold">
          <div className="text-center">
            <p className="text-doom-gold text-[10px] tracking-widest mb-1">RANK PROMOTION</p>
            <p className={`${event.newRank.color} text-sm font-bold mb-1`}>
              {event.newRank.name.toUpperCase()}
            </p>
            <p className="text-gray-400 text-[8px]">{event.newRank.tagline}</p>
          </div>
        </div>
      </div>
    </>
  );
}
