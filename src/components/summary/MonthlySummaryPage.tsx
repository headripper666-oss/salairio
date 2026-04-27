import { useState } from 'react'
import { ChevronLeft, ChevronRight, Save, Clock } from 'lucide-react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { SalaryBreakdownCard } from '@/components/summary/SalaryBreakdownCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useSalaryEngine } from '@/hooks/useSalaryEngine'
import { useMonthlySummary } from '@/hooks/useMonthlySummary'

function monthKeyNow(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function fmtMin(min: number): string {
  const h = Math.floor(Math.abs(min) / 60)
  const m = Math.abs(min) % 60
  const sign = min < 0 ? '−' : '+'
  return `${sign}${h}h${m.toString().padStart(2, '0')}`
}

export function MonthlySummaryPage() {
  const [monthKey, setMonthKey] = useState(monthKeyNow)

  const { result, isLoading } = useSalaryEngine(monthKey)
  const { saveSummary, isSaving } = useMonthlySummary(monthKey)

  const displayDate = parseISO(`${monthKey}-01`)

  function prev() {
    setMonthKey(k => {
      const d = subMonths(parseISO(`${k}-01`), 1)
      return format(d, 'yyyy-MM')
    })
  }

  function next() {
    setMonthKey(k => {
      const d = addMonths(parseISO(`${k}-01`), 1)
      return format(d, 'yyyy-MM')
    })
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Synthèse" />

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4 pt-4">
        {/* Sélecteur de mois */}
        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-zinc-100 capitalize">
            {format(displayDate, 'MMMM yyyy', { locale: fr })}
          </span>
          <button
            onClick={next}
            className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Contenu */}
        {isLoading && <CardSkeleton />}

        {!isLoading && result && (
          <>
            <SalaryBreakdownCard result={result} />

            {/* Compteur du mois */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-400" />
                <span className="font-semibold text-zinc-100">Compteur du mois</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Crédit</p>
                  <p className="font-mono text-emerald-400 font-semibold">
                    {fmtMin(result.counterCreditMinutes)}
                  </p>
                </div>
                <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Débit</p>
                  <p className="font-mono text-red-400 font-semibold">
                    {fmtMin(-result.counterDebitMinutes)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton sauvegarder */}
            <button
              onClick={() => saveSummary()}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-semibold transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Sauvegarde…' : 'Sauvegarder l\'estimation'}
            </button>
          </>
        )}

        {!isLoading && !result && (
          <div className="text-center text-zinc-500 py-12">
            <p>Aucune donnée disponible.</p>
            <p className="text-sm mt-1">Configure tes réglages pour voir l'estimation.</p>
          </div>
        )}
      </div>
    </div>
  )
}
