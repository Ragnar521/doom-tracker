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
