import type { UserSettings } from '@/types/firestore'
import { serverTimestamp } from 'firebase/firestore'

export const BASE_MONTHLY_HOURS = 151.67
export const BASE_WEEKLY_HOURS  = 35

// Valeurs par défaut injectées lors du premier accès d'un nouvel utilisateur
export const DEFAULT_SETTINGS: Omit<UserSettings, 'updatedAt'> = {
  hourlyRateGross:     0,
  grossMonthlySalary:  0,
  monthlyBaseHours:    BASE_MONTHLY_HOURS,
  cssRatePercent:      22,
  mutuelleEmployee:    0,

  shifts: [
    { key: 'matin',      label: 'Matin',      startTime: '06:00', endTime: '14:00', breakMinutes: 26, durationMinutes: 454 },
    { key: 'apres_midi', label: 'Après-midi', startTime: '14:00', endTime: '22:00', breakMinutes: 26, durationMinutes: 454 },
  ],

  majorationRules: [
    { key: 'heure_supp_25', label: 'Heures supp. (25 %)', ratePercent: 25,  enabled: true  },
    { key: 'heure_supp_50', label: 'Heures supp. (50 %)', ratePercent: 50,  enabled: true  },
    { key: 'dimanche',      label: 'Dimanche',             ratePercent: 25,  enabled: true  },
    { key: 'ferie',         label: 'Jour férié',           ratePercent: 100, enabled: true  },
    { key: 'premier_mai',   label: '1er Mai',              ratePercent: 100, enabled: true  },
    { key: 'jour_supp',     label: 'Jour supplémentaire',  ratePercent: 0,   enabled: false },
  ],

  majorationMode:       'priorite',
  counterInitialMinutes: 0,
  defaultView:          'home',
}

// Utilisé dans les composants qui ont besoin de construire un UserSettings complet
export function makeDefaultSettings(): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    updatedAt: serverTimestamp() as never,
  }
}
