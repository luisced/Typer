import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface LeaderboardContextType {
  tab: string;
  setTab: (tab: string) => void;
  timeMode: string;
  setTimeMode: (mode: string) => void;
  currentTimeMode: string;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export const LeaderboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tab, setTab] = useState('all-time');
  const [timeMode, setTimeMode] = useState('15');

  const currentTimeMode = timeMode;

  return (
    <LeaderboardContext.Provider
      value={{
        tab,
        setTab,
        timeMode,
        setTimeMode,
        currentTimeMode,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = (): LeaderboardContextType => {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
}; 