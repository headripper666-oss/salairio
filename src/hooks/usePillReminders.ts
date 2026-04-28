import { useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { scheduleNotification, cancelNotificationsWithPrefix, isNotificationGranted } from '@/hooks/useNotifications'
import type { CalendarDayEnriched } from '@/hooks/useCalendarMonth'

const PILL_PREFIX = 'pill-'

// Programmation des rappels pilule pour le mois donné
export function usePillReminders(dayMap: Map<string, CalendarDayEnriched>) {
  const { settings } = useSettings()

  useEffect(() => {
    if (!settings?.pillReminderEnabled) return
    if (!isNotificationGranted()) return
    if (!settings.pillReminderTimes) return

    const times = settings.pillReminderTimes
    const now = Date.now()

    cancelNotificationsWithPrefix(PILL_PREFIX)

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

      scheduleNotification(
        `${PILL_PREFIX}${date}`,
        '💊 Rappel pilule',
        `N'oublie pas de prendre ta pilule !`,
        at,
      )
    }
  }, [dayMap, settings])
}
