import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../api/client'

export type CustomizationConfig = {
  theme: string
  accent: string
  cursor: string
  cursorBlink: boolean
  charFill: boolean
  sounds: boolean
  soundSet: string
  volume: number
  font: string
  fontSize: number
  keyHighlight: boolean
  onScreenKeyboard: boolean
  animations: boolean
  showStats: boolean
  showProgress: boolean
}

const defaultConfig: CustomizationConfig = {
  theme: 'system',
  accent: '#3182ce',
  cursor: 'bar',
  cursorBlink: true,
  charFill: false,
  sounds: true,
  soundSet: 'classic',
  volume: 50,
  font: 'monospace',
  fontSize: 18,
  keyHighlight: false,
  onScreenKeyboard: false,
  animations: true,
  showStats: true,
  showProgress: true,
}

export const useCustomizationStore = create(
  persist<{
    config: CustomizationConfig
    setConfig: (config: Partial<CustomizationConfig>) => void
    resetConfig: () => void
    syncWithBackend: () => Promise<void>
  }>(
    (set, get) => ({
      config: defaultConfig,
      setConfig: async (config) => {
        const newConfig = { ...get().config, ...config }
        set({ config: newConfig })
        
        try {
          // Sync with backend
          await api.put('/users/me/customization', newConfig)
        } catch (error) {
          console.error('Failed to sync customization with backend:', error)
        }
      },
      resetConfig: async () => {
        set({ config: defaultConfig })
        
        try {
          // Reset backend settings
          await api.put('/users/me/customization', defaultConfig)
        } catch (error) {
          console.error('Failed to reset customization in backend:', error)
        }
      },
      syncWithBackend: async () => {
        try {
          const response = await api.get('/users/me/customization')
          set({ config: response.data })
        } catch (error) {
          console.error('Failed to fetch customization from backend:', error)
        }
      }
    }),
    { name: 'customization-config' }
  )
) 