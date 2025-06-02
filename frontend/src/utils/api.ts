import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
  // Prefer cookie token for SSR and client
  const token = Cookies.get('access_token') || localStorage.getItem('user-storage')
  if (token) {
    let accessToken = token
    if (token.startsWith('{')) {
      try {
        const { state } = JSON.parse(token)
        if (state.token) accessToken = state.token
      } catch (error) {
        console.error('Error parsing token:', error)
      }
    }
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

export async function registerUser(data: { email: string; username: string; password: string; full_name?: string }) {
  return api.post('/users/register', data)
}

export async function getCurrentUser() {
  return api.get('/users/me')
} 