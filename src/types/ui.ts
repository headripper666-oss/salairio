import type { DayStatus } from './firestore'

export type ThemeMode = 'dark' | 'light'

export interface NavItem {
  path: string
  label: string
  labelShort?: string
  iconName: string
}

export interface StatusColorConfig {
  status: DayStatus | 'vide'
  label: string
  labelShort: string
  color: string          // hex
  bgClass: string        // CSS class
  badgeClass: string     // CSS class
  tailwindBg: string     // Tailwind class
  tailwindText: string   // Tailwind class
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}
