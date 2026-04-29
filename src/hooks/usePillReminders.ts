import { useEffect, useRef } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { scheduleNotification, cancelNotificationsWithPrefix, isNotificationGranted } from '@/hooks/useNotifications'
import type { CalendarDayEnriched } from '@/hooks/useCalendarMonth'

const PILL_PREFIX = 'pill-'

function computeHash(dayMap: Map<string, CalendarDayEnriched>, times: Record<string, string>): string {
  const entries = [...dayMap.entries()]
    .map(([date, day]) => `${date}:${day.status}:${day.shiftKey ?? ''}`)
    .join('|')
  return entries + JSON.stringify(times)
}

export function usePillReminders(dayMap: Map<string, CalendarDayEnriched>) {
  const { settings } = useSettings()
  const lastHash = useRef<string>('')

  useEffect(() => {
    if (!settings?.pillReminderEnabled) return
    if (!isNotificationGranted()) return
    if (!settings.pillReminderTimes) return

    const times = settings.pillReminderTimes
    const hash = computeHash(dayMap, times)

    // Ne refait le travail que si les données ont réellement changé
    if (hash === lastHash.current) return
    lastHash.current = hash

    const now = Date.now()
    const toSchedule: { id: string; at: Date }[] = []

    for (const [date, day] of dayMap.entries()) {
      const workedStatuses = ['matin', 'apres_midi', 'jour_supp']
      const isWorked = workedStatuses.includes(day.status)

      let timeStr: string
      if (isWorked && day.shiftKey && times[day.shiftKey]) {
        timeStr = times[day.shiftKey]
      } else {
        timeStr = times.offDay
      }

      if (!timeStr) continue

      const [h, m] = timeStr.split(':').map(Number)
      const at = new Date(date)
      at.setHours(h, m, 0, 0)

      if (at.getTime() <= now) continue
      toSchedule.push({ id: `${PILL_PREFIX}${date}`, at })
    }

    // Cancel puis reschedule en une seule séquence atomique
    cancelNotificationsWithPrefix(PILL_PREFIX).then(() => {
      for (const { id, at } of toSchedule) {
        scheduleNotification(id, '💊 Rappel pilule', `N'oublie pas de prendre ta pilule !`, at)
      }
    })
  }, [dayMap, settings])
}
