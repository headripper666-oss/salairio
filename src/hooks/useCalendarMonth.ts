import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getMonthCalendarDays } from '@/services/firestore/calendarDays'
import { getPublicHolidaySet } from '@/engine/calendar'
import { useHolidayOverrides } from '@/hooks/useHolidayOverrides'
import { toMonthKey, isWeekend, isDimanche } from '@/utils/dateUtils'
import type { CalendarDay } from '@/types/firestore'

export interface CalendarDayEnriched extends CalendarDay {
  isWeekend: boolean
  isDimanche: boolean
  isFerie: boolean
}

export function useCalendarMonth(year: number, month: number) {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const monthKey = toMonthKey(year, month)
  const { overrides } = useHolidayOverrides(year)

  const query = useQuery({
    queryKey: ['calendarMonth', uid, monthKey],
    queryFn: () => getMonthCalendarDays(uid!, monthKey),
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  })

  const holidaySet = getPublicHolidaySet(year, overrides)

  const dayMap = new Map<string, CalendarDayEnriched>()
  for (const day of query.data ?? []) {
    dayMap.set(day.date, {
      ...day,
      isWeekend: isWeekend(day.date),
      isDimanche: isDimanche(day.date),
      isFerie: holidaySet.has(day.date),
    })
  }

  return {
    dayMap,
    holidaySet,
    isLoading: query.isLoading,
    monthKey,
  }
}
