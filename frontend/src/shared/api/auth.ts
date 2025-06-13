import { api } from '../api/client';
import Cookies from 'js-cookie';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/users/login', credentials);
    const { access_token, refresh_token } = response.data;
    Cookies.set('access_token', access_token, { 
      expires: 7,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    Cookies.set('refresh_token', refresh_token, { 
      expires: 7,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await api.post('/users/register', data);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/users/logout');
    } finally {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },

  isAuthenticated() {
    return !!Cookies.get('access_token');
  }
}; 