import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const params = new URLSearchParams();
        params.append('refresh_token', Cookies.get('refresh_token') || '');
        const response = await axios.post(`${API_URL}/users/refresh`, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

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

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear the tokens and redirect to login
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
        window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
); 