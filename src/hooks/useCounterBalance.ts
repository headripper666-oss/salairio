import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useSettings } from '@/hooks/useSettings'
import { getCounterMovements } from '@/services/firestore/counterMovements'
import { computeCounterBalance } from '@/engine/counter'

export function useCounterBalance(): { balanceMinutes: number; isLoading: boolean } {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const { settings, isLoading: settingsLoading } = useSettings()

  const movementsQuery = useQuery({
    queryKey: ['counterMovements', uid],
    queryFn: () => getCounterMovements(uid!),
    enabled: !!uid,
    staleTime: 1000 * 30,
  })

  const isLoading = settingsLoading || movementsQuery.isLoading

  if (isLoading || !settings) return { balanceMinutes: 0, isLoading }

  const balanceMinutes = computeCounterBalance(
    movementsQuery.data ?? [],
    settings.counterInitialMinutes,
  )

  return { balanceMinutes, isLoading: false }
}
