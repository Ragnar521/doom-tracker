import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  locationKey: string;
}

export default function PageTransition({ children, locationKey }: PageTransitionProps) {
  // Pure DOOM style - instant page switch, no fade
  // The screen wipe handles the transition effect
  return <div key={locationKey}>{children}</div>;
}
