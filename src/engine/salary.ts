import type { UserSettings, FixedExtra, OneOffBonus, CounterMovement, HourlyRatePeriod, CalendarDay } from '@/types/firestore'
import { getDaysInMonth } from '@/utils/dateUtils'
import { computeWorkedDays } from '@/engine/calendar'

export interface GrossBasePeriod {
  label: string
  rateEurosPerHour: number
  days: number
  totalDaysInMonth: number
  amount: number
}

export interface SalaryInput {
  settings: UserSettings
  fixedExtras: FixedExtra[]
  oneOffBonuses: OneOffBonus[]
  counterMovements: CounterMovement[]
  pasRate: number
  monthKey: string
  mealCostTotal?: number  // retenue repas du mois (€)
  mealCount?: number      // nombre total de repas du mois
  hourlyRatePeriods?: HourlyRatePeriod[]
  calendarDays?: CalendarDay[]
}

export interface SalaryResult {
  grossBase: number
  grossBasePeriods: GrossBasePeriod[]
  isProrated: boolean
  prorataRatio: number
  workedBaseHours: number
  ancienneteEuros: number
  fixedExtrasTotal: number
  oneOffBonusesTotal: number
  overtimePaidMinutes: number
  overtimePaidEuros: number
  grossTotal: number
  cssEmployee: number
  mutuelleEmployee: number
  mealCostTotal: number
  mealCount: number
  netImposable: number
  pasRate: number
  pasAmount: number
  netAfterTax: number
  counterCreditMinutes: number
  counterDebitMinutes: number
}

function computeGrossBase(
  monthKey: string,
  monthlyBaseHours: number,
  hourlyRateGross: number,
  periods?: HourlyRatePeriod[],
): { grossBase: number; grossBasePeriods: GrossBasePeriod[]; isProrated: boolean; prorataRatio: number } {
  const [yearStr, monthStr] = monthKey.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)
  const totalDays = getDaysInMonth(year, month)
  const monthStart = `${monthKey}-01`
  const monthEnd = `${monthKey}-${String(totalDays).padStart(2, '0')}`

  const fallback = (): ReturnType<typeof computeGrossBase> => {
    const amount = hourlyRateGross * monthlyBaseHours
    return {
      grossBase: amount,
      grossBasePeriods: [{ label: 'Salaire de base', rateEurosPerHour: hourlyRateGross, days: totalDays, totalDaysInMonth: totalDays, amount }],
      isProrated: false,
      prorataRatio: 1,
    }
  }

  if (!periods || periods.length === 0) return fallback()

  const active = periods.filter(p => {
    const pEnd = p.endDate ?? '9999-12-31'
    return p.startDate <= monthEnd && pEnd >= monthStart
  })

  if (active.length === 0) return fallback()

  const grossBasePeriods: GrossBasePeriod[] = active.map(p => {
    const from = p.startDate > monthStart ? p.startDate : monthStart
    const to = (p.endDate && p.endDate < monthEnd) ? p.endDate : monthEnd
    const fromDay = parseInt(from.split('-')[2], 10)
    const toDay = parseInt(to.split('-')[2], 10)
    const days = Math.max(0, toDay - fromDay + 1)
    const amount = (days / totalDays) * monthlyBaseHours * p.rateEurosPerHour
    return { label: p.label, rateEurosPerHour: p.rateEurosPerHour, days, totalDaysInMonth: totalDays, amount }
  })

  const grossBase = grossBasePeriods.reduce((sum, r) => sum + r.amount, 0)
  const coveredDays = grossBasePeriods.reduce((sum, r) => sum + r.days, 0)
  const isProrated = active.length > 1 || coveredDays < totalDays
  // Prorata en heures : heures effectivement payées / heures d'un mois normal
  const fullMonthGross = monthlyBaseHours * (active[0]?.rateEurosPerHour ?? hourlyRateGross)
  const prorataRatio = fullMonthGross > 0 ? grossBase / fullMonthGross : 1

  return { grossBase, grossBasePeriods, isProrated, prorataRatio }
}

