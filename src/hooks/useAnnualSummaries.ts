import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getMonthlySummariesForYear } from '@/services/firestore/monthlySummaries'
import type { MonthlySummary } from '@/types/firestore'

export function useAnnualSummaries(year: number): {
  summaries: Map<string, MonthlySummary>
  isLoading: boolean
} {
  const uid = useAuthStore(s => s.user?.uid) ?? null

  const query = useQuery({
    queryKey: ['annualSummaries', uid, year],
    queryFn: () => getMonthlySummariesForYear(uid!, year),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  })

  return {
    summaries: query.data ?? new Map(),
    isLoading: query.isLoading,
  }
}
