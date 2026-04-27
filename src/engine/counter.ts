import type { CounterMovement } from '@/types/firestore'

export function getMonthMovements(movements: CounterMovement[], monthKey: string): CounterMovement[] {
  return movements.filter(m => m.monthKey === monthKey)
}

export function computeCounterBalance(movements: CounterMovement[], initialMinutes: number): number {
  return movements.reduce((acc, m) => acc + m.quantityMinutes, initialMinutes)
}
