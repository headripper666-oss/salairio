import type { UserSettings, FixedExtra, OneOffBonus, CounterMovement } from '@/types/firestore'

export interface SalaryInput {
  settings: UserSettings
  fixedExtras: FixedExtra[]
  oneOffBonuses: OneOffBonus[]
  counterMovements: CounterMovement[]
  pasRate: number
  monthKey: string
  mealCostTotal?: number  // retenue repas du mois (€)
  mealCount?: number      // nombre total de repas du mois
}

export interface SalaryResult {
  grossBase: number
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

export function computeMonthlySalary(input: SalaryInput): SalaryResult {
  const { settings, fixedExtras, oneOffBonuses, counterMovements, pasRate, monthKey } = input
  const mealCostTotal = input.mealCostTotal ?? 0
  const mealCount = input.mealCount ?? 0

  const grossBase = settings.hourlyRateGross * settings.monthlyBaseHours
  const ancienneteEuros = grossBase * ((settings.anciennetePct ?? 0) / 100)

  const fixedExtrasTotal = fixedExtras
    .filter(e => e.isActive && (!e.appliesFromMonth || e.appliesFromMonth <= monthKey))
    .reduce((acc, e) => {
      if (e.valueMode === 'fixed_euros') return acc + e.amount
      return acc + (e.amount / 100) * grossBase
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
