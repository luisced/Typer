import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  token: string | null
  setToken: (token: string | null) => void
  clearToken: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: 'user-storage',
    }
  )
) 