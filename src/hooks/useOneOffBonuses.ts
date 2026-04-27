import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import {
  getOneOffBonuses,
  addOneOffBonus,
  deleteOneOffBonus,
} from '@/services/firestore/oneOffBonuses'
import type { OneOffBonus } from '@/types/firestore'

export function useOneOffBonuses(monthKey?: string) {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const queryClient = useQueryClient()
  const qKey = ['oneOffBonuses', uid, monthKey ?? 'all']

  const query = useQuery({
    queryKey: qKey,
    queryFn: () => getOneOffBonuses(uid!, monthKey),
    enabled: !!uid,
  })

  const addMutation = useMutation({
    mutationFn: (bonus: Omit<OneOffBonus, 'id' | 'createdAt'>) => addOneOffBonus(uid!, bonus),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['oneOffBonuses', uid] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOneOffBonus(uid!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['oneOffBonuses', uid] })
    },
  })

  return {
    bonuses: query.data ?? [],
    isLoading: query.isLoading,
    addBonus: addMutation.mutate,
    deleteBonus: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
