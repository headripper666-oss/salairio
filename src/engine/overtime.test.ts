import { describe, it, expect } from 'vitest'
import { computeOvertimeValuation, getShiftDurationMinutes } from './overtime'
import type { UserSettings } from '@/types/firestore'
import { makeDefaultSettings } from './constants'

function makeSettings(hourlyRateGross: number): UserSettings {
  return {
    ...makeDefaultSettings(),
    hourlyRateGross,
    grossMonthlySalary: hourlyRateGross * 151.67,
  }
}

describe('getShiftDurationMinutes', () => {
  it('retourne la durée du shift matin (454 min)', () => {
    const s = makeSettings(10)
    expect(getShiftDurationMinutes(s, 'matin')).toBe(454)
  })

  it('retourne la durée du shift apres_midi (454 min)', () => {
    const s = makeSettings(10)
    expect(getShiftDurationMinutes(s, 'apres_midi')).toBe(454)
  })

  it('retourne le premier shift par défaut si shiftKey absent', () => {
    const s = makeSettings(10)
    expect(getShiftDurationMinutes(s)).toBe(454)
  })

  it('retourne 454 si shiftKey inconnu', () => {
    const s = makeSettings(10)
    expect(getShiftDurationMinutes(s, 'inexistant')).toBe(454)
  })
})

describe('computeOvertimeValuation', () => {
  it('jour normal (supp 25%) : 60 min @ 10€/h → 12.50€', () => {
    const s = makeSettings(10)
    // 2026-04-07 = mardi ordinaire
    const result = computeOvertimeValuation(60, '2026-04-07', false, s)
    expect(result).toBeCloseTo(12.5)
  })

  it('dimanche (25%) : 60 min @ 10€/h → 12.50€', () => {
    const s = makeSettings(10)
    // 2026-04-12 = dimanche
    const result = computeOvertimeValuation(60, '2026-04-12', false, s)
    expect(result).toBeCloseTo(12.5)
  })

  it('jour férié ordinaire (100%) : 60 min @ 10€/h → 20.00€', () => {
    const s = makeSettings(10)
    // 2026-04-06 = lundi de Pâques (isFerie=true, pas dimanche)
    const result = computeOvertimeValuation(60, '2026-04-06', true, s)
    expect(result).toBeCloseTo(20)
  })

  it('1er Mai (100%, prioritaire) : 60 min @ 10€/h → 20.00€', () => {
    const s = makeSettings(10)
    const result = computeOvertimeValuation(60, '2026-05-01', true, s)
    expect(result).toBeCloseTo(20)
  })

  it('0 minute → 0€ quel que soit le type', () => {
    const s = makeSettings(10)
    expect(computeOvertimeValuation(0, '2026-04-07', false, s)).toBe(0)
  })
})
