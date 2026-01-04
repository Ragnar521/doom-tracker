import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FormError from '../components/ui/FormError';
import LoadingSpinner from '../components/LoadingSpinner';

type AuthMode = 'login' | 'register';

export default function Login() {
  const { user, loading, error, signInWithGoogle, signInWithEmail, signUpWithEmail, clearError } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  // Show loading while checking auth state
  if (loading && !isSubmitting) {
    return <LoadingSpinner size="lg" text="CHECKING CREDENTIALS..." />;
  }

  const validateForm = (): boolean => {
    setFormError(null);
    clearError();

    if (!email.trim()) {
      setFormError('EMAIL IS REQUIRED');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('INVALID EMAIL FORMAT');
      return false;
    }

    if (!password) {
      setFormError('PASSWORD IS REQUIRED');
      return false;
    }

    if (password.length < 6) {
      setFormError('PASSWORD MUST BE AT LEAST 6 CHARACTERS');
      return false;
    }

    if (mode === 'register') {
      if (!confirmPassword) {
        setFormError('PLEASE CONFIRM YOUR PASSWORD');
        return false;
      }

      if (password !== confirmPassword) {
        setFormError('PASSWORDS DO NOT MATCH');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch {
      // Error is handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    clearError();
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormError(null);
    clearError();
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-xs w-full space-y-4">
        {/* Logo */}
        <div className="doom-panel p-4 text-center">
          <h1 className="font-doom text-4xl text-doom-red tracking-wider">
            REP & TEAR
          </h1>
          <p className="text-gray-500 text-[8px] mt-1 tracking-widest">
            UNTIL IT IS DONE
          </p>
        </div>

        {/* Enter Arena Text */}
        <div className="text-center">
          <p className="text-doom-gold text-[10px] tracking-widest">
            {mode === 'login' ? 'ENTER THE ARENA' : 'JOIN THE ARENA'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="doom-panel p-1 flex">
          <button
            type="button"
            onClick={() => mode !== 'login' && switchMode()}
            className={`flex-1 py-2 text-[9px] tracking-widest transition-all ${
              mode === 'login'
                ? 'bg-doom-red text-white'
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => mode !== 'register' && switchMode()}
            className={`flex-1 py-2 text-[9px] tracking-widest transition-all ${
              mode === 'register'
                ? 'bg-doom-red text-white'
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Messages */}
        <FormError message={formError || error} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="doom-panel p-4 space-y-4">
          <Input
            type="email"
            label="EMAIL"
            placeholder="warrior@doom.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <Input
            type="password"
            label="PASSWORD"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {mode === 'register' && (
            <Input
              type="password"
              label="CONFIRM PASSWORD"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          )}

          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-600 text-[8px] tracking-widest">OR</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="google"
          onClick={handleGoogleSignIn}
          isLoading={isSubmitting}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          SIGN IN WITH GOOGLE
        </Button>

        {/* Switch Mode Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={switchMode}
            className="text-gray-500 text-[8px] tracking-wider hover:text-doom-gold transition-colors"
          >
            {mode === 'login'
              ? "DON'T HAVE AN ACCOUNT? REGISTER"
              : 'ALREADY HAVE AN ACCOUNT? SIGN IN'}
          </button>
        </div>

        {/* Created By */}
        <div className="text-center pt-4">
          <p className="text-gray-600 text-[8px] tracking-wider">
            CREATED BY <span className="text-doom-gold">Ragnar521</span>
          </p>
        </div>
      </div>
    </div>
  );
}
