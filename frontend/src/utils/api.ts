import { api } from '../api/client';

export async function registerUser(data: { email: string; username: string; password: string; full_name?: string }) {
  return api.post('/users/register', data);
}

export async function getCurrentUser() {
  return api.get('/users/me');
} 

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  badges: string[];
  wpm: number;
  accuracy: number;
  raw: number;
  consistency: number;
  date: string;
  time: string;
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
  return api.get<LeaderboardUser[]>('/users/leaderboard', { params });
} 