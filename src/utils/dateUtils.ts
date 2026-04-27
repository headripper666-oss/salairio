// ─── Conversion date → parties ────────────────────────────────────────────────
export function parseDateStr(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month, day }
}

export function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

export function todayStr(): string {
  const d = new Date()
  return toDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export function toMonthKey(year: number, month: number): string {
  return `${year}-${month.toString().padStart(2, '0')}`
}

// ─── Jour de la semaine (0 = dimanche, 1 = lundi, ...) ───────────────────────
export function getDayOfWeek(date: string): number {
  const { year, month, day } = parseDateStr(date)
  return new Date(year, month - 1, day).getDay()
}

export function isWeekend(date: string): boolean {
  const dow = getDayOfWeek(date)
  return dow === 0 || dow === 6
}

export function isDimanche(date: string): boolean {
  return getDayOfWeek(date) === 0
}

// ─── Nombre de jours dans un mois ─────────────────────────────────────────────
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// ─── Premier jour du mois (0 = dimanche, 1 = lundi, ...) ─────────────────────
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

// ─── Toutes les dates d'un mois ───────────────────────────────────────────────
export function getMonthDates(year: number, month: number): string[] {
  const count = getDaysInMonth(year, month)
  return Array.from({ length: count }, (_, i) => toDateStr(year, month, i + 1))
}

// ─── Vérifier si une date est dans le mois courant ───────────────────────────
export function isCurrentMonth(date: string): boolean {
  const now = new Date()
  const { year, month } = parseDateStr(date)
  return year === now.getFullYear() && month === now.getMonth() + 1
}

export function isToday(date: string): boolean {
  return date === todayStr()
}

// ─── Comparer deux monthKey ───────────────────────────────────────────────────
export function compareMonthKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function monthKeyFromDate(date: string): string {
  return date.substring(0, 7)
}
