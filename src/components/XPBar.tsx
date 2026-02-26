import { useState, useEffect, useRef } from 'react';
import type { Rank, LevelUpEvent } from '../types';

interface XPBarProps {
  currentRank: Rank;
  nextRank: Rank | null;
  totalXP: number;
  onClick: () => void;
  levelUpEvent: LevelUpEvent | null;
}

export default function XPBar({ currentRank, nextRank, totalXP, onClick, levelUpEvent }: XPBarProps) {
  const [animatedFill, setAnimatedFill] = useState(0);
  const [disableTransition, setDisableTransition] = useState(false);
  const prevRankIdRef = useRef(currentRank.id);

  // Helper function to abbreviate military rank names on mobile
  const abbreviateRank = (rankName: string): string => {
    const abbreviations: Record<string, string> = {
      'Private': 'PVT',
      'Corporal': 'CPL',
      'Sergeant': 'SGT',
      'Lieutenant': 'LT',
      'Captain': 'CPT',
      'Major': 'MAJ',
      'Colonel': 'COL',
      'Commander': 'CDR',
    };
    return abbreviations[rankName] || rankName;
  };

  // Calculate fill percentage
  const calculateFillPercentage = (): number => {
    if (!nextRank) {
      // Max rank (Doom Slayer)
      return 100;
    }

    const xpInCurrentRank = totalXP - currentRank.xpThreshold;
    const xpNeededForNextRank = nextRank.xpThreshold - currentRank.xpThreshold;
    const percentage = (xpInCurrentRank / xpNeededForNextRank) * 100;

    return Math.max(0, Math.min(100, percentage));
  };

  // Two-step fill animation on level-up
  useEffect(() => {
    const currentRankId = currentRank.id;

    // Check if rank increased (level-up)
    if (currentRankId > prevRankIdRef.current) {
      // Step 1: Fill to 100% with transition
      setAnimatedFill(100);

      // Step 2: After 800ms, reset to new rank percentage without transition
      const resetTimer = setTimeout(() => {
        setDisableTransition(true);

        // Use requestAnimationFrame to ensure transition is disabled before setting new value
        requestAnimationFrame(() => {
          setAnimatedFill(calculateFillPercentage());

          // Re-enable transition on next frame
          requestAnimationFrame(() => {
            setDisableTransition(false);
          });
        });
      }, 800);

      // Update ref to current rank
      prevRankIdRef.current = currentRankId;

      return () => clearTimeout(resetTimer);
    } else {
      // Normal XP gain: just set to calculated percentage with transition
      setAnimatedFill(calculateFillPercentage());
      prevRankIdRef.current = currentRankId;
    }
  }, [currentRank.id, totalXP, nextRank]);

  // Calculate minimum fill width (8% when XP > rank threshold, 0% otherwise)
  const fillWidth = totalXP > currentRank.xpThreshold ? Math.max(8, animatedFill) : animatedFill;

  return (
    <div className="doom-panel p-3 cursor-pointer" onClick={onClick}>
      {/* Rank name row */}
      <div className="flex justify-between items-center mb-2">
        <div className={`${currentRank.color} text-[10px] font-bold tracking-wider`}>
          {/* Mobile: abbreviated rank */}
          <span className="sm:hidden">{abbreviateRank(currentRank.name).toUpperCase()}</span>
          {/* Desktop: full rank name */}
          <span className="hidden sm:inline">{currentRank.name.toUpperCase()}</span>
        </div>
      </div>

      {/* XP bar */}
      <div
        className={`
          relative h-6 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]
          border-2 border-[#2a2a2a] rounded overflow-hidden
          ${currentRank.id === 15 ? 'doom-slayer-xp-glow' : ''}
        `}
      >
        {/* Fill */}
        <div
          className={`absolute inset-y-0 left-0 xp-fill ${disableTransition ? 'xp-fill-no-transition' : ''}`}
          style={{ width: `${fillWidth}%` }}
        />

        {/* XP text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
            {totalXP.toLocaleString()} / {nextRank ? nextRank.xpThreshold.toLocaleString() : '∞'} XP
          </span>
        </div>
      </div>
    </div>
  );
}
