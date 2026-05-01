import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { setCalendarDay } from '@/services/firestore/calendarDays'
import { addCounterMovement, deleteMovementsBySource } from '@/services/firestore/counterMovements'
import { useSettings } from '@/hooks/useSettings'
import { monthKeyFromDate } from '@/utils/dateUtils'
import { getShiftDurationMinutes, computeOvertimeValuation } from '@/engine/overtime'
import type { CalendarDay, DayStatus } from '@/types/firestore'

export interface SaveDayInput {
  status: DayStatus
  overtimeMinutes: number
  extraHoursMinutes: number  // pour jour_supp : durée brute (défaut 420 = 7h)
  breakMinutes: number       // pour jour_supp : pause à déduire (défaut 20)
  note: string
  isFerie: boolean
  shiftKey?: string
  mealCount: number          // 0 | 1 | 2 repas pris au boulot
}

export function useCalendarDay() {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const queryClient = useQueryClient()
  const { settings } = useSettings()

  const mutation = useMutation({
    mutationFn: async ({ date, input }: { date: string; input: SaveDayInput }) => {
      if (!uid) throw new Error('Non authentifié')
      const monthKey = monthKeyFromDate(date)

      await setCalendarDay(uid, date, {
        status: input.status,
        overtimeMinutes: input.overtimeMinutes,
        extraHoursMinutes: input.extraHoursMinutes,
        breakMinutes: input.breakMinutes,
        isFerie: input.isFerie,
        note: input.note,
        shiftKey: input.shiftKey,
        mealCount: input.mealCount,
      })

      await deleteMovementsBySource(uid, date)

      if (!settings) return

      if ((input.status === 'matin' || input.status === 'apres_midi') && input.overtimeMinutes > 0) {
        await addCounterMovement(uid, {
          date,
          monthKey,
          type: 'acquise_supp',
          quantityMinutes: input.overtimeMinutes,
          valuationEuros: computeOvertimeValuation(input.overtimeMinutes, date, input.isFerie, settings),
          sourceDocId: date,
          note: '',
        })
      } else if (input.status === 'jour_supp') {
        const duration = Math.max(0, input.extraHoursMinutes - input.breakMinutes)
        await addCounterMovement(uid, {
          date,
          monthKey,
          type: 'acquise_jour_supp',
          quantityMinutes: duration,
          valuationEuros: computeOvertimeValuation(duration, date, input.isFerie, settings),
          sourceDocId: date,
          note: '',
        })
      } else if (input.status === 'recuperation') {
        const duration = getShiftDurationMinutes(settings, input.shiftKey)
        await addCounterMovement(uid, {
          date,
          monthKey,
          type: 'recuperee',
          quantityMinutes: -duration,
          valuationEuros: 0,
          sourceDocId: date,
          note: '',
        })
      }
    },

    onMutate: async ({ date, input }) => {
      const monthKey = monthKeyFromDate(date)
      const qKey = ['calendarMonth', uid, monthKey]

      await queryClient.cancelQueries({ queryKey: qKey })
      const previous = queryClient.getQueryData<CalendarDay[]>(qKey)

      queryClient.setQueryData<CalendarDay[]>(qKey, (old = []) => {
        const updated: CalendarDay = {
          date,
          status: input.status,
          overtimeMinutes: input.overtimeMinutes,
          extraHoursMinutes: input.extraHoursMinutes,
          breakMinutes: input.breakMinutes,
          isFerie: input.isFerie,
          note: input.note,
          shiftKey: input.shiftKey,
          mealCount: input.mealCount,
          updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as CalendarDay['updatedAt'],
        }
        const idx = old.findIndex(d => d.date === date)
        if (idx >= 0) {
          const next = [...old]
          next[idx] = updated
          return next
        }
        return [...old, updated]
      })

      return { previous, monthKey }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['calendarMonth', uid, context.monthKey], context.previous)
      }
    },

    onSettled: (_data, _err, { date }) => {
      const monthKey = monthKeyFromDate(date)
      queryClient.invalidateQueries({ queryKey: ['calendarMonth', uid, monthKey] })
      queryClient.invalidateQueries({ queryKey: ['counterMovements', uid] })
    },
  })

  return {
    saveDay: (date: string, input: SaveDayInput) => mutation.mutate({ date, input }),
    isSaving: mutation.isPending,
    saveError: mutation.error,
  }
}
