import { useUserStore } from '../store'

export const useAuth = () => {
  const { token, setToken, clearToken } = useUserStore()

  const isAuthenticated = !!token

  return {
    token,
    isAuthenticated,
    setToken,
    clearToken,
  }
} 