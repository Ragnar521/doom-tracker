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
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!trigger) return;

    // Generate confetti pieces
    const newPieces: ConfettiPiece[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
    }));

    setPieces(newPieces);

    // Clear after animation
    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

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
