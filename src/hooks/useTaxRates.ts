import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getTaxRates, addTaxRate, deleteTaxRate } from '@/services/firestore/taxRates'
import { queryClient } from '@/lib/queryClient'
import type { TaxRate } from '@/types/firestore'

export function useTaxRates() {
  const uid = useAuthStore(s => s.user?.uid) ?? null

  const query = useQuery({
    queryKey: ['taxRates', uid],
    queryFn: () => {
      if (!uid) throw new Error('Non authentifié')
      return getTaxRates(uid)
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  })

  const addMutation = useMutation({
    mutationFn: (rate: Omit<TaxRate, 'id' | 'createdAt'>) => {
      if (!uid) throw new Error('Non authentifié')
      return addTaxRate(uid, rate)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taxRates', uid] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!uid) throw new Error('Non authentifié')
      return deleteTaxRate(uid, id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taxRates', uid] }),
  })

  return {
    taxRates:   query.data ?? [],
    isLoading:  query.isLoading,
    addRate:    addMutation.mutate,
    deleteRate: deleteMutation.mutate,
    isAdding:   addMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
