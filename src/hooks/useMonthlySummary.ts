import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useSettings } from '@/hooks/useSettings'
import { getMonthlySummary, upsertMonthlySummary } from '@/services/firestore/monthlySummaries'
import { getMonthCalendarDays } from '@/services/firestore/calendarDays'
import { useSalaryEngine } from '@/hooks/useSalaryEngine'
import { computeWorkedDays } from '@/engine/calendar'
import type { MonthlySummary } from '@/types/firestore'

export function useMonthlySummary(monthKey: string) {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const queryClient = useQueryClient()
  const qKey = ['monthlySummary', uid, monthKey]
  const { settings } = useSettings()

  const query = useQuery({
    queryKey: qKey,
    queryFn: () => getMonthlySummary(uid!, monthKey),
    enabled: !!uid,
  })

  const { result } = useSalaryEngine(monthKey)

  const saveMutation = useMutation({
    mutationFn: async (opts?: { realGrossTotal?: number; realNetAfterTax?: number }) => {
      if (!uid || !result || !settings) throw new Error('Données manquantes')
      const days = await getMonthCalendarDays(uid, monthKey)
      const workedDays = computeWorkedDays(days, settings)
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
        computedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as MonthlySummary['updatedAt'],
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
