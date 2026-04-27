import type { DayStatus, MajorationKey } from './firestore'

// ─── Résultat du calcul salaire mensuel ───────────────────────────────────────
export interface SalaryBreakdown {
  monthKey: string
  // Entrées brutes
  grossBase: number
  fixedExtrasTotal: number
  oneOffBonusesTotal: number
  overtimePaidMinutes: number
  overtimePaidEuros: number
  // Brut
  grossTotal: number
  // Retenues
  cssEmployee: number
  mutuelleEmployee: number
  // Net imposable
  netImposable: number
  // Impôt
  pasRate: number
  pasAmount: number
  // Net
  netAfterTax: number
  // Meta
  isEstimate: boolean
}

// ─── État courant du compteur d'heures ────────────────────────────────────────
export interface CounterState {
  balanceMinutes: number
  valuationEuros: number
}

// ─── Entrée pour le calcul du moteur salaire ──────────────────────────────────
export interface SalaryEngineInput {
  monthKey: string
  hourlyRateGross: number
  grossMonthlySalary: number
  cssRatePercent: number
  mutuelleEmployee: number
  fixedExtras: Array<{
    label: string
    valueMode: 'fixed_euros' | 'percent_gross'
    amount: number
    isActive: boolean
    appliesFromMonth?: string
  }>
  oneOffBonuses: Array<{ amountEuros: number; monthKey: string }>
  counterPaidMinutes: number
  pasRate: number
}

// ─── Valorisation d'une heure avec détail des majorations ─────────────────────
export interface OvertimeValuation {
  baseRatePerHour: number
  coefficient: number
  applicableMajorations: MajorationKey[]
  totalEuros: number
}

// ─── Résumé d'un mois pour le tableau annuel ──────────────────────────────────
export interface MonthRowSummary {
  monthKey: string
  monthLabel: string
  grossTotal: number
  netAfterTax: number
  counterCreditMinutes: number
  counterDebitMinutes: number
  counterBalanceEnd: number
  overtimePaidMinutes: number
  oneOffBonusesTotal: number
}

// ─── Item de calendrier enrichi (CalendarDay + état calculé) ──────────────────
export interface CalendarDayEnriched {
  date: string
  status: DayStatus
  overtimeMinutes: number
  isFerie: boolean
  isWeekend: boolean
  isDimanche: boolean
  note: string
  overtimeValuation?: number
}

// ─── Navigation mois ──────────────────────────────────────────────────────────
export interface MonthNavigation {
  year: number
  month: number  // 1-12
  label: string  // "Avril 2026"
  monthKey: string  // "2026-04"
}
