import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  }>(
    (set) => ({
      config: defaultConfig,
      setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
      resetConfig: () => set({ config: defaultConfig }),
    }),
    { name: 'customization-config' }
  )
) 