import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PixelatedTransition() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Trigger pixelated dissolve on route change
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 180);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {isTransitioning && (
        <div className="fixed inset-0 z-[9997] pointer-events-none pixelated-transition">
          {/* 16x16 pixel grid dissolve effect */}
          <div className="pixel-grid">
            {Array.from({ length: 256 }).map((_, i) => {
              // Calculate position in 16x16 grid
              const row = Math.floor(i / 16);
              const col = i % 16;
              // Create wave pattern from center
              const centerX = 7.5;
              const centerY = 7.5;
              const distance = Math.sqrt(
                Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2)
              );
              const delay = distance * 8; // ms delay based on distance from center

              return (
                <div
                  key={i}
                  className="pixel-block"
                  style={{
                    animationDelay: `${delay}ms`,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
