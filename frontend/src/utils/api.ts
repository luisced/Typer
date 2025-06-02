import { api } from '../api/client';

export async function registerUser(data: { email: string; username: string; password: string; full_name?: string }) {
  return api.post('/users/register', data);
}

export async function getCurrentUser() {
  return api.get('/users/me');
} 