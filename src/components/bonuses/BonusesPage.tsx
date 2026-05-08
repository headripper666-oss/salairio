import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Gift, Repeat, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PageHeader } from '@/components/layout/PageHeader'
import { useFixedExtras } from '@/hooks/useFixedExtras'
import { useOneOffBonuses } from '@/hooks/useOneOffBonuses'
import { getMotivationalMessage } from '@/utils/motivationalMessages'
import { useUIStore } from '@/store/uiStore'
import type { ExtraValueMode, FixedExtra, FixedExtraPeriod } from '@/types/firestore'

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

function fmtAmount(e: { valueMode: ExtraValueMode }, amount: number) {
  if (e.valueMode === 'fixed_euros') return `${amount.toFixed(2)} €`
  return `${amount} % du brut`
}

function fmtMonth(monthKey: string) {
  try { return format(parseISO(`${monthKey}-01`), 'MMM yyyy', { locale: fr }) }
  catch { return monthKey }
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
            <input style={S.input} placeholder="Segur I" value={label} onChange={e => setLabel(e.target.value)} />
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
            <input type="number" min="0" step="0.01" style={S.input} placeholder={mode === 'fixed_euros' ? '206.00' : '5'} value={amount} onChange={e => setAmount(e.target.value)} />
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

// ─── Dialog modification montant (nouvelle période) ───────────────────────────
interface AddPeriodDialogProps {
  extra: FixedExtra
  onClose: () => void
  onAdd: (period: FixedExtraPeriod) => void
}

function AddPeriodDialog({ extra, onClose, onAdd }: AddPeriodDialogProps) {
  const [amount, setAmount] = useState('')
  const [fromMonth, setFromMonth] = useState(monthKeyNow())

  function submit() {
    if (!amount) return
    onAdd({ amount: parseFloat(amount), appliesFromMonth: fromMonth })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem', paddingBottom: 'calc(var(--nav-height-mobile) + env(safe-area-inset-bottom, 0px) + 1rem)' }}>
      <div style={S.dialog}>
        <h3 style={{ fontWeight: 700, color: 'var(--ink)', margin: 0, fontSize: '1rem' }}>Modifier le montant</h3>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-3)' }}>{extra.label} — les mois précédents ne seront pas affectés.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={S.label}>Nouveau montant {extra.valueMode === 'fixed_euros' ? '(€)' : '(%)'}</label>
            <input type="number" min="0" step="0.01" style={S.input} placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
          </div>
          <div>
            <label style={S.label}>À partir de</label>
            <input type="month" style={S.input} value={fromMonth} onChange={e => setFromMonth(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={S.btnCancel}>Annuler</button>
          <button onClick={submit} style={S.btnAdd}>Enregistrer</button>
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

// ─── Carte prime fixe avec historique périodes ────────────────────────────────
interface FixedExtraCardProps {
  extra: FixedExtra
  onToggle: () => void
  onDelete: () => void
  onAddPeriod: (period: FixedExtraPeriod) => void
  onDeletePeriod: (appliesFromMonth: string) => void
}

function FixedExtraCard({ extra, onToggle, onDelete, onAddPeriod, onDeletePeriod }: FixedExtraCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showPeriodDialog, setShowPeriodDialog] = useState(false)

  const sortedPeriods = [...extra.periods].sort((a, b) => b.appliesFromMonth.localeCompare(a.appliesFromMonth))
  const currentPeriod = sortedPeriods[0]

  return (
    <>
      <div style={{ ...S.card, overflow: 'hidden' }}>
        {/* Ligne principale */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.875rem 1rem', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {extra.label}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--ink-3)', margin: 0 }}>
              {currentPeriod ? fmtAmount(extra, currentPeriod.amount) : '—'}
              {currentPeriod && ` · depuis ${fmtMonth(currentPeriod.appliesFromMonth)}`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setShowPeriodDialog(true)}
              title="Modifier le montant"
              style={{ background: 'none', border: '1px solid var(--rule)', borderRadius: 6, cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', padding: '4px 6px', alignItems: 'center', gap: 3, fontSize: '0.72rem' }}
            >
              <Pencil size={11} /> Modifier
            </button>
            <button
              onClick={onToggle}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: extra.isActive ? '#d68a3c' : '#5a5448', display: 'flex', padding: 2 }}
              title={extra.isActive ? 'Désactiver' : 'Activer'}
            >
              {extra.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
            <button onClick={onDelete} className="delete-btn">
              <Trash2 size={14} />
            </button>
            {extra.periods.length > 1 && (
              <button
                onClick={() => setExpanded(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', padding: 2 }}
                title={expanded ? 'Masquer l\'historique' : 'Voir l\'historique'}
              >
                {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            )}
          </div>
        </div>

        {/* Historique des périodes */}
        {expanded && extra.periods.length > 1 && (
          <div style={{ borderTop: '1px solid var(--rule)', padding: '0.5rem 1rem 0.75rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-4)', margin: '0 0 6px' }}>Historique</p>
            {sortedPeriods.map((p, i) => (
              <div key={p.appliesFromMonth} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ fontSize: '0.78rem', color: i === 0 ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {fmtMonth(p.appliesFromMonth)} — {fmtAmount(extra, p.amount)}
                  {i === 0 && <span style={{ fontSize: '0.65rem', color: 'var(--amber)', marginLeft: 6 }}>actuel</span>}
                </span>
                {i > 0 && (
                  <button
                    onClick={() => onDeletePeriod(p.appliesFromMonth)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', display: 'flex', padding: 2 }}
                    title="Supprimer cette période"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showPeriodDialog && (
        <AddPeriodDialog
          extra={extra}
          onClose={() => setShowPeriodDialog(false)}
          onAdd={onAddPeriod}
        />
      )}
    </>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export function BonusesPage() {
  const [showFixedDialog, setShowFixedDialog] = useState(false)
  const [showOneOffDialog, setShowOneOffDialog] = useState(false)
  const { isDark } = useUIStore()

  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 900)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const { fixedExtras, addExtra, updateExtra, addPeriod, deletePeriod, deleteExtra } = useFixedExtras()
  const { bonuses, addBonus, deleteBonus } = useOneOffBonuses()
  const motivMsg = getMotivationalMessage('general', 4)

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
            <FixedExtraCard
              key={e.id}
              extra={e}
              onToggle={() => updateExtra(e.id, { isActive: !e.isActive })}
              onDelete={() => deleteExtra(e.id)}
              onAddPeriod={period => addPeriod(e.id, period, e.periods)}
              onDeletePeriod={month => deletePeriod(e.id, month, e.periods)}
            />
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
              <button onClick={() => deleteBonus(b.id)} className="delete-btn" style={{ marginLeft: 12 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </section>

        {/* Encart motivant — PC uniquement */}
        {isDesktop && (
          <div style={{
            borderRadius: 'var(--radius)',
            background: isDark
              ? 'linear-gradient(145deg, #2a1f0e 0%, #1e1608 100%)'
              : 'linear-gradient(145deg, #f5ddb0 0%, #edd090 100%)',
            border: `1px solid ${isDark ? 'rgba(214,138,60,0.22)' : 'rgba(180,110,20,0.18)'}`,
            padding: '0.875rem 1rem',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0, marginTop: 2 }}>💼</span>
            <div>
              <div style={{
                fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 600,
                fontSize: '0.9rem', lineHeight: 1.2,
                color: isDark ? '#f0c070' : '#7a4a0a', marginBottom: '0.3rem',
              }}>
                « {motivMsg.title} »
              </div>
              <div style={{ fontSize: '0.68rem', lineHeight: 1.5, color: isDark ? 'rgba(240,192,112,0.75)' : 'rgba(100,60,10,0.75)' }}>
                {motivMsg.body}
              </div>
            </div>
          </div>
        )}
      </div>

      {showFixedDialog && (
        <AddFixedDialog
          onClose={() => setShowFixedDialog(false)}
          onAdd={data => addExtra({
            label: data.label,
            valueMode: data.valueMode,
            periods: [{ amount: data.amount, appliesFromMonth: data.appliesFromMonth }],
            isActive: true,
            order: fixedExtras.length,
          })}
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
