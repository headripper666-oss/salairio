import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useSettings } from '@/hooks/useSettings'
import { getYearCalendarDays } from '@/services/firestore/calendarDays'
import { computeWorkedDays } from '@/engine/calendar'
import type { WorkedDays, CalendarDay } from '@/types/firestore'

export function useYearWorkStats(year: number) {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const { settings, isLoading: settingsLoading } = useSettings()

  const query = useQuery({
    queryKey: ['yearCalendarDays', uid, year],
    queryFn: () => getYearCalendarDays(uid!, year),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  })

  const stats = new Map<string, WorkedDays>()

  if (query.data && settings) {
    // Group days by month
    const byMonth = new Map<string, CalendarDay[]>()
    for (const d of query.data) {
      const monthKey = d.date.substring(0, 7)
      const list = byMonth.get(monthKey) ?? []
      list.push(d)
      byMonth.set(monthKey, list)
    }

    // Compute stats for each month
    byMonth.forEach((days, monthKey) => {
      stats.set(monthKey, computeWorkedDays(days, settings))
    })
  }

  return {
    stats,
    isLoading: query.isLoading || settingsLoading,
  }
}
