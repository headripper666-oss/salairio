import type { Timestamp } from 'firebase/firestore'

// ─── Statuts d'un jour calendrier ─────────────────────────────────────────────
export type DayStatus =
  | 'vide'
  | 'matin'
  | 'apres_midi'
  | 'jour_supp'
  | 'conge_paye'
  | 'conge_sans_solde'
  | 'recuperation'
  | 'absence'

// ─── Types de mouvements du compteur ──────────────────────────────────────────
export type MovementType =
  | 'acquise_supp'
  | 'acquise_jour_supp'
  | 'recuperee'
  | 'payee'
  | 'ajustement_manuel'

// ─── Clés de majorations ──────────────────────────────────────────────────────
export type MajorationKey =
  | 'heure_supp_25'
  | 'heure_supp_50'
  | 'dimanche'
  | 'ferie'
  | 'premier_mai'
  | 'jour_supp'

export type MajorationMode = 'cumul' | 'priorite'

export type ExtraValueMode = 'fixed_euros' | 'percent_gross'

export type HolidayOverrideAction = 'add' | 'remove'

// ─── Définition d'un poste (matin / après-midi) ───────────────────────────────
export interface ShiftDefinition {
  key: string
  label: string
  startTime: string        // "06:00"
  endTime: string          // "14:00"
  breakMinutes: number     // durée de pause (minutes)
  durationMinutes: number  // durée effective = (fin - début) - pause
}

// ─── Règle de majoration ──────────────────────────────────────────────────────
export interface MajorationRule {
  key: MajorationKey
  label: string
  ratePercent: number
  enabled: boolean
}

// ─── Rappels pilule : heure par poste + jour off ──────────────────────────────
export interface PillReminderTimes {
  [shiftKey: string]: string  // "20:00" par clé de poste (matin, apres_midi…)
  offDay: string              // heure si jour non travaillé
}

// ─── users/{uid}/settings/main ────────────────────────────────────────────────
export interface UserSettings {
  hourlyRateGross: number          // taux horaire brut direct (€/h)
  grossMonthlySalary: number       // salaire brut mensuel fixe (pour affichage)
  monthlyBaseHours: number         // 151.67
  cssRatePercent: number           // taux cotisations salariales (~22)
  mutuelleEmployee: number         // part salariale mutuelle (€/mois)
  mealPriceEuros?: number          // prix d'un repas retenu sur salaire (€)
  shifts: ShiftDefinition[]        // [matin, apres_midi, ...]
  majorationRules: MajorationRule[]
  majorationMode: MajorationMode
  firstName?: string
  counterInitialMinutes: number
  defaultView: 'home' | 'summary' | 'counter'
  pillReminderEnabled?: boolean    // activer rappels pilule
  pillReminderTimes?: PillReminderTimes
  apptReminderRules?: { minutesBefore: number }[]  // règles de rappel RDV (ex: [{1440}, {60}])
  anciennetePct?: number          // majoration ancienneté (% du salaire de référence du poste)
  ancienneteBaseSalaire?: number  // salaire de référence du poste pour calcul ancienneté (€/mois)
  gotifyToken?: string            // token Gotify personnel pour les notifications push
  updatedAt: Timestamp
}

// ─── users/{uid}/calendarDays/{yyyy-mm-dd} ────────────────────────────────────
export interface CalendarDay {
  date: string              // "2026-04-15"
  status: DayStatus
  overtimeMinutes: number   // 0 si pas de supp
  extraHoursMinutes: number // durée heures supp pour jour_supp (défaut 420 = 7h)
  breakMinutes: number      // pause à soustraire pour jour_supp (défaut 20)
  isFerie: boolean
  note: string
  shiftKey?: string
  mealCount?: number        // 0 | 1 | 2 repas pris au boulot ce jour
  updatedAt: Timestamp
}

// ─── users/{uid}/counterMovements/{movementId} ────────────────────────────────
export interface CounterMovement {
  id: string
  date: string              // "2026-04-15"
  monthKey: string          // "2026-04"
  type: MovementType
  quantityMinutes: number   // positif = crédit, négatif = débit
  valuationEuros: number
  sourceDocId?: string
  note: string
  createdAt: Timestamp
}

// ─── users/{uid}/monthlySummaries/{yyyy-mm} ───────────────────────────────────
export interface WorkedDays {
  matin: number
  apres_midi: number
  jour_supp: number
  total: number
}

export interface MonthlySummary {
  monthKey: string
  grossBase: number
  fixedExtrasTotal: number
  oneOffBonusesTotal: number
  overtimePaidMinutes: number
  overtimePaidEuros: number
  grossTotal: number
  cssEmployee: number
  mutuelleEmployee: number
  netImposable: number
  pasRate: number
  pasAmount: number
  netAfterTax: number
  // Valeurs réelles saisies manuellement (remplacent les estimations dans les agrégats)
  realGrossTotal?: number
  realNetAfterTax?: number
  // Jours travaillés comptés depuis le calendrier
  workedDays?: WorkedDays
  counterCreditMinutes: number
  counterDebitMinutes: number
  counterBalanceEndOfMonth: number
  isEstimate: boolean
  computedAt: Timestamp
  updatedAt: Timestamp
}

// ─── users/{uid}/yearlySummaries/{yyyy} ───────────────────────────────────────
export interface YearlySummary {
  year: number
  months: Record<string, {
    grossTotal: number
    netAfterTax: number
    counterBalance: number
    counterCreditMinutes: number
    counterDebitMinutes: number
    oneOffBonusesTotal: number
    overtimePaidMinutes: number
  }>
  annualGross: number
  annualNetAfterTax: number
  updatedAt: Timestamp
}

// ─── users/{uid}/fixedExtras/{id} ─────────────────────────────────────────────
export interface FixedExtra {
  id: string
  label: string
  valueMode: ExtraValueMode
  amount: number
  isActive: boolean
  appliesFromMonth?: string  // "2026-01"
  order: number
  createdAt: Timestamp
}

// ─── users/{uid}/oneOffBonuses/{id} ───────────────────────────────────────────
export interface OneOffBonus {
  id: string
  monthKey: string           // "2026-04"
  label: string
  amountEuros: number
  note: string
  createdAt: Timestamp
}

// ─── users/{uid}/taxRates/{id} ────────────────────────────────────────────────
export interface TaxRate {
  id: string
  ratePercent: number        // 9.0 (pas 0.09)
  effectiveFrom: string      // "2026-01"
  note: string
  createdAt: Timestamp
}

// ─── users/{uid}/holidayOverrides/{id} ────────────────────────────────────────
export interface HolidayOverride {
  id: string
  date: string               // "2026-05-08"
  action: HolidayOverrideAction
  label: string
  year: number
}

// ─── users/{uid}/appointments/{id} ────────────────────────────────────────────
export interface Appointment {
  id: string
  date: string               // "2026-04-15"
  title: string
  time: string               // "14:30"
  reminderMinutes?: number   // 0 = pas de rappel, 15, 30, 60, 1440…
  note?: string
  createdAt: Timestamp
}
