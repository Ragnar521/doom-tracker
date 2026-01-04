import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthButton() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <button className="text-[8px] text-gray-500 px-2 py-1" disabled>
        ...
      </button>
    );
  }

  if (user) {
    return (
      <button
        onClick={signOut}
        className="text-[8px] text-doom-green hover:text-white transition-colors px-2 py-1 truncate max-w-[100px]"
        title={user.displayName || user.email || 'Sign out'}
      >
        {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'USER'}
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/login')}
      className="text-[8px] text-gray-400 hover:text-doom-red transition-colors px-2 py-1"
    >
      SIGN IN
    </button>
  );
}
