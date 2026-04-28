import { useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Gift, Repeat } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PageHeader } from '@/components/layout/PageHeader'
import { useFixedExtras } from '@/hooks/useFixedExtras'
import { useOneOffBonuses } from '@/hooks/useOneOffBonuses'
import type { ExtraValueMode } from '@/types/firestore'

const S = {
  card:      { background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 14 } as React.CSSProperties,
  input:     { width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '0.55rem 0.75rem', fontSize: '0.9rem', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' } as React.CSSProperties,
  label:     { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-3)', display: 'block', marginBottom: 4 } as React.CSSProperties,
  dialog:    { width: '100%', maxWidth: 360, background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 20, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' } as React.CSSProperties,
  btnCancel: { flex: 1, padding: '0.6rem', borderRadius: 10, border: '1px solid var(--rule)', background: 'transparent', color: 'var(--ink-2)', fontSize: '0.88rem', cursor: 'pointer' } as React.CSSProperties,
  btnAdd:    { flex: 1, padding: '0.6rem', borderRadius: 10, border: 'none', background: 'var(--amber)', color: '#1d1a17', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
}

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem', paddingBottom: 'calc(var(--nav-height-mobile) + env(safe-area-inset-bottom, 0px) + 1rem)' }}>
      <div style={S.dialog}>
        <h3 style={{ fontWeight: 700, color: 'var(--ink)', margin: 0, fontSize: '1rem' }}>Nouvelle prime fixe</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={S.label}>Libellé</label>
            <input style={S.input} placeholder="Prime d'ancienneté" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Type</label>
            <select style={{ ...S.input, appearance: 'none' } as React.CSSProperties} value={mode} onChange={e => setMode(e.target.value as ExtraValueMode)}>
              <option value="fixed_euros">Montant fixe (€)</option>
              <option value="percent_gross">% du brut de base</option>
            </select>
          </div>
          <div>
            <label style={S.label}>{mode === 'fixed_euros' ? 'Montant (€)' : 'Pourcentage'}</label>
            <input type="number" min="0" step="0.01" style={S.input} placeholder={mode === 'fixed_euros' ? '150.00' : '5'} value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Applicable à partir de</label>
            <input type="month" style={S.input} value={fromMonth} onChange={e => setFromMonth(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={S.btnCancel}>Annuler</button>
          <button onClick={submit} style={S.btnAdd}>Ajouter</button>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem', paddingBottom: 'calc(var(--nav-height-mobile) + env(safe-area-inset-bottom, 0px) + 1rem)' }}>
      <div style={S.dialog}>
        <h3 style={{ fontWeight: 700, color: 'var(--ink)', margin: 0, fontSize: '1rem' }}>Nouvelle prime ponctuelle</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={S.label}>Libellé</label>
            <input style={S.input} placeholder="Prime de fin d'année" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Mois</label>
            <input type="month" style={S.input} value={month} onChange={e => setMonth(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Montant (€)</label>
            <input type="number" min="0" step="0.01" style={S.input} placeholder="500.00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Note (optionnel)</label>
            <input style={S.input} placeholder="Détails…" value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={S.btnCancel}>Annuler</button>
          <button onClick={submit} style={S.btnAdd}>Ajouter</button>
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Primes" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', paddingBottom: 'calc(var(--nav-height-mobile) + env(safe-area-inset-bottom, 0px) + 1rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Primes fixes ──────────────────────────────── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Repeat size={16} color="#d68a3c" />
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Primes fixes</span>
            </div>
            <button
              onClick={() => setShowFixedDialog(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#d68a3c', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}
            >
              <Plus size={15} /> Ajouter
            </button>
          </div>

          {fixedExtras.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)', margin: 0, padding: '0.5rem 0' }}>Aucune prime fixe configurée.</p>
          )}

          {fixedExtras.map(e => (
            <div key={e.id} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.label}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--ink-3)', margin: 0 }}>
                  {fmtExtra(e)}{e.appliesFromMonth && ` · depuis ${e.appliesFromMonth}`}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                <button
                  onClick={() => updateExtra(e.id, { isActive: !e.isActive })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: e.isActive ? '#d68a3c' : '#5a5448', display: 'flex', padding: 2 }}
                  title={e.isActive ? 'Désactiver' : 'Activer'}
                >
                  {e.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                <button
                  onClick={() => deleteExtra(e.id)}
                  className="delete-btn"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ── Primes ponctuelles ────────────────────────── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gift size={16} color="#d68a3c" />
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Primes ponctuelles</span>
            </div>
            <button
              onClick={() => setShowOneOffDialog(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#d68a3c', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}
            >
              <Plus size={15} /> Ajouter
            </button>
          </div>

          {bonuses.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)', margin: 0, padding: '0.5rem 0' }}>Aucune prime ponctuelle enregistrée.</p>
          )}

          {bonuses.map(b => (
            <div key={b.id} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--ink-3)', margin: 0 }}>
                  {b.amountEuros.toFixed(2)} € · {format(parseISO(`${b.monthKey}-01`), 'MMMM yyyy', { locale: fr })}
                  {b.note && ` · ${b.note}`}
                </p>
              </div>
              <button
                onClick={() => deleteBonus(b.id)}
                className="delete-btn"
                style={{ marginLeft: 12 }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </section>
      </div>

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
