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