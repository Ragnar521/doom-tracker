import { useEffect, useState } from 'react';
import { useBoost } from '../contexts/BoostContext';

interface DoomFaceProps {
  workoutCount: number;
  showOuch?: boolean;
}

type FaceLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type FaceDirection = 'center' | 'left' | 'right' | 'ouch';

interface FaceConfig {
  level: string;
  baseName: string;
  status: string;
  color: string;
}

// Mapování počtu workoutů na face konfiguraci
const FACE_CONFIG: Record<FaceLevel, FaceConfig> = {
  0: { level: '0', baseName: 'critical', status: 'CRITICAL', color: 'text-[#ff0000]' },
  1: { level: '1', baseName: 'hurt', status: 'HURT BAD', color: 'text-[#ff4444]' },
  2: { level: '2', baseName: 'damaged', status: 'DAMAGED', color: 'text-[#ff8800]' },
  3: { level: '3', baseName: 'healthy', status: 'HEALTHY', color: 'text-[#d4af37]' },
  4: { level: '4', baseName: 'strong', status: 'STRONG', color: 'text-[#22c55e]' },
  5: { level: '5_6', baseName: 'godmode', status: 'GOD MODE', color: 'text-[#ffd700]' },
  6: { level: '5_6', baseName: 'godmode', status: 'ULTRA GOD', color: 'text-[#ffd700]' },
};

const getFaceLevel = (count: number): FaceLevel => {
  if (count <= 0) return 0;
  if (count >= 6) return 6;
  return count as FaceLevel;
};

const getFaceImage = (
  workoutCount: number,
  direction: FaceDirection,
  showGrin: boolean = false
): string => {
  const basePath = '/doom-assets/faces';

  // Grin face pro boost motivation
  if (showGrin) {
    return `${basePath}/face_grin.png`;
  }

  const level = getFaceLevel(workoutCount);
  const config = FACE_CONFIG[level];

  // Speciální face pro 6 workoutů (ULTRA GOD) - žluté oči
  if (level === 6 && direction === 'center') {
    return `${basePath}/face_godmode_eyes.png`;
  }

  // Ouch face
  if (direction === 'ouch') {
    return `${basePath}/face_${config.level}_ouch.png`;
  }

  // Pohled doleva/doprava
  if (direction === 'left') {
    return `${basePath}/face_${config.level}_left.png`;
  }
  if (direction === 'right') {
    return `${basePath}/face_${config.level}_right.png`;
  }

  // Pohled dopředu (center)
  return `${basePath}/face_${config.level}_${config.baseName}.png`;
};

export default function DoomFace({ workoutCount, showOuch = false }: DoomFaceProps) {
  const [direction, setDirection] = useState<FaceDirection>('center');
  const [isBlinking, setIsBlinking] = useState(false);
  const { showGrin, isBoostActive } = useBoost();

  const level = getFaceLevel(workoutCount);
  const config = FACE_CONFIG[level];
  const isGodMode = level >= 5;
  const isUltraGod = level === 6;
  const isCritical = level === 0;

  // Ouch animace při odebrání workoutu
  useEffect(() => {
    if (showOuch) {
      setDirection('ouch');
      const timer = setTimeout(() => setDirection('center'), 500);
      return () => clearTimeout(timer);
    }
  }, [showOuch]);

  // Náhodné rozhlížení
  useEffect(() => {
    if (showOuch || showGrin) return;

    const getInterval = () => {
      if (isGodMode || isBoostActive) return 1500; // Rychlé, agresivní
      if (isCritical) return 4000; // Pomalé, unavené
      return 2500; // Normální
    };

    const randomLook = () => {
      const rand = Math.random();
      if (rand < 0.5) {
        setDirection('center');
      } else if (rand < 0.75) {
        setDirection('left');
      } else {
        setDirection('right');
      }
    };

    const interval = setInterval(randomLook, getInterval());
    return () => clearInterval(interval);
  }, [showOuch, showGrin, isGodMode, isCritical, isBoostActive]);

  // Mrkání (občasné)
  useEffect(() => {
    const blink = () => {
      if (Math.random() < 0.3) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 100);
      }
    };

    const interval = setInterval(blink, 5000);
    return () => clearInterval(interval);
  }, []);

  const frameClass = `doom-frame ${isGodMode ? 'god-mode-glow' : ''} ${isUltraGod ? 'ultra-god-glow' : ''} ${isBoostActive ? 'boost-pulse' : ''} p-1`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={frameClass}>
        <img
          src={getFaceImage(workoutCount, direction, showGrin)}
          alt="Doom Face"
          className={`w-32 h-32 object-contain transition-opacity duration-75 ${isBlinking ? 'opacity-0' : 'opacity-100'}`}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="text-center">
        <p className={`text-xl font-bold ${config.color}`}>
          {config.status}
        </p>
        <p className="text-[10px] text-gray-500 mt-1">
          {workoutCount} / 7 WORKOUTS
        </p>
      </div>
    </div>
  );
}
