import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import {
  getHourlyRatePeriods,
  addHourlyRatePeriod,
  updateHourlyRatePeriod,
  deleteHourlyRatePeriod,
} from '@/services/firestore/hourlyRatePeriods'
import type { HourlyRatePeriod } from '@/types/firestore'

export function useHourlyRatePeriods() {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const queryClient = useQueryClient()
  const qKey = ['hourlyRatePeriods', uid]

  const query = useQuery({
    queryKey: qKey,
    queryFn: () => getHourlyRatePeriods(uid!),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  })

  const addMutation = useMutation({
    mutationFn: (period: Omit<HourlyRatePeriod, 'id' | 'createdAt'>) =>
      addHourlyRatePeriod(uid!, period),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qKey }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<HourlyRatePeriod, 'id' | 'createdAt'>> }) =>
      updateHourlyRatePeriod(uid!, id, updates),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qKey }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHourlyRatePeriod(uid!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qKey }),
  })

  return {
    periods: query.data ?? [],
    isLoading: query.isLoading,
    addPeriod: addMutation.mutate,
    updatePeriod: (id: string, updates: Partial<Omit<HourlyRatePeriod, 'id' | 'createdAt'>>) =>
      updateMutation.mutate({ id, updates }),
    deletePeriod: deleteMutation.mutate,
    isAdding: addMutation.isPending,
  }
}
