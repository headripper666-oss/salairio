import { create } from 'zustand'

interface CounterState {
  balanceMinutes: number
  valuationEuros: number
  setBalance: (minutes: number, euros: number) => void
  addMinutes: (minutes: number, euros: number) => void
}

export const useCounterStore = create<CounterState>((set) => ({
  balanceMinutes: 0,
  valuationEuros: 0,
  setBalance: (minutes, euros) => set({ balanceMinutes: minutes, valuationEuros: euros }),
  addMinutes: (minutes, euros) =>
    set((state) => ({
      balanceMinutes: state.balanceMinutes + minutes,
      valuationEuros: state.valuationEuros + euros,
    })),
}))
