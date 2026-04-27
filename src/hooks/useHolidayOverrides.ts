import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import {
  getHolidayOverrides,
  addHolidayOverride,
  deleteHolidayOverride,
} from '@/services/firestore/holidayOverrides'
import { queryClient } from '@/lib/queryClient'
import type { HolidayOverride } from '@/types/firestore'

export function useHolidayOverrides(year: number) {
  const uid = useAuthStore(s => s.user?.uid) ?? null

  const query = useQuery({
    queryKey: ['holidayOverrides', uid, year],
    queryFn: () => {
      if (!uid) throw new Error('Non authentifié')
      return getHolidayOverrides(uid, year)
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 10,
  })

  const addMutation = useMutation({
    mutationFn: (override: Omit<HolidayOverride, 'id'>) => {
      if (!uid) throw new Error('Non authentifié')
      return addHolidayOverride(uid, override)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['holidayOverrides', uid, year] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!uid) throw new Error('Non authentifié')
      return deleteHolidayOverride(uid, id)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['holidayOverrides', uid, year] }),
  })

  return {
    overrides:     query.data ?? [],
    isLoading:     query.isLoading,
    addOverride:   addMutation.mutate,
    deleteOverride: deleteMutation.mutate,
    isAdding:      addMutation.isPending,
  }
}
