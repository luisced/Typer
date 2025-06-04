import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getLeaderboard, type LeaderboardUser } from '../utils/api';

interface LeaderboardContextType {
  tab: string;
  setTab: (tab: string) => void;
  timeMode: string;
  setTimeMode: (mode: string) => void;
  currentTimeMode: string;
  users: LeaderboardUser[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  refreshLeaderboard: () => Promise<void>;
  username: string;
  setUsername: (username: string) => void;
  testLength: number | null;
  setTestLength: (length: number | null) => void;
  language: string;
  setLanguage: (language: string) => void;
  minTests: number;
  setMinTests: (count: number) => void;
  startDate: string | null;
  setStartDate: (date: string | null) => void;
  endDate: string | null;
  setEndDate: (date: string | null) => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export const LeaderboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tab, setTab] = useState('all-time');
  const [timeMode, setTimeMode] = useState<string>("all");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [username, setUsername] = useState("");
  const [testLength, setTestLength] = useState<number | null>(null);
  const [language, setLanguage] = useState("all");
  const [minTests, setMinTests] = useState(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 15;

  const currentTimeMode = timeMode;

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLeaderboard({
        time_mode: timeMode === "all" ? "all" : timeMode,
        period: tab,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        username: username || undefined,
        test_length: testLength || undefined,
        language: language === "all" ? undefined : language,
        min_tests: minTests,
        start_date: startDate || undefined,
        end_date: endDate || undefined
      });

      if (response.data) {
        setUsers(response.data);
        setTotalUsers(response.data.length);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Failed to fetch leaderboard data';
      setError(errorMessage);
      console.error('Error fetching leaderboard:', err);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [tab, timeMode, currentPage, username, testLength, language, minTests, startDate, endDate]);

  const refreshLeaderboard = async () => {
    await fetchLeaderboard();
  };

  return (
    <LeaderboardContext.Provider
      value={{
        tab,
        setTab,
        timeMode,
        setTimeMode,
        currentTimeMode,
        users,
        loading,
        error,
        totalUsers,
        currentPage,
        setCurrentPage,
        refreshLeaderboard,
        username,
        setUsername,
        testLength,
        setTestLength,
        language,
        setLanguage,
        minTests,
        setMinTests,
        startDate,
        setStartDate,
        endDate,
        setEndDate
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