import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import Input from './ui/Input';
import Button from './ui/Button';

interface ProfileEditorProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onClose?: () => void;
}

export default function ProfileEditor({ onSuccess, onError, onClose }: ProfileEditorProps) {
  const { user, refreshUser } = useAuth();
  const { loading, updateDisplayName } = useProfile();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(true);

  if (!user) return null;

  const handleUpdateName = async () => {
    if (!displayName.trim()) {
      onError('NAME CANNOT BE EMPTY');
      return;
    }

    if (displayName === user.displayName) {
      setIsEditingName(false);
      return;
    }

    const result = await updateDisplayName(displayName);
    if (result.success) {
      refreshUser();
      onSuccess(result.message);
      setIsEditingName(false);
      if (onClose) {
        setTimeout(onClose, 1000);
      }
    } else {
      onError(result.message);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(user.displayName || '');
    setIsEditingName(false);
  };

  return (
    <div className="space-y-3">
      {/* Display Name Section */}
      <div className="space-y-2">
        <label className="text-gray-500 text-[8px] tracking-widest">DISPLAY NAME</label>
        {isEditingName ? (
          <div className="space-y-2">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateName}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'SAVING...' : 'SAVE'}
              </Button>
              <button
                onClick={handleCancelEdit}
                disabled={loading}
                className="flex-1 p-2 text-gray-400 hover:text-white text-[10px] border border-gray-700 hover:border-gray-500 transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-doom-green text-sm">
              {user.displayName || user.email?.split('@')[0] || 'Marine'}
            </p>
            <button
              onClick={() => {
                setDisplayName(user.displayName || '');
                setIsEditingName(true);
              }}
              className="text-doom-gold hover:text-doom-gold/80 text-[10px] transition-colors"
            >
              EDIT
            </button>
          </div>
        )}
      </div>

      {/* Email (read-only) */}
      <div className="space-y-1">
        <label className="text-gray-500 text-[8px] tracking-widest">EMAIL</label>
        <p className="text-gray-400 text-[10px]">{user.email}</p>
      </div>
    </div>
  );
}
