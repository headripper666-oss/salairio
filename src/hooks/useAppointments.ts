import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import {
  getAllAppointments,
  setAppointment,
  deleteAppointment,
} from '@/services/firestore/appointments'
import { toMonthKey } from '@/utils/dateUtils'
import type { Appointment } from '@/types/firestore'

// Cache global — un seul fetch pour tous les mois, filtrage côté client
function allApptKey(uid: string | null) {
  return ['appointments', uid]
}

export function useAllAppointments() {
  const uid = useAuthStore(s => s.user?.uid) ?? null

  return useQuery({
    queryKey: allApptKey(uid),
    queryFn: () => getAllAppointments(uid!),
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAppointmentsMonth(year: number, month: number) {
  const monthKey = toMonthKey(year, month)
  const { data, isLoading } = useAllAppointments()

  const appointments = (data ?? []).filter(a => a.date.startsWith(monthKey))

  return { appointments, isLoading }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useSaveAppointment(_year: number, _month: number) {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appt: Omit<Appointment, 'createdAt'>) => setAppointment(uid!, appt),

    onMutate: async (appt) => {
      const qKey = allApptKey(uid)
      await queryClient.cancelQueries({ queryKey: qKey })
      const previous = queryClient.getQueryData<Appointment[]>(qKey)

      const optimistic: Appointment = {
        ...appt,
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as Appointment['createdAt'],
      }
      queryClient.setQueryData<Appointment[]>(qKey, (old = []) => {
        const filtered = old.filter(a => a.id !== appt.id)
        return [...filtered, optimistic]
      })

      return { previous }
    },

    onError: (_err, _appt, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(allApptKey(uid), context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: allApptKey(uid) })
    },
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useDeleteAppointment(_year: number, _month: number) {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAppointment(uid!, id),

    onMutate: async (id) => {
      const qKey = allApptKey(uid)
      await queryClient.cancelQueries({ queryKey: qKey })
      const previous = queryClient.getQueryData<Appointment[]>(qKey)
      queryClient.setQueryData<Appointment[]>(qKey, (old = []) => old.filter(a => a.id !== id))
      return { previous }
    },

    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(allApptKey(uid), context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: allApptKey(uid) })
    },
  })
}
