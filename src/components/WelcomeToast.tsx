import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomeToast() {
  const { user, isNewUser } = useAuth();
  const [show, setShow] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [message, setMessage] = useState('');
  const shownForUserIdRef = useRef<string | null>(null);
  const timersRef = useRef<{ leave?: ReturnType<typeof setTimeout>; hide?: ReturnType<typeof setTimeout> }>({});

  const dismiss = useCallback(() => {
    // Clear any pending timers
    if (timersRef.current.leave) clearTimeout(timersRef.current.leave);
    if (timersRef.current.hide) clearTimeout(timersRef.current.hide);

    setIsLeaving(true);
    timersRef.current.hide = setTimeout(() => {
      setShow(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Only show once per user session
    if (user && user.uid !== shownForUserIdRef.current) {
      shownForUserIdRef.current = user.uid;
      setMessage(isNewUser ? 'WELCOME TO THE ARENA' : 'WELCOME BACK, WARRIOR');
      setShow(true);
      setIsLeaving(false);

      // Start leaving animation after 2.5 seconds
      timersRef.current.leave = setTimeout(() => {
        setIsLeaving(true);
      }, 2500);

      // Fully hide after animation completes
      timersRef.current.hide = setTimeout(() => {
        setShow(false);
      }, 3000);

      return () => {
        if (timersRef.current.leave) clearTimeout(timersRef.current.leave);
        if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
      };
    }
  }, [user, isNewUser]);

  // Reset when user logs out
  useEffect(() => {
    if (!user) {
      shownForUserIdRef.current = null;
      setShow(false);
      setIsLeaving(false);
    }
  }, [user]);

  if (!show) return null;

  return (
    <div
      onClick={dismiss}
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        transition-all duration-500 ease-out cursor-pointer
        ${isLeaving ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}
      `}
    >
      <div className="doom-panel p-4 border-2 border-doom-green">
        <div className="text-center">
          <p className="text-doom-green text-[10px] tracking-widest font-bold">
            {message}
          </p>
          {isNewUser && (
            <p className="text-gray-400 text-[8px] mt-1">
              YOUR JOURNEY BEGINS NOW
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
