import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getRandomTrack, type MusicTrack } from '../lib/music';
import AudioPlayer from '../components/AudioPlayer';

interface BoostContextType {
  isBoostActive: boolean;
  triggerBoost: () => void;
  showGrin: boolean;
}

const BoostContext = createContext<BoostContextType | null>(null);

export function BoostProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [showGrin, setShowGrin] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showShake, setShowShake] = useState(false);

  const triggerBoost = useCallback(() => {
    if (isBoostActive) return;

    // Start playing music
    const track = getRandomTrack();
    setCurrentTrack(track);
    setIsBoostActive(true);

    // Trigger visual effects
    setShowFlash(true);
    setShowShake(true);
    setShowGrin(true);

    // Clear effects after duration
    setTimeout(() => setShowFlash(false), 300);
    setTimeout(() => setShowShake(false), 400);
    setTimeout(() => setShowGrin(false), 2000);
  }, [isBoostActive]);

  const handleClosePlayer = useCallback(() => {
    setCurrentTrack(null);
    setIsBoostActive(false);
  }, []);

  return (
    <BoostContext.Provider value={{ isBoostActive, triggerBoost, showGrin }}>
      {/* Screen shake wrapper */}
      <div className={showShake ? 'animate-shake' : ''}>
        {children}
      </div>

      {/* Red flash overlay */}
      {showFlash && (
        <div className="fixed inset-0 bg-doom-red/40 pointer-events-none z-50 animate-flash" />
      )}

      {/* Border pulse when boost is active */}
      {isBoostActive && (
        <div className="fixed inset-0 pointer-events-none z-30 border-boost-pulse" />
      )}

      {/* Audio Player */}
      {currentTrack && (
        <AudioPlayer
          src={currentTrack.src}
          title={currentTrack.title}
          onClose={handleClosePlayer}
        />
      )}
    </BoostContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBoost() {
  const context = useContext(BoostContext);
  if (!context) {
    throw new Error('useBoost must be used within a BoostProvider');
  }
  return context;
}
