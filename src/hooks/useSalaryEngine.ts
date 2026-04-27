import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useSettings } from '@/hooks/useSettings'
import { useFixedExtras } from '@/hooks/useFixedExtras'
import { useOneOffBonuses } from '@/hooks/useOneOffBonuses'
import { useTaxRates } from '@/hooks/useTaxRates'
import { getCounterMovements } from '@/services/firestore/counterMovements'
import { computeMonthlySalary } from '@/engine/salary'
import { getMonthMovements } from '@/engine/counter'
import type { SalaryResult } from '@/engine/salary'

function getActivePasRate(taxRates: { ratePercent: number; effectiveFrom: string }[], monthKey: string): number {
  const applicable = taxRates
    .filter(r => r.effectiveFrom <= monthKey)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
  return applicable[0]?.ratePercent ?? 0
}

export function useSalaryEngine(monthKey: string): { result: SalaryResult | null; isLoading: boolean } {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const { settings, isLoading: settingsLoading } = useSettings()
  const { fixedExtras, isLoading: extrasLoading } = useFixedExtras()
  const { bonuses, isLoading: bonusesLoading } = useOneOffBonuses(monthKey)
  const { taxRates, isLoading: ratesLoading } = useTaxRates()

  const movementsQuery = useQuery({
    queryKey: ['counterMovements', uid],
    queryFn: () => getCounterMovements(uid!),
    enabled: !!uid,
    staleTime: 1000 * 30,
  })

  const isLoading =
    settingsLoading || extrasLoading || bonusesLoading || ratesLoading || movementsQuery.isLoading

  if (isLoading || !settings) return { result: null, isLoading }

  const monthMovements = getMonthMovements(movementsQuery.data ?? [], monthKey)
  const pasRate = getActivePasRate(taxRates, monthKey)

  const result = computeMonthlySalary({
    settings,
    fixedExtras,
    oneOffBonuses: bonuses,
    counterMovements: monthMovements,
    pasRate,
    monthKey,
  })

  return { result, isLoading: false }
}
