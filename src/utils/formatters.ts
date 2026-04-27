// ─── Formatage des montants ────────────────────────────────────────────────────
export function formatEuros(amount: number, opts?: { decimals?: number; sign?: boolean }): string {
  const { decimals = 2, sign = false } = opts ?? {}
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(amount))

  if (sign && amount > 0) return `+${formatted}`
  if (amount < 0) return `−${formatted}`
  return formatted
}

export function formatEurosCompact(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }
  return formatEuros(amount)
}

// ─── Formatage des durées ─────────────────────────────────────────────────────
export function formatMinutes(minutes: number, opts?: { sign?: boolean; compact?: boolean }): string {
  const { sign = false, compact = false } = opts ?? {}
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60

  let str: string
  if (compact) {
    str = m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`
  } else {
    str = m === 0 ? `${h}h` : `${h}h ${m}min`
  }

  if (sign && minutes > 0) return `+${str}`
  if (minutes < 0) return `−${str}`
  return str
}

// Auto-insère ":" après les 2 premiers chiffres (saisie clavier numérique uniquement)
export function autoFormatHHMM(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

export function parseHHMM(value: string): number | null {
  const match = value.match(/^(\d{1,2})[h:.](\d{0,2})$/)
  if (!match) return null
  const h = parseInt(match[1], 10)
  const m = parseInt(match[2] || '0', 10)
  if (h > 23 || m > 59) return null
  return h * 60 + m
}

export function minutesToHHMM(minutes: number): string {
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

// ─── Formatage des pourcentages ───────────────────────────────────────────────
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace('.', ',')} %`
}

// ─── Formatage des dates ──────────────────────────────────────────────────────
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

const MONTHS_FR_SHORT = [
  'Jan.', 'Fév.', 'Mar.', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sep.', 'Oct.', 'Nov.', 'Déc.',
]

export function monthKeyToLabel(monthKey: string, short = false): string {
  const [year, month] = monthKey.split('-').map(Number)
  const list = short ? MONTHS_FR_SHORT : MONTHS_FR
  return `${list[month - 1]} ${year}`
}

export function formatDateFR(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  const d = new Date(year, month - 1, day)
  return `${days[d.getDay()]} ${day} ${MONTHS_FR[month - 1]} ${year}`
}

export function formatDateShort(date: string): string {
  const [, month, day] = date.split('-').map(Number)
  return `${day} ${MONTHS_FR_SHORT[month - 1]}`
}

export function toMonthKey(year: number, month: number): string {
  return `${year}-${month.toString().padStart(2, '0')}`
}
