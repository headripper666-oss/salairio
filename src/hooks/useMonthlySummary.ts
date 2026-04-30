import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getMonthlySummary, upsertMonthlySummary } from '@/services/firestore/monthlySummaries'
import { getMonthCalendarDays } from '@/services/firestore/calendarDays'
import { useSalaryEngine } from '@/hooks/useSalaryEngine'
import type { MonthlySummary, WorkedDays } from '@/types/firestore'

async function countWorkedDays(uid: string, monthKey: string): Promise<WorkedDays> {
  const days = await getMonthCalendarDays(uid, monthKey)
  const counts = { matin: 0, apres_midi: 0, jour_supp: 0, total: 0 }
  for (const d of days) {
    if (d.status === 'matin')      { counts.matin++;      counts.total++ }
    if (d.status === 'apres_midi') { counts.apres_midi++; counts.total++ }
    if (d.status === 'jour_supp')  { counts.jour_supp++;  counts.total++ }
  }
  return counts
}

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
    mutationFn: async (opts?: { realGrossTotal?: number; realNetAfterTax?: number }) => {
      if (!uid || !result) throw new Error('Données manquantes')
      const workedDays = await countWorkedDays(uid, monthKey)
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
        ...(opts?.realGrossTotal != null && { realGrossTotal: opts.realGrossTotal }),
        ...(opts?.realNetAfterTax != null && { realNetAfterTax: opts.realNetAfterTax }),
        workedDays,
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
    saveSummary: (opts?: { realGrossTotal?: number; realNetAfterTax?: number }) => saveMutation.mutate(opts),
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  }
}
