import { describe, it, expect } from 'vitest'
import {
  computeEasterSunday,
  getPublicHolidays,
  getPublicHolidaySet,
  isPublicHoliday,
} from './calendar'
import type { HolidayOverride } from '@/types/firestore'

describe('computeEasterSunday', () => {
  it('Pâques 2026 = 5 avril', () => {
    const easter = computeEasterSunday(2026)
    expect(easter.getFullYear()).toBe(2026)
    expect(easter.getMonth()).toBe(3) // 0-indexed → avril
    expect(easter.getDate()).toBe(5)
  })

  it('Pâques 2025 = 20 avril', () => {
    const easter = computeEasterSunday(2025)
    expect(easter.getMonth()).toBe(3)
    expect(easter.getDate()).toBe(20)
  })
})

describe('getPublicHolidays', () => {
  it('inclut le 1er janvier 2026', () => {
    const holidays = getPublicHolidays(2026)
    expect(holidays.some(h => h.date === '2026-01-01')).toBe(true)
  })

  it('inclut le 1er Mai 2026', () => {
    const holidays = getPublicHolidays(2026)
    expect(holidays.some(h => h.date === '2026-05-01')).toBe(true)
  })

  it('inclut le lundi de Pâques 2026 (6 avril)', () => {
    const holidays = getPublicHolidays(2026)
    expect(holidays.some(h => h.date === '2026-04-06')).toBe(true)
  })

  it('retourne 11 jours fériés pour 2026', () => {
    const holidays = getPublicHolidays(2026)
    expect(holidays.length).toBe(11)
  })
})

describe('getPublicHolidaySet', () => {
  it('override remove supprime une date du set', () => {
    const overrides: HolidayOverride[] = [
      { id: '1', date: '2026-01-01', action: 'remove', label: 'Supprimé', year: 2026 },
    ]
    const set = getPublicHolidaySet(2026, overrides)
    expect(set.has('2026-01-01')).toBe(false)
  })

  it('override add ajoute une date personnalisée', () => {
    const overrides: HolidayOverride[] = [
      { id: '2', date: '2026-06-15', action: 'add', label: 'Congé local', year: 2026 },
    ]
    const set = getPublicHolidaySet(2026, overrides)
    expect(set.has('2026-06-15')).toBe(true)
  })

  it('ignore les overrides d\'une autre année', () => {
    const overrides: HolidayOverride[] = [
      { id: '3', date: '2025-01-01', action: 'remove', label: 'Autre année', year: 2025 },
    ]
    const set = getPublicHolidaySet(2026, overrides)
    expect(set.has('2026-01-01')).toBe(true)
  })
})

describe('isPublicHoliday', () => {
  it('lundi de Pâques 2026 est férié', () => {
    expect(isPublicHoliday('2026-04-06', [])).toBe(true)
  })

  it('1er mai 2026 est férié', () => {
    expect(isPublicHoliday('2026-05-01', [])).toBe(true)
  })

  it('un lundi ordinaire n\'est pas férié', () => {
    expect(isPublicHoliday('2026-04-13', [])).toBe(false)
  })
})
