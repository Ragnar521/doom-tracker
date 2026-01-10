import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
}

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const COLORS = ['#d4af37', '#b91c1c', '#22c55e', '#3b82f6', '#ffffff'];

export default function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [triggerCount, setTriggerCount] = useState(0);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  // Track trigger changes to generate new confetti
  useEffect(() => {
    if (trigger) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTriggerCount((prev) => prev + 1);
    }
  }, [trigger]);

  // Generate confetti when trigger count changes
  useEffect(() => {
    if (triggerCount === 0) return;

    // Generate confetti pieces
    const newPieces: ConfettiPiece[] = Array.from({ length: 30 }, (_, i) => ({
      id: i + triggerCount * 30, // Unique IDs across triggers
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
    }));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(newPieces);

    // Clear after animation
    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [triggerCount, onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            top: 0,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
