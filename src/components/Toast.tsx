import { useEffect, useState } from 'react';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

export default function Toast({ message, type = 'info', duration = 4000, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onDismiss, 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onDismiss]);

  const handleClick = () => {
    setIsLeaving(true);
    setTimeout(onDismiss, 300);
  };

  const typeStyles = {
    error: 'error-toast text-doom-red',
    success: 'bg-gradient-to-b from-[#1a4a1a] to-[#0a3a0a] border-[#2a6a2a] text-doom-green',
    warning: 'bg-gradient-to-b from-[#4a4a1a] to-[#3a3a0a] border-[#6a6a2a] text-doom-gold',
    info: 'doom-panel text-gray-300',
  };

  const icons = {
    error: '⚠',
    success: '✓',
    warning: '⚡',
    info: 'ℹ',
  };

  return (
    <div
      onClick={handleClick}
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        cursor-pointer p-3 rounded border-2
        transition-all duration-300 ease-out
        ${typeStyles[type]}
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icons[type]}</span>
        <p className="text-[10px] font-bold tracking-wider">{message}</p>
      </div>
    </div>
  );
}

// Toast container for managing multiple toasts
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const currentToast = toasts[0];

  return (
    <Toast
      key={currentToast.id}
      message={currentToast.message}
      type={currentToast.type}
      onDismiss={() => onDismiss(currentToast.id)}
    />
  );
}
