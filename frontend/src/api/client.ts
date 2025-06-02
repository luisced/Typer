import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // ensures cookies are sent automatically
});

// Attach the interceptor only once, here:
api.interceptors.request.use((config) => {
  // 1) Try to read the token from the cookie
  let token = Cookies.get('access_token') || localStorage.getItem('user-storage');

  if (token && token.startsWith('{')) {
    // If localStorage stored a JSON blob, unwrap it
    try {
      const parsed = JSON.parse(token);
      if (parsed.state?.token) {
        token = parsed.state.token;
      }
    } catch {
      // ignore parse errors
    }
  }

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
); 