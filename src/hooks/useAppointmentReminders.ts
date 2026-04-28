import { useEffect } from 'react'
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

  useEffect(() => {
    if (!isNotificationGranted()) return

    const rules = settings?.apptReminderRules ?? []
    const now = Date.now()

    // Annule tous les anciens rappels RDV avant de reprogrammer
    cancelNotificationsWithPrefix('appt-')

    if (rules.length === 0) return

    for (const appt of appointments) {
      const [h, m] = appt.time.split(':').map(Number)
      const apptDate = new Date(appt.date)
      apptDate.setHours(h, m, 0, 0)

      rules.forEach((rule, idx) => {
        const at = new Date(apptDate.getTime() - rule.minutesBefore * 60 * 1000)
        if (at.getTime() <= now) return

        scheduleNotification(
          `appt-${appt.id}-${idx}`,
          `📅 ${appt.title}`,
          `RDV ${formatDelay(rule.minutesBefore)} à ${appt.time}`,
          at,
        )
      })
    }
  }, [appointments, settings?.apptReminderRules])
}
