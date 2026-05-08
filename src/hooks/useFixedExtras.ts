import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import {
  getFixedExtras,
  addFixedExtra,
  updateFixedExtra,
  addPeriodToFixedExtra,
  deletePeriodFromFixedExtra,
  deleteFixedExtra,
} from '@/services/firestore/fixedExtras'
import type { FixedExtra, FixedExtraPeriod } from '@/types/firestore'

export function useFixedExtras() {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const queryClient = useQueryClient()
  const qKey = ['fixedExtras', uid]

  const query = useQuery({
    queryKey: qKey,
    queryFn: () => getFixedExtras(uid!),
    enabled: !!uid,
  })

  const addMutation = useMutation({
    mutationFn: (extra: Omit<FixedExtra, 'id' | 'createdAt'>) => addFixedExtra(uid!, extra),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qKey }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<FixedExtra, 'id' | 'createdAt'>> }) =>
      updateFixedExtra(uid!, id, updates),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qKey }),
  })

  const addPeriodMutation = useMutation({
    mutationFn: ({ id, period, currentPeriods }: { id: string; period: FixedExtraPeriod; currentPeriods: FixedExtraPeriod[] }) =>
      addPeriodToFixedExtra(uid!, id, period, currentPeriods),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qKey }),
  })

  const deletePeriodMutation = useMutation({
    mutationFn: ({ id, appliesFromMonth, currentPeriods }: { id: string; appliesFromMonth: string; currentPeriods: FixedExtraPeriod[] }) =>
      deletePeriodFromFixedExtra(uid!, id, appliesFromMonth, currentPeriods),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qKey }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFixedExtra(uid!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qKey }),
  })

  return {
    fixedExtras: query.data ?? [],
    isLoading: query.isLoading,
    addExtra: addMutation.mutate,
    updateExtra: (id: string, updates: Partial<Omit<FixedExtra, 'id' | 'createdAt'>>) =>
      updateMutation.mutate({ id, updates }),
    addPeriod: (id: string, period: FixedExtraPeriod, currentPeriods: FixedExtraPeriod[]) =>
      addPeriodMutation.mutate({ id, period, currentPeriods }),
    deletePeriod: (id: string, appliesFromMonth: string, currentPeriods: FixedExtraPeriod[]) =>
      deletePeriodMutation.mutate({ id, appliesFromMonth, currentPeriods }),
    deleteExtra: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
