import { useEffect, useRef } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { scheduleNotification, cancelNotificationsWithPrefix, isNotificationGranted } from '@/hooks/useNotifications'
import type { Appointment } from '@/types/firestore'

function formatDelay(minutesBefore: number): string {
  if (minutesBefore >= 1440) return `dans ${minutesBefore / 1440 === 1 ? 'un jour' : `${minutesBefore / 1440} jours`}`
  if (minutesBefore >= 60)   return `dans ${minutesBefore / 60 === 1 ? 'une heure' : `${minutesBefore / 60}h`}`
  return `dans ${minutesBefore} min`
}

export function useAppointmentReminders(appointments: Appointment[]) {
  const { settings } = useSettings()
  const lastHash = useRef<string>('')

  useEffect(() => {
    if (!isNotificationGranted()) return

    const rules = settings?.apptReminderRules ?? []
    const hash = JSON.stringify(appointments) + JSON.stringify(rules)

    if (hash === lastHash.current) return
    lastHash.current = hash

    const now = Date.now()
    const toSchedule: { id: string; title: string; body: string; at: Date }[] = []

    for (const appt of appointments) {
      const [h, m] = appt.time.split(':').map(Number)
      const apptDate = new Date(appt.date)
      apptDate.setHours(h, m, 0, 0)

      rules.forEach((rule, idx) => {
        const at = new Date(apptDate.getTime() - rule.minutesBefore * 60 * 1000)
        if (at.getTime() <= now) return
        toSchedule.push({
          id: `appt-${appt.id}-${idx}`,
          title: `📅 ${appt.title}`,
          body: `RDV ${formatDelay(rule.minutesBefore)} à ${appt.time}`,
          at,
        })
      })
    }

    cancelNotificationsWithPrefix('appt-').then(() => {
      for (const { id, title, body, at } of toSchedule) {
        scheduleNotification(id, title, body, at)
      }
    })
  }, [appointments, settings?.apptReminderRules])
}
