import { useState, useEffect } from 'react';
import { getWeeklyXPBreakdown } from '../lib/xpFormulas';
import type { Rank } from '../types';

interface XPBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  // This Week data
  workoutCount: number;
  currentStreak: number;
  weekStatus: 'normal' | 'sick' | 'vacation';
  // All Time data
  totalXP: number;
  achievementXP: number;
  // Rank data
  currentRank: Rank;
  nextRank: Rank | null;
  xpToNextRank: number;
}

type TabType = 'week' | 'alltime';

export default function XPBreakdownModal({
  isOpen,
  onClose,
  workoutCount,
  currentStreak,
  weekStatus,
  totalXP,
  achievementXP,
  currentRank,
  nextRank,
  xpToNextRank,
}: XPBreakdownModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('week');
  const [isLeaving, setIsLeaving] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset leaving state when modal opens (intentional for animation control)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLeaving(false);
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
      setIsLeaving(false);
    }, 300);
  };

  if (!isOpen && !isLeaving) return null;

  // Calculate breakdown data
  const weekBreakdown = getWeeklyXPBreakdown(workoutCount, currentStreak, weekStatus);
  const workoutXP = totalXP - achievementXP;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 doom-panel rounded-t-lg max-h-[80vh] overflow-y-auto ${
          isLeaving ? 'animate-slideDown' : 'animate-slideUp'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle indicator */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="relative px-4 pb-2">
          <h2 className="text-doom-gold text-[10px] tracking-widest text-center font-bold">
            XP BREAKDOWN
          </h2>
          <button
            onClick={handleClose}
            className="absolute top-0 right-4 text-gray-500 hover:text-gray-300 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b-2 border-gray-800 mb-4">
          <button
            onClick={() => setActiveTab('week')}
            className={`flex-1 py-2 text-[10px] tracking-widest font-bold transition-colors ${
              activeTab === 'week'
                ? 'text-doom-gold border-b-2 border-doom-gold -mb-[2px]'
                : 'text-gray-500'
            }`}
          >
            THIS WEEK
          </button>
          <button
            onClick={() => setActiveTab('alltime')}
            className={`flex-1 py-2 text-[10px] tracking-widest font-bold transition-colors ${
              activeTab === 'alltime'
                ? 'text-doom-gold border-b-2 border-doom-gold -mb-[2px]'
                : 'text-gray-500'
            }`}
          >
            ALL TIME
          </button>
        </div>

        {/* Tab content */}
        <div className="px-4 pb-4 space-y-3">
          {activeTab === 'week' ? (
            /* This Week tab */
            <div className="space-y-2">
              {weekStatus === 'normal' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-400 tracking-wider">WORKOUTS</span>
                    <span className="text-[11px] text-white font-semibold">
                      +{weekBreakdown.baseXP} XP
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-400 tracking-wider">STREAK BONUS</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        weekBreakdown.streakMultiplier > 1.0 ? 'text-doom-gold' : 'text-gray-500'
                      }`}
                    >
                      ×{weekBreakdown.streakMultiplier.toFixed(1)}
                    </span>
                  </div>

                  <div className="border-t border-gray-700 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-gray-400 tracking-wider font-bold">
                        WEEK TOTAL
                      </span>
                      <span className="text-[11px] text-doom-green font-bold">
                        +{weekBreakdown.totalXP} XP
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-[9px] text-gray-500 italic text-center py-4">
                  No XP earned during {weekStatus} weeks
                </p>
              )}
            </div>
          ) : (
            /* All Time tab */
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-400 tracking-wider">WORKOUT XP</span>
                <span className="text-[11px] text-white font-semibold">
                  {workoutXP.toLocaleString()} XP
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-400 tracking-wider">ACHIEVEMENT XP</span>
                <span className="text-[11px] text-white font-semibold">
                  {achievementXP.toLocaleString()} XP
                </span>
              </div>

              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400 tracking-wider font-bold">
                    TOTAL XP
                  </span>
                  <span className="text-[11px] text-doom-green font-bold">
                    {totalXP.toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rank progression section (always visible below tabs) */}
          <div className="border-t border-gray-700 pt-3 space-y-2">
            <h3 className="text-[9px] text-doom-gold tracking-widest font-bold">
              RANK PROGRESSION
            </h3>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-400 tracking-wider">CURRENT RANK</span>
                <span className={`text-[11px] font-bold ${currentRank.color}`}>
                  {currentRank.name}
                </span>
              </div>
              <p className="text-[8px] text-gray-500 text-right italic mt-0.5">
                {currentRank.tagline}
              </p>
            </div>

            {nextRank ? (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400 tracking-wider">NEXT RANK</span>
                  <span className={`text-[11px] font-bold ${nextRank.color}`}>
                    {nextRank.name}
                  </span>
                </div>
                <p className="text-[8px] text-gray-500 text-right mt-0.5">
                  {xpToNextRank.toLocaleString()} XP to go
                </p>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-[10px] text-doom-gold font-bold tracking-wider">
                  MAXIMUM RANK ACHIEVED
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
