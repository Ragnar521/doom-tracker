import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { useWeek } from '../hooks/useWeek';
import { useAllWeeks } from '../hooks/useAllWeeks';
import { useXP } from '../hooks/useXP';
import { useAchievementContext } from '../contexts/AchievementContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import WeeklyLeaderboard from '../components/WeeklyLeaderboard';
import { getCurrentWeekId } from '../lib/weekUtils';
import { abbreviateRank } from '../lib/ranks';
import type { Friend } from '../types';

function getFaceState(workoutCount: number): string {
  if (workoutCount === 0) return 'critical';
  if (workoutCount === 1) return 'hurt';
  if (workoutCount === 2) return 'damaged';
  if (workoutCount === 3) return 'healthy';
  if (workoutCount === 4) return 'strong';
  return 'godmode';
}

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function FriendCard({ friend, onRemove }: { friend: Friend; onRemove: (uid: string) => void }) {
  const [showRemove, setShowRemove] = useState(false);

  const getFaceStateColor = (state: string) => {
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
  };

  const getFaceStateLabel = (state: string) => {
    return state.toUpperCase();
  };

  return (
    <div className="doom-panel p-3">
      <div className="flex items-start gap-3">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          {friend.photoURL ? (
            <img
              src={friend.photoURL}
              alt={friend.displayName}
              className="w-12 h-12 rounded"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center">
              <span className="text-doom-red text-xl font-bold">
                {friend.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-doom-green text-sm font-bold truncate">
              {friend.displayName}
            </h3>
            <button
              onClick={() => setShowRemove(true)}
              className="text-gray-600 hover:text-doom-red text-[10px] transition-colors"
            >
              REMOVE
            </button>
          </div>

          <p className="text-gray-500 text-[8px] mb-2">{friend.friendCode}</p>

          {friend.stats ? (
            <>
              {/* Status */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold ${getFaceStateColor(friend.stats.faceState)}`}>
                  {getFaceStateLabel(friend.stats.faceState)}
                </span>
                <span className="text-gray-600 text-[8px]">
                  {friend.stats.currentWeekWorkouts}/7 THIS WEEK
                </span>
              </div>

              {/* Week Grid */}
              <div className="flex gap-1">
                {friend.stats.currentWeekWorkoutDays.map((completed, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 aspect-square rounded flex flex-col items-center justify-center ${
                      completed ? 'bg-doom-green' : 'bg-gray-800'
                    }`}
                  >
                    <span className="text-[6px] text-white">{DAY_NAMES[idx]}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-[8px]">NO DATA</p>
          )}
        </div>
      </div>

      {/* Remove Confirmation */}
      {showRemove && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-gray-400 text-[9px] mb-2">REMOVE FROM SQUAD?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onRemove(friend.uid);
                setShowRemove(false);
              }}
              className="flex-1 bg-doom-red text-white text-[9px] py-1 rounded hover:bg-red-700 transition-colors"
            >
              CONFIRM
            </button>
            <button
              onClick={() => setShowRemove(false)}
              className="flex-1 bg-gray-700 text-gray-300 text-[9px] py-1 rounded hover:bg-gray-600 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Squad() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { friendCode, friends, loading, addFriend, removeFriend } = useFriends();
  const { workoutCount } = useWeek(getCurrentWeekId());

  // Get XP data for current user rank
  const { weeks, stats: allWeeksStats, loading: allWeeksLoading } = useAllWeeks();
  const { unlockedCount } = useAchievementContext();
  const { currentRank, loading: xpLoading } = useXP(weeks, allWeeksStats.currentStreak, unlockedCount, allWeeksLoading);

  const [addFriendCode, setAddFriendCode] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleCopyCode = () => {
    if (friendCode) {
      navigator.clipboard.writeText(friendCode);
      setToast({ message: 'CODE COPIED', type: 'success' });
    }
  };

  const handleAddFriend = async () => {
    if (!addFriendCode.trim()) return;

    setIsAdding(true);
    const result = await addFriend(addFriendCode);
    setIsAdding(false);

    if (result.success) {
      setToast({ message: result.message, type: 'success' });
      setAddFriendCode('');
    } else {
      setToast({ message: result.message, type: 'error' });
    }
  };

  const handleRemoveFriend = async (friendUid: string) => {
    const result = await removeFriend(friendUid);
    if (result.success) {
      setToast({ message: result.message, type: 'success' });
    } else {
      setToast({ message: result.message, type: 'error' });
    }
  };

  if (!user) {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="doom-panel p-3 text-center">
          <h2 className="text-doom-red text-lg font-bold">SQUAD</h2>
          <p className="text-gray-500 text-[8px]">YOUR BATTLE MARINES</p>
        </div>

        {/* Sign In Required */}
        <div className="doom-panel p-4 text-center">
          <p className="text-gray-400 text-[10px] mb-3">
            SIGN IN TO JOIN THE SQUAD
          </p>
          <button
            onClick={handleSignIn}
            className="doom-button w-full p-2 text-white text-[10px]"
          >
            SIGN IN
          </button>
        </div>
      </div>
    );
  }

  if (loading || allWeeksLoading || xpLoading) {
    return <LoadingSpinner size="lg" text="LOADING SQUAD..." />;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="doom-panel p-3 text-center">
        <h2 className="text-doom-red text-lg font-bold">SQUAD</h2>
        <p className="text-gray-500 text-[8px]">YOUR BATTLE MARINES</p>
      </div>

      {/* Your Friend Code */}
      <div className="doom-panel p-3">
        <h3 className="text-gray-400 text-[10px] mb-2 tracking-widest">YOUR CODE</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-900 p-2 rounded border border-gray-700">
            <p className="text-doom-gold text-center text-sm font-bold tracking-wider">
              {friendCode}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3 py-2 bg-doom-red text-white text-[9px] rounded hover:bg-red-700 transition-colors"
          >
            COPY
          </button>
        </div>
        <p className="text-gray-600 text-[7px] mt-2 text-center">
          SHARE THIS CODE WITH OTHER MARINES
        </p>
      </div>

      {/* Add Friend */}
      <div className="doom-panel p-3">
        <h3 className="text-gray-400 text-[10px] mb-2 tracking-widest">ADD MARINE</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={addFriendCode}
            onChange={(e) => setAddFriendCode(e.target.value.toUpperCase())}
            placeholder="ENTER FRIEND CODE"
            className="flex-1 bg-gray-900 text-white text-[10px] p-2 rounded border border-gray-700 focus:border-doom-red outline-none placeholder-gray-600"
            disabled={isAdding}
          />
          <button
            onClick={handleAddFriend}
            disabled={!addFriendCode.trim() || isAdding}
            className="px-3 py-2 bg-doom-green text-white text-[9px] rounded hover:bg-green-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            {isAdding ? 'ADDING...' : 'ADD'}
          </button>
        </div>
      </div>

      {/* Weekly Leaderboard - Only show if user has friends */}
      {friends.length > 0 && (
        <WeeklyLeaderboard
          friends={friends}
          currentUserId={user.uid}
          currentUserName={user.displayName || user.email?.split('@')[0] || 'Marine'}
          currentUserPhoto={user.photoURL}
          currentUserWorkoutCount={workoutCount}
          currentUserFaceState={getFaceState(workoutCount)}
          currentUserRankAbbrev={abbreviateRank(currentRank.name)}
          currentUserRankId={currentRank.id}
        />
      )}

      {/* Friends List */}
      <div className="doom-panel p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-400 text-[10px] tracking-widest">
            SQUAD MEMBERS
          </h3>
          <span className="text-doom-red text-[10px] font-bold">{friends.length}</span>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600 text-[9px] mb-2">NO MARINES IN SQUAD</p>
            <p className="text-gray-700 text-[7px]">ADD FRIENDS TO SEE THEIR PROGRESS</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <FriendCard
                key={friend.uid}
                friend={friend}
                onRemove={handleRemoveFriend}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
