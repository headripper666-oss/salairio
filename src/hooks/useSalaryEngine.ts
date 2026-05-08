import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useSettings } from '@/hooks/useSettings'
import { useFixedExtras } from '@/hooks/useFixedExtras'
import { useOneOffBonuses } from '@/hooks/useOneOffBonuses'
import { useTaxRates } from '@/hooks/useTaxRates'
import { useHourlyRatePeriods } from '@/hooks/useHourlyRatePeriods'
import { getCounterMovements } from '@/services/firestore/counterMovements'
import { getMonthCalendarDays } from '@/services/firestore/calendarDays'
import { computeMonthlySalary } from '@/engine/salary'
import { getMonthMovements } from '@/engine/counter'
import type { SalaryResult } from '@/engine/salary'
import type { FixedExtra } from '@/types/firestore'

export interface FixedExtraDetail {
  label: string
  amount: number
}

function getActivePasRate(taxRates: { ratePercent: number; effectiveFrom: string }[], monthKey: string): number {
  const applicable = taxRates
    .filter(r => r.effectiveFrom <= monthKey)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
  return applicable[0]?.ratePercent ?? 0
}

function computeFixedExtrasDetail(
  fixedExtras: FixedExtra[],
  monthKey: string,
  grossBase: number,
  isProrated: boolean,
  prorataRatio: number,
): FixedExtraDetail[] {
  return fixedExtras
    .filter(e => e.isActive)
    .flatMap(e => {
      const activePeriod = [...e.periods]
        .filter(p => p.appliesFromMonth <= monthKey)
        .sort((a, b) => b.appliesFromMonth.localeCompare(a.appliesFromMonth))[0]
      if (!activePeriod) return []
      const raw = e.valueMode === 'fixed_euros' ? activePeriod.amount : (activePeriod.amount / 100) * grossBase
      const amount = isProrated ? raw * prorataRatio : raw
      return [{ label: e.label, amount }]
    })
}

export function useSalaryEngine(monthKey: string): { result: SalaryResult | null; isLoading: boolean; fixedExtrasDetail: FixedExtraDetail[] } {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const { settings, isLoading: settingsLoading } = useSettings()
  const { fixedExtras, isLoading: extrasLoading } = useFixedExtras()
  const { bonuses, isLoading: bonusesLoading } = useOneOffBonuses(monthKey)
  const { taxRates, isLoading: ratesLoading } = useTaxRates()
  const { periods: hourlyRatePeriods, isLoading: periodsLoading } = useHourlyRatePeriods()

  const movementsQuery = useQuery({
    queryKey: ['counterMovements', uid],
    queryFn: () => getCounterMovements(uid!),
    enabled: !!uid,
    staleTime: 1000 * 30,
  })

  const calendarDaysQuery = useQuery({
    queryKey: ['calendarMonth', uid, monthKey],
    queryFn: () => getMonthCalendarDays(uid!, monthKey),
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  })

  // Les repas pris en mois M sont prélevés sur le salaire de M+1
  const prevMonthKey = (() => {
    const [y, m] = monthKey.split('-').map(Number)
    return m === 1
      ? `${y - 1}-12`
      : `${y}-${String(m - 1).padStart(2, '0')}`
  })()

  const prevMonthDaysQuery = useQuery({
    queryKey: ['calendarMonth', uid, prevMonthKey],
    queryFn: () => getMonthCalendarDays(uid!, prevMonthKey),
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  })

  const isLoading =
    settingsLoading || extrasLoading || bonusesLoading || ratesLoading ||
    movementsQuery.isLoading || calendarDaysQuery.isLoading || periodsLoading ||
    prevMonthDaysQuery.isLoading

  if (isLoading || !settings) return { result: null, isLoading, fixedExtrasDetail: [] }

  const monthMovements = getMonthMovements(movementsQuery.data ?? [], monthKey)
  const pasRate = getActivePasRate(taxRates, monthKey)

  const mealPrice = settings.mealPriceEuros ?? 0
  const mealCount = (prevMonthDaysQuery.data ?? []).reduce((acc, d) => acc + (d.mealCount ?? 0), 0)
  const mealCostTotal = mealCount * mealPrice

  const result = computeMonthlySalary({
    settings,
    fixedExtras,
    oneOffBonuses: bonuses,
    counterMovements: monthMovements,
    pasRate,
    monthKey,
    mealCostTotal,
    mealCount,
    hourlyRatePeriods,
    calendarDays: calendarDaysQuery.data ?? [],
  })

  const fixedExtrasDetail = computeFixedExtrasDetail(
    fixedExtras, monthKey, result.grossBase, result.isProrated, result.prorataRatio,
  )

  return { result, isLoading: false, fixedExtrasDetail }
}
