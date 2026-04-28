import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  isDark: boolean
  selectedYear: number
  selectedMonth: number  // 1-12

  toggleDark: () => void
  setSelectedMonth: (year: number, month: number) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  goToCurrentMonth: () => void
}

const now = new Date()

function applyTheme(isDark: boolean) {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isDark: false,
      selectedYear: now.getFullYear(),
      selectedMonth: now.getMonth() + 1,

      toggleDark: () => {
        const next = !get().isDark
        set({ isDark: next })
        applyTheme(next)
      },

      setSelectedMonth: (year, month) => set({ selectedYear: year, selectedMonth: month }),

      goToPrevMonth: () => {
        const { selectedYear, selectedMonth } = get()
        if (selectedMonth === 1) {
          set({ selectedYear: selectedYear - 1, selectedMonth: 12 })
        } else {
          set({ selectedMonth: selectedMonth - 1 })
        }
      },

      goToNextMonth: () => {
        const { selectedYear, selectedMonth } = get()
        if (selectedMonth === 12) {
          set({ selectedYear: selectedYear + 1, selectedMonth: 1 })
        } else {
          set({ selectedMonth: selectedMonth + 1 })
        }
      },

      goToCurrentMonth: () => {
        const n = new Date()
        set({ selectedYear: n.getFullYear(), selectedMonth: n.getMonth() + 1 })
      },
    }),
    {
      name: 'salairio-ui',
      partialize: (state) => ({
        isDark: state.isDark,
        selectedYear: state.selectedYear,
        selectedMonth: state.selectedMonth,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.isDark)
      },
    }
  )
)
