import { useState, useEffect, useCallback } from 'react';
import { 
  getMyGamificationSummary, 
  getMyBadges
} from '@/shared/utils/api';
import type { UserGamificationSummary, BadgeWithEarnedStatus } from '@/shared/utils/api';

interface UseGamificationOptions {
  enabled?: boolean;
  autoFetch?: boolean;
}

export const useGamification = (options: UseGamificationOptions = {}) => {
  const { enabled = true, autoFetch = true } = options;
  
  const [summary, setSummary] = useState<UserGamificationSummary | null>(null);
  const [badges, setBadges] = useState<BadgeWithEarnedStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGamificationData = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [summaryResponse, badgesResponse] = await Promise.all([
        getMyGamificationSummary(),
        getMyBadges()
      ]);
      
      setSummary(summaryResponse.data);
      setBadges(badgesResponse.data);
    } catch (err: any) {
      console.error('Error fetching gamification data:', err);
      // Only set error if it's not a 401/403 (authentication issue)
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setError(err.response?.data?.detail || 'Failed to fetch gamification data');
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled && autoFetch) {
      fetchGamificationData();
    }
  }, [enabled, autoFetch, fetchGamificationData]);

  return {
    summary,
    badges,
    loading,
    error,
    refetch: fetchGamificationData,
    enabled
  };
}; 