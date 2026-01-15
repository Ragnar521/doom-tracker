import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileEditor from '../components/ProfileEditor';
import Toast from '../components/Toast';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleSignIn = () => {
    navigate('/login');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="doom-panel p-3 text-center">
        <h2 className="text-gray-400 text-lg font-bold">SETTINGS</h2>
        <p className="text-gray-500 text-[8px]">CONFIGURATION</p>
      </div>

      {/* Account */}
      <div className="doom-panel p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-400 text-[10px] tracking-widest">ACCOUNT</h3>
          {user && !isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-doom-gold hover:text-doom-gold/80 text-[10px] transition-colors"
            >
              EDIT
            </button>
          )}
        </div>
        {user ? (
          <div className="space-y-3">
            {!isEditingProfile ? (
              <>
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-doom-red flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-doom-green text-sm">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-gray-500 text-[8px]">{user.email}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <ProfileEditor
                  onSuccess={(msg) => showToast(msg, 'success')}
                  onError={(msg) => showToast(msg, 'error')}
                  onClose={() => setIsEditingProfile(false)}
                />
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="w-full p-2 text-gray-400 hover:text-white text-[10px] border border-gray-700 hover:border-gray-500 transition-colors"
                >
                  CANCEL
                </button>
              </>
            )}
            <button
              onClick={signOut}
              className="doom-button w-full p-2 text-white text-[10px]"
            >
              SIGN OUT
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500 text-[10px]">
              Sign in to sync your data across devices
            </p>
            <button
              onClick={handleSignIn}
              className="doom-button w-full p-2 text-white text-[10px]"
            >
              SIGN IN
            </button>
          </div>
        )}
      </div>

      {/* About */}
      <div className="doom-panel p-3">
        <h3 className="text-gray-400 text-[10px] mb-3 tracking-widest">ABOUT</h3>
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between">
            <span className="text-gray-500">VERSION</span>
            <span className="text-gray-400">1.2.2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">THEME</span>
            <span className="text-doom-red">DOOM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">CREATED BY</span>
            <span className="text-doom-gold">Ragnar521</span>
          </div>

          {/* How it works toggle */}
          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="w-full mt-3 p-2 text-doom-gold hover:text-doom-gold/80 border border-doom-gold/30 hover:border-doom-gold/50 transition-colors text-[10px] tracking-widest"
          >
            {showHowItWorks ? '▼ HIDE HOW IT WORKS' : '► HOW IT WORKS'}
          </button>

          {/* Expandable How it works section */}
          {showHowItWorks && (
            <div className="mt-3 pt-3 border-t border-gray-800 space-y-3 text-[9px] text-gray-400 leading-relaxed">
              <div>
                <h4 className="text-doom-gold text-[10px] mb-1 tracking-widest">WEEKLY GOALS</h4>
                <p>
                  Track your workouts across 7 days (Monday to Sunday). Hit <span className="text-doom-green">3+ workouts</span> per week to maintain your streak.
                  Aim for <span className="text-doom-gold">4 workouts</span> for optimal results, or go full <span className="text-doom-gold">God Mode</span> with 5+ workouts!
                </p>
              </div>

              <div>
                <h4 className="text-doom-gold text-[10px] mb-1 tracking-widest">DOOMGUY STATES</h4>
                <p>
                  Your warrior's face reflects your weekly progress:
                </p>
                <ul className="ml-3 mt-1 space-y-0.5">
                  <li><span className="text-doom-red">0 workouts</span> → Critical (nearly defeated)</li>
                  <li><span className="text-orange-500">1 workout</span> → Hurt</li>
                  <li><span className="text-yellow-500">2 workouts</span> → Damaged</li>
                  <li><span className="text-doom-green">3 workouts</span> → Healthy (minimum target)</li>
                  <li><span className="text-doom-gold">4 workouts</span> → Strong (ideal target)</li>
                  <li><span className="text-doom-gold">5-7 workouts</span> → God Mode (unstoppable!)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-doom-gold text-[10px] mb-1 tracking-widest">STREAKS</h4>
                <p>
                  Build momentum by hitting 3+ workouts for consecutive weeks. Your <span className="text-doom-green">current streak</span> shows
                  how many weeks in a row you've succeeded. The current week only counts once you hit 3 workouts!
                </p>
                <p className="mt-1">
                  Mark weeks as <span className="text-blue-400">SICK</span> or <span className="text-purple-400">VACATION</span> to skip them without breaking your streak.
                </p>
              </div>

              <div>
                <h4 className="text-doom-gold text-[10px] mb-1 tracking-widest">ACHIEVEMENTS</h4>
                <p>
                  Unlock badges by reaching milestones: workout counts, streak records, God Mode weeks, and more.
                  Some achievements are hidden until you discover them!
                </p>
              </div>

              <div>
                <h4 className="text-doom-gold text-[10px] mb-1 tracking-widest">SQUAD</h4>
                <p>
                  Add fellow marines using friend codes. See their weekly progress, compete on the leaderboard,
                  and motivate each other to stay strong. Your friends can view your workout days to keep you accountable!
                </p>
              </div>

              <div>
                <h4 className="text-doom-gold text-[10px] mb-1 tracking-widest">DATA SYNC</h4>
                <p>
                  <span className="text-doom-green">Signed in users:</span> Your data syncs to the cloud across all devices.
                </p>
                <p className="mt-1">
                  <span className="text-gray-500">Guest mode:</span> Data stored locally on this device only.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <p className="text-doom-red text-center text-[10px] tracking-widest">
                  RIP & TEAR, UNTIL IT IS DONE!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data */}
      <div className="doom-panel p-3">
        <h3 className="text-gray-400 text-[10px] mb-3 tracking-widest">DATA</h3>
        <p className="text-gray-600 text-[8px] mb-2">
          {user ? 'Your data is synced to the cloud.' : 'Your data is stored locally on this device.'}
        </p>
      </div>

      {/* Toast notifications */}
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
