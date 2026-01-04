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

export function AchievementProvider({ children }: { children: ReactNode }) {
  const {
    achievements,
    unlockedCount,
    totalCount,
    newlyUnlocked,
    loading,
    dismissAchievement,
  } = useAchievements();

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

export function useAchievementContext() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievementContext must be used within an AchievementProvider');
  }
  return context;
}
