import type { UserSettings } from '@/types/firestore'
import { isDimanche } from '@/utils/dateUtils'

export function getShiftDurationMinutes(settings: UserSettings, shiftKey?: string): number {
  if (shiftKey) {
    const shift = settings.shifts.find(s => s.key === shiftKey)
    if (shift) return shift.durationMinutes
  }
  return settings.shifts[0]?.durationMinutes ?? 454
}

export function computeOvertimeValuation(
  minutes: number,
  date: string,
  isFerie: boolean,
  settings: UserSettings,
): number {
  const isPremierMai = date.endsWith('-05-01')
  const isDim = isDimanche(date)
  const basePerMin = settings.hourlyRateGross / 60
  let rate: number

  if (isPremierMai) {
    rate = settings.majorationRules.find(r => r.key === 'premier_mai')?.ratePercent ?? 0
  } else if (isFerie) {
    rate = settings.majorationRules.find(r => r.key === 'ferie')?.ratePercent ?? 0
  } else if (isDim) {
    rate = settings.majorationRules.find(r => r.key === 'dimanche')?.ratePercent ?? 0
  } else {
    rate = settings.majorationRules.find(r => r.key === 'heure_supp_25')?.ratePercent ?? 0
  }

  return minutes * basePerMin * (1 + rate / 100)
}
