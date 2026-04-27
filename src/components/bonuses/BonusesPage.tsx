import { useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Gift, Repeat } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PageHeader } from '@/components/layout/PageHeader'
import { useFixedExtras } from '@/hooks/useFixedExtras'
import { useOneOffBonuses } from '@/hooks/useOneOffBonuses'
import type { ExtraValueMode } from '@/types/firestore'

function monthKeyNow(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// ─── Dialog ajout prime fixe ─────────────────────────────────────────────────
interface AddFixedDialogProps {
  onClose: () => void
  onAdd: (data: { label: string; valueMode: ExtraValueMode; amount: number; appliesFromMonth: string }) => void
}

function AddFixedDialog({ onClose, onAdd }: AddFixedDialogProps) {
  const [label, setLabel] = useState('')
  const [mode, setMode] = useState<ExtraValueMode>('fixed_euros')
  const [amount, setAmount] = useState('')
  const [fromMonth, setFromMonth] = useState(monthKeyNow())

  function submit() {
    if (!label.trim() || !amount) return
    onAdd({ label: label.trim(), valueMode: mode, amount: parseFloat(amount), appliesFromMonth: fromMonth })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-zinc-100">Nouvelle prime fixe</h3>

        <div className="space-y-3">
          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            placeholder="Libellé (ex: Prime d'ancienneté)"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />

          <select
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            value={mode}
            onChange={e => setMode(e.target.value as ExtraValueMode)}
          >
            <option value="fixed_euros">Montant fixe (€)</option>
            <option value="percent_gross">% du brut de base</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            placeholder={mode === 'fixed_euros' ? 'Montant en €' : 'Pourcentage (ex: 5)'}
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Applicable à partir de</label>
            <input
              type="month"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              value={fromMonth}
              onChange={e => setFromMonth(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Dialog ajout prime ponctuelle ───────────────────────────────────────────
interface AddOneOffDialogProps {
  onClose: () => void
  onAdd: (data: { label: string; monthKey: string; amountEuros: number; note: string }) => void
}

function AddOneOffDialog({ onClose, onAdd }: AddOneOffDialogProps) {
  const [label, setLabel] = useState('')
  const [month, setMonth] = useState(monthKeyNow())
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  function submit() {
    if (!label.trim() || !amount) return
    onAdd({ label: label.trim(), monthKey: month, amountEuros: parseFloat(amount), note })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-zinc-100">Nouvelle prime ponctuelle</h3>

        <div className="space-y-3">
          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            placeholder="Libellé (ex: Prime de fin d'année)"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />

          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Mois</label>
            <input
              type="month"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              value={month}
              onChange={e => setMonth(e.target.value)}
            />
          </div>

          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            placeholder="Montant en €"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            placeholder="Note (optionnel)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export function BonusesPage() {
  const [showFixedDialog, setShowFixedDialog] = useState(false)
  const [showOneOffDialog, setShowOneOffDialog] = useState(false)

  const { fixedExtras, addExtra, updateExtra, deleteExtra } = useFixedExtras()
  const { bonuses, addBonus, deleteBonus } = useOneOffBonuses()

  function fmtExtra(e: { valueMode: ExtraValueMode; amount: number }) {
    if (e.valueMode === 'fixed_euros') return `${e.amount.toFixed(2)} €`
    return `${e.amount} % du brut`
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Primes" />

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-6 pt-4">

        {/* ── Primes fixes ────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat size={16} className="text-amber-400" />
              <span className="font-semibold text-zinc-100">Primes fixes</span>
            </div>
            <button
              onClick={() => setShowFixedDialog(true)}
              className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>

          {fixedExtras.length === 0 && (
            <p className="text-sm text-zinc-500 py-2">Aucune prime fixe configurée.</p>
          )}

          {fixedExtras.map(e => (
            <div
              key={e.id}
              className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-100 truncate">{e.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {fmtExtra(e)}
                  {e.appliesFromMonth && ` · depuis ${e.appliesFromMonth}`}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={() => updateExtra(e.id, { isActive: !e.isActive })}
                  className="text-zinc-400 hover:text-amber-400 transition-colors"
                  title={e.isActive ? 'Désactiver' : 'Activer'}
                >
                  {e.isActive
                    ? <ToggleRight size={22} className="text-amber-400" />
                    : <ToggleLeft size={22} />
                  }
                </button>
                <button
                  onClick={() => deleteExtra(e.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ── Primes ponctuelles ──────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-amber-400" />
              <span className="font-semibold text-zinc-100">Primes ponctuelles</span>
            </div>
            <button
              onClick={() => setShowOneOffDialog(true)}
              className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>

          {bonuses.length === 0 && (
            <p className="text-sm text-zinc-500 py-2">Aucune prime ponctuelle enregistrée.</p>
          )}

          {bonuses.map(b => (
            <div
              key={b.id}
              className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-100 truncate">{b.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {b.amountEuros.toFixed(2)} € ·{' '}
                  {format(parseISO(`${b.monthKey}-01`), 'MMMM yyyy', { locale: fr })}
                  {b.note && ` · ${b.note}`}
                </p>
              </div>
              <button
                onClick={() => deleteBonus(b.id)}
                className="text-zinc-600 hover:text-red-400 transition-colors ml-3"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </section>
      </div>

      {/* Dialogs */}
      {showFixedDialog && (
        <AddFixedDialog
          onClose={() => setShowFixedDialog(false)}
          onAdd={data => addExtra({ ...data, isActive: true, order: fixedExtras.length })}
        />
      )}
      {showOneOffDialog && (
        <AddOneOffDialog
          onClose={() => setShowOneOffDialog(false)}
          onAdd={data => addBonus(data)}
        />
      )}
    </div>
  )
}
