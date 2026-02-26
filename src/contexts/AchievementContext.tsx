import { createContext, useContext, type ReactNode } from 'react';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementToastContainer } from '../components/AchievementToast';

interface AchievementContextType {
  achievements: ReturnType<typeof useAchievements>['achievements'];
  unlockedCount: number;
  totalCount: number;
  loading: boolean;
}

const AchievementContext = createContext<AchievementContextType | null>(null);

interface AchievementProviderProps {
  children: ReactNode;
  onXPGrant?: (amount: number) => Promise<void>;
}

export function AchievementProvider({ children, onXPGrant }: AchievementProviderProps) {
  const {
    achievements,
    unlockedCount,
    totalCount,
    newlyUnlocked,
    loading,
    dismissAchievement,
  } = useAchievements({ onXPGrant });

  return (
    <AchievementContext.Provider value={{ achievements, unlockedCount, totalCount, loading }}>
      {children}
      <AchievementToastContainer
        achievements={newlyUnlocked}
        onDismiss={dismissAchievement}
      />
    </AchievementContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAchievementContext() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievementContext must be used within an AchievementProvider');
  }
  return context;
}
