import { useMemo } from 'react';
import type { Friend } from '../types';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  workoutCount: number;
  faceState: string;
  rank: number;
  isCurrentUser: boolean;
}

interface WeeklyLeaderboardProps {
  friends: Friend[];
  currentUserId: string;
  currentUserName: string;
  currentUserPhoto: string | null;
  currentUserWorkoutCount: number;
  currentUserFaceState: string;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 bg-doom-gold rounded flex items-center justify-center font-doom text-black text-sm border-2 border-yellow-600">
        1
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center font-doom text-black text-sm border-2 border-gray-500">
        2
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="w-8 h-8 bg-yellow-700 rounded flex items-center justify-center font-doom text-white text-sm border-2 border-yellow-800">
        3
      </div>
    );
  }

  return (
    <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-gray-400 text-xs font-bold border border-gray-700">
      {rank}
    </div>
  );
}

function getFaceStateColor(state: string) {
  switch (state) {
    case 'critical':
      return 'text-doom-red';
    case 'hurt':
      return 'text-red-400';
    case 'damaged':
      return 'text-yellow-600';
    case 'healthy':
      return 'text-yellow-400';
    case 'strong':
      return 'text-doom-green';
    case 'godmode':
      return 'text-doom-gold';
    default:
      return 'text-gray-500';
  }
}

function getFaceStateLabel(state: string) {
  return state.toUpperCase();
}

export default function WeeklyLeaderboard({
  friends,
  currentUserId,
  currentUserName,
  currentUserPhoto,
  currentUserWorkoutCount,
  currentUserFaceState,
}: WeeklyLeaderboardProps) {
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    // Create entry for current user
    const currentUserEntry: LeaderboardEntry = {
      uid: currentUserId,
      displayName: currentUserName,
      photoURL: currentUserPhoto,
      workoutCount: currentUserWorkoutCount,
      faceState: currentUserFaceState,
      rank: 0,
      isCurrentUser: true,
    };

    // Create entries for friends
    const friendEntries: LeaderboardEntry[] = friends
      .filter((f) => f.stats)
      .map((f) => ({
        uid: f.uid,
        displayName: f.displayName,
        photoURL: f.photoURL,
        workoutCount: f.stats!.currentWeekWorkouts,
        faceState: f.stats!.faceState,
        rank: 0,
        isCurrentUser: false,
      }));

    // Combine and sort
    const allEntries = [currentUserEntry, ...friendEntries];
    allEntries.sort((a, b) => {
      // Sort by workout count descending
      if (b.workoutCount !== a.workoutCount) {
        return b.workoutCount - a.workoutCount;
      }
      // Tie-breaker: alphabetically by name
      return a.displayName.localeCompare(b.displayName);
    });

    // Assign ranks
    allEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return allEntries;
  }, [friends, currentUserId, currentUserName, currentUserPhoto, currentUserWorkoutCount, currentUserFaceState]);

  // Limit to top 10 for display
  const displayLeaderboard = leaderboard.slice(0, 10);

  return (
    <div className="doom-panel p-3">
      {/* Header */}
      <div className="text-center mb-3 pb-2 border-b border-gray-700">
        <h3 className="text-doom-gold text-sm font-doom tracking-widest">
          WEEKLY LEADERBOARD
        </h3>
        <p className="text-gray-500 text-[7px] mt-1">
          TOP MARINES THIS WEEK
        </p>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {displayLeaderboard.map((entry) => (
          <div
            key={entry.uid}
            className={`flex items-center gap-2 p-2 rounded transition-all ${
              entry.isCurrentUser
                ? 'bg-doom-red/20 border-2 border-doom-red'
                : 'bg-gray-900/50 border border-gray-800'
            }`}
          >
            {/* Rank Badge */}
            <RankBadge rank={entry.rank} />

            {/* Photo */}
            <div className="flex-shrink-0">
              {entry.photoURL ? (
                <img
                  src={entry.photoURL}
                  alt={entry.displayName}
                  className="w-8 h-8 rounded"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center">
                  <span className="text-doom-red text-xs font-bold">
                    {entry.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-white text-[10px] font-bold truncate">
                  {entry.isCurrentUser ? 'YOU' : entry.displayName.toUpperCase()}
                </p>
                <p className="text-gray-400 text-[9px] ml-2">
                  {entry.workoutCount}/7
                </p>
              </div>
              <p className={`text-[8px] font-bold ${getFaceStateColor(entry.faceState)}`}>
                {getFaceStateLabel(entry.faceState)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer if more than 10 entries */}
      {leaderboard.length > 10 && (
        <div className="mt-2 pt-2 border-t border-gray-800 text-center">
          <p className="text-gray-600 text-[7px]">
            +{leaderboard.length - 10} MORE MARINES
          </p>
        </div>
      )}
    </div>
  );
}
