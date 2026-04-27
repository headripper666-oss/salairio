import type { HolidayOverride } from '@/types/firestore'

// ─── Algorithme de Butcher-Meeus (Pâques grégorien) ──────────────────────────
export function computeEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 1-indexed
  const day   = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function dateToStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Jours fériés fixes France métropolitaine ────────────────────────────────
const FIXED_HOLIDAYS: Array<{ month: number; day: number; label: string }> = [
  { month: 1,  day: 1,  label: "Jour de l'An"    },
  { month: 5,  day: 1,  label: "Fête du Travail"  },
  { month: 5,  day: 8,  label: "Victoire 1945"    },
  { month: 7,  day: 14, label: "Fête Nationale"   },
  { month: 8,  day: 15, label: "Assomption"       },
  { month: 11, day: 1,  label: "Toussaint"        },
  { month: 11, day: 11, label: "Armistice"        },
  { month: 12, day: 25, label: "Noël"             },
]

export interface HolidayDef {
  date: string
  label: string
  isMobile: boolean  // true = dépend de Pâques
}

// ─── Tous les jours fériés pour une année ────────────────────────────────────
export function getPublicHolidays(year: number): HolidayDef[] {
  const easter = computeEasterSunday(year)

  const mobile: HolidayDef[] = [
    { date: dateToStr(addDays(easter, 1)),  label: 'Lundi de Pâques',    isMobile: true },
    { date: dateToStr(addDays(easter, 39)), label: 'Ascension',           isMobile: true },
    { date: dateToStr(addDays(easter, 50)), label: 'Lundi de Pentecôte', isMobile: true },
  ]

  const fixed: HolidayDef[] = FIXED_HOLIDAYS.map(({ month, day, label }) => ({
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    label,
    isMobile: false,
  }))

  return [...fixed, ...mobile].sort((a, b) => a.date.localeCompare(b.date))
}

// ─── Ensemble des dates fériées (avec surcharges utilisateur) ─────────────────
export function getPublicHolidaySet(
  year: number,
  overrides: HolidayOverride[],
): Set<string> {
  const base = new Set(getPublicHolidays(year).map(h => h.date))
  for (const ov of overrides.filter(o => o.year === year)) {
    if (ov.action === 'remove') base.delete(ov.date)
    else                         base.add(ov.date)
  }
  return base
}

export function isPublicHoliday(date: string, overrides: HolidayOverride[]): boolean {
  const year = parseInt(date.substring(0, 4), 10)
  return getPublicHolidaySet(year, overrides).has(date)
}

// ─── Infos sur le jour Pâques d'une année ────────────────────────────────────
export function getEasterInfo(year: number): { date: string; label: string } {
  return { date: dateToStr(computeEasterSunday(year)), label: 'Pâques (dimanche)' }
}
