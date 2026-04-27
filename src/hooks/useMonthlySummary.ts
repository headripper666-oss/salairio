import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getMonthlySummary, upsertMonthlySummary } from '@/services/firestore/monthlySummaries'
import { useSalaryEngine } from '@/hooks/useSalaryEngine'
import type { MonthlySummary } from '@/types/firestore'

export function useMonthlySummary(monthKey: string) {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const queryClient = useQueryClient()
  const qKey = ['monthlySummary', uid, monthKey]

  const query = useQuery({
    queryKey: qKey,
    queryFn: () => getMonthlySummary(uid!, monthKey),
    enabled: !!uid,
  })

  const { result } = useSalaryEngine(monthKey)

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!uid || !result) throw new Error('Données manquantes')
      const summary: Omit<MonthlySummary, 'updatedAt'> = {
        monthKey,
        grossBase: result.grossBase,
        fixedExtrasTotal: result.fixedExtrasTotal,
        oneOffBonusesTotal: result.oneOffBonusesTotal,
        overtimePaidMinutes: result.overtimePaidMinutes,
        overtimePaidEuros: result.overtimePaidEuros,
        grossTotal: result.grossTotal,
        cssEmployee: result.cssEmployee,
        mutuelleEmployee: result.mutuelleEmployee,
        netImposable: result.netImposable,
        pasRate: result.pasRate,
        pasAmount: result.pasAmount,
        netAfterTax: result.netAfterTax,
        counterCreditMinutes: result.counterCreditMinutes,
        counterDebitMinutes: result.counterDebitMinutes,
        counterBalanceEndOfMonth: 0,
        isEstimate: true,
        computedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
      }
      await upsertMonthlySummary(uid, monthKey, summary)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qKey })
      const year = parseInt(monthKey.split('-')[0], 10)
      queryClient.invalidateQueries({ queryKey: ['annualSummaries', uid, year] })
    },
  })

  return {
    savedSummary: query.data,
    isSummaryLoading: query.isLoading,
    saveSummary: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  }
}