export function computeMonthlySalary(input: SalaryInput): SalaryResult {
  const { settings, fixedExtras, oneOffBonuses, counterMovements, pasRate, monthKey } = input
  const mealCostTotal = input.mealCostTotal ?? 0
  const mealCount = input.mealCount ?? 0

  const workedDays = computeWorkedDays(input.calendarDays ?? [], settings)
  const overtimeFromDays = (input.calendarDays ?? []).reduce((sum, d) => sum + (d.overtimeMinutes ?? 0), 0)
  const baseMinutes = workedDays.totalMinutes - overtimeFromDays
  const workedBaseHours = baseMinutes > 0
    ? baseMinutes / 60
    : settings.monthlyBaseHours

  const calendarFilled = baseMinutes > 0
  const { grossBase: grossBaseFromPeriod, grossBasePeriods: grossBasePeriodsFromPeriod, isProrated, prorataRatio: prorataRatioFromPeriod } = computeGrossBase(
    monthKey, settings.monthlyBaseHours, settings.hourlyRateGross, input.hourlyRatePeriods
  )

  // Si le calendrier est rempli et le mois est partiel : brut = heures réelles × taux
  // Sinon : brut calculé par les périodes RH (jours)
  const activeRate = grossBasePeriodsFromPeriod[0]?.rateEurosPerHour ?? settings.hourlyRateGross
  const grossBase = (calendarFilled && isProrated) ? workedBaseHours * activeRate : grossBaseFromPeriod
  const prorataRatio = settings.monthlyBaseHours > 0 ? workedBaseHours / settings.monthlyBaseHours : prorataRatioFromPeriod
  // Met à jour le montant affiché dans grossBasePeriods pour refléter le brut heures réel
  const grossBasePeriods = (calendarFilled && isProrated)
    ? grossBasePeriodsFromPeriod.map((p, i) => i === 0 ? { ...p, amount: grossBase } : p)
    : grossBasePeriodsFromPeriod
  const ancienneteBase = settings.ancienneteBaseSalaire ?? grossBase
  const ancienneteEuros = ancienneteBase * ((settings.anciennetePct ?? 0) / 100)

  const fixedExtrasTotal = fixedExtras
    .filter(e => e.isActive)
    .reduce((acc, e) => {
      const activePeriod = [...e.periods]
        .filter(p => p.appliesFromMonth <= monthKey)
        .sort((a, b) => b.appliesFromMonth.localeCompare(a.appliesFromMonth))[0]
      if (!activePeriod) return acc
      const raw = e.valueMode === 'fixed_euros' ? activePeriod.amount : (activePeriod.amount / 100) * grossBase
      return acc + (isProrated ? raw * prorataRatio : raw)
    }, 0)

  const oneOffBonusesTotal = oneOffBonuses
    .filter(b => b.monthKey === monthKey)
    .reduce((acc, b) => acc + b.amountEuros, 0)

  const paidMovements = counterMovements.filter(m => m.type === 'payee')
  const overtimePaidMinutes = paidMovements.reduce((acc, m) => acc + Math.abs(m.quantityMinutes), 0)
  const overtimePaidEuros = paidMovements.reduce((acc, m) => acc + Math.abs(m.valuationEuros), 0)

  const grossTotal = grossBase + ancienneteEuros + fixedExtrasTotal + oneOffBonusesTotal + overtimePaidEuros

  const cssEmployee = grossTotal * (settings.cssRatePercent / 100)
  const mutuelleEmployee = settings.mutuelleEmployee
  const netImposable = grossTotal - cssEmployee - mutuelleEmployee - mealCostTotal

  const pasAmount = netImposable * (pasRate / 100)
  const netAfterTax = netImposable - pasAmount

  const counterCreditMinutes = counterMovements
    .filter(m => m.quantityMinutes > 0)
    .reduce((acc, m) => acc + m.quantityMinutes, 0)

  const counterDebitMinutes = counterMovements
    .filter(m => m.quantityMinutes < 0)
    .reduce((acc, m) => acc + Math.abs(m.quantityMinutes), 0)

  return {
    grossBase,
    grossBasePeriods,
    isProrated,
    prorataRatio,
    workedBaseHours,
    ancienneteEuros,
    fixedExtrasTotal,
    oneOffBonusesTotal,
    overtimePaidMinutes,
    overtimePaidEuros,
    grossTotal,
    cssEmployee,
    mutuelleEmployee,
    mealCostTotal,
    mealCount,
    netImposable,
    pasRate,
    pasAmount,
    netAfterTax,
    counterCreditMinutes,
    counterDebitMinutes,
  }
}
