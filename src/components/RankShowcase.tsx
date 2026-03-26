import { RANKS } from '../lib/ranks';
import type { Rank } from '../types';

interface RankShowcaseProps {
  currentRank: Rank;
  totalXP: number;
  xpToNextRank: number;
  nextRank: Rank | null;
}

export default function RankShowcase({
  currentRank,
  totalXP,
  xpToNextRank,
  nextRank,
}: RankShowcaseProps) {
  return (
    <div className="doom-panel p-3">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-doom-gold text-lg font-bold">RANK PROGRESSION</h2>
        <p className="text-gray-500 text-[8px]">CLIMB THE LADDER</p>
      </div>

      {/* Rank Cards */}
      <div className="space-y-2 mt-3">
        {RANKS.map((rank) => {
          const isEarned = rank.id <= currentRank.id;
          const isCurrent = rank.id === currentRank.id;

          return (
            <div
              key={rank.id}
              data-testid="rank-card"
              data-current={isCurrent ? 'true' : undefined}
              className={`achievement-card p-3 rounded ${
                isCurrent ? 'god-mode-glow border-doom-gold' : ''
              } ${!isEarned ? 'locked' : ''}`}
              style={isCurrent ? { willChange: 'box-shadow' } : undefined}
            >
              <div className="flex justify-between items-start">
                {/* Left side: Rank info */}
                <div className="flex-1">
                  {/* Line 1: Rank number and name */}
                  <p
                    className={`text-[10px] font-bold ${
                      isEarned ? rank.color : 'text-gray-600'
                    }`}
                  >
                    #{rank.id} {rank.name}
                  </p>

                  {/* Line 2: Tagline */}
                  <p className="text-[8px] text-gray-400">{rank.tagline}</p>

                  {/* Line 3: Progress indicator (current rank only) */}
                  {isCurrent && (
                    <p className="text-[7px] text-doom-gold mt-1">
                      {nextRank
                        ? `+${xpToNextRank} XP to ${nextRank.name}`
                        : 'MAX RANK ACHIEVED'}
                    </p>
                  )}
                </div>

                {/* Right side: XP threshold */}
                <div className="text-[9px] text-gray-500">
                  {rank.xpThreshold} XP
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
