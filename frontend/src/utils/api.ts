import { api } from '../api/client';

export async function registerUser(data: { email: string; username: string; password: string; full_name?: string }) {
  return api.post('/users/register', data);
}

export async function getCurrentUser() {
  return api.get('/users/me');
} 

export interface LeaderboardUser {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  raw: number;
  consistency: number;
  rank: number;
  date: string;
  time: string;
  badges: string[];
}

export interface LeaderboardParams {
  time_mode?: string;
  period?: string;
  limit?: number;
  offset?: number;
  username?: string;
  test_length?: number;
  language?: string;
  min_tests?: number;
  start_date?: string;
  end_date?: string;
}

export async function getLeaderboard(params: LeaderboardParams = {}) {
  try {
    const response = await api.get<LeaderboardUser[]>('/users/leaderboard', { 
      params,
      headers: {
        'Accept': 'application/json',
      }
    });
    return response;
  } catch (error) {
    console.error('Leaderboard API error:', error);
    throw error;
  }
} 

// Admin User Management
export async function listUsers() {
  return api.get('/users/admin');
}

export async function getUserById(userId: string) {
  return api.get(`/users/admin/${userId}`);
}

export async function updateUser(userId: string, data: any) {
  return api.put(`/users/admin/${userId}`, data);
}

export async function deleteUser(userId: string) {
  return api.delete(`/users/admin/${userId}`);
}

export async function banUser(userId: string) {
  return api.patch(`/users/admin/${userId}/ban`);
}

export async function unbanUser(userId: string) {
  return api.patch(`/users/admin/${userId}/unban`);
}

export async function assignUserRole(userId: string, role: string) {
  return api.post(`/users/${userId}/roles/${role}`);
}

export async function removeUserRole(userId: string, role: string) {
  return api.delete(`/users/${userId}/roles/${role}`);
}

export async function getAuditLogs() {
  return api.get('/users/audit-logs');
}

export async function getSiteSettings() {
  return api.get('/users/settings');
}

export async function updateSiteSettings(data: any) {
  return api.put('/users/settings', data);
} 

// Gamification API functions
export interface XPBreakdown {
  base_xp: number;
  wpm_bonus: number;
  accuracy_bonus: number;
  difficulty_bonus: number;
  length_bonus: number;
  streak_bonus: number;
  total_xp: number;
}

export interface UserLevelInfo {
  user_id: string;
  current_xp: number;
  current_level: number;
  xp_for_current_level: number;
  xp_for_next_level: number;
  xp_progress_in_level: number;
  xp_needed_for_next: number;
}

export interface UserGameStats {
  user_id: string;
  current_streak: number;
  max_streak: number;
  last_test_date: string | null;
  total_tests_completed: number;
  total_words_typed: number;
  total_characters_typed: number;
  best_wpm: number;
  best_accuracy: number;
  total_typing_time_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: number;
  code: string;
  name: string;
  description: string;
  tier: string;
  icon_url: string;
  created_at: string;
  updated_at: string;
}

export interface BadgeWithEarnedStatus extends Badge {
  earned: boolean;
  earned_at: string | null;
}

export interface UserBadge {
  badge: Badge;
  earned_at: string;
}

export interface XPLog {
  id: number;
  user_id: string;
  test_id: string | null;
  xp_earned: number;
  base_xp: number;
  wpm_bonus: number;
  accuracy_bonus: number;
  difficulty_bonus: number;
  length_bonus: number;
  streak_bonus: number;
  reason: string;
  details: string | null;
  created_at: string;
}

export interface UserGamificationSummary {
  level_info: UserLevelInfo;
  game_stats: UserGameStats;
  recent_xp_logs: XPLog[];
  recent_badges: UserBadge[];
  badge_count: number;
}

// Get current user's level information
export async function getMyLevelInfo() {
  return api.get<UserLevelInfo>('/gamification/me/level');
}

// Get current user's game statistics
export async function getMyGameStats() {
  return api.get<UserGameStats>('/gamification/me/stats');
}

// Get current user's XP logs
export async function getMyXPLogs(limit: number = 50, offset: number = 0) {
  return api.get<XPLog[]>('/gamification/me/xp-logs', {
    params: { limit, offset }
  });
}

// Get current user's gamification summary
export async function getMyGamificationSummary() {
  try {
    return api.get<UserGamificationSummary>('/gamification/me/summary');
  } catch (error: any) {
    // If gamification endpoints are not available, return empty data
    if (error.response?.status === 404) {
      return {
        data: {
          level_info: {
            user_id: '',
            current_xp: 0,
            current_level: 1,
            xp_for_current_level: 0,
            xp_for_next_level: 100,
            xp_progress_in_level: 0,
            xp_needed_for_next: 100
          },
          game_stats: {
            user_id: '',
            current_streak: 0,
            max_streak: 0,
            last_test_date: null,
            total_tests_completed: 0,
            total_words_typed: 0,
            total_characters_typed: 0,
            best_wpm: 0,
            best_accuracy: 0,
            total_typing_time_seconds: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          recent_xp_logs: [],
          recent_badges: [],
          badge_count: 0
        }
      };
    }
    throw error;
  }
}

// Get all badges with earned status for current user
export async function getMyBadges() {
  try {
    return api.get<BadgeWithEarnedStatus[]>('/gamification/me/badges');
  } catch (error: any) {
    // If badges endpoint is not available, return empty array
    if (error.response?.status === 404) {
      return { data: [] };
    }
    throw error;
  }
}

// Get only earned badges for current user
export async function getMyEarnedBadges() {
  return api.get<UserBadge[]>('/gamification/me/badges/earned');
}

// Get all available badges (public)
export async function getAllBadges() {
  return api.get<Badge[]>('/gamification/badges');
}

// Get specific badge by code (public)
export async function getBadgeByCode(badgeCode: string) {
  return api.get<Badge>(`/gamification/badges/${badgeCode}`);
}

// Get level progression table (public)
export async function getLevelProgression() {
  return api.get('/gamification/levels/progression');
}

// Get user's badges (public)
export async function getUserBadges(userId: string) {
  return api.get<UserBadge[]>(`/gamification/users/${userId}/badges`);
}

// Get user's level info (public)
export async function getUserLevelInfo(userId: string) {
  return api.get<UserLevelInfo>(`/gamification/users/${userId}/level`);
}

// Get user's game stats (public)
export async function getUserGameStats(userId: string) {
  return api.get<UserGameStats>(`/gamification/users/${userId}/stats`);
} 