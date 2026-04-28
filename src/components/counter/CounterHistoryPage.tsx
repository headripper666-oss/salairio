import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Timer } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/store/authStore'
import { useCounterBalance } from '@/hooks/useCounterBalance'
import { getCounterMovements, addCounterMovement } from '@/services/firestore/counterMovements'
import { formatMinutes, formatDateShort, monthKeyToLabel, toMonthKey, parseHHMM, autoFormatHHMM } from '@/utils/formatters'
import type { CounterMovement, MovementType } from '@/types/firestore'

// ─── Labels et couleurs par type de mouvement ─────────────────────────────────
const MOVEMENT_META: Record<MovementType, { label: string; color: string; bg: string }> = {
  acquise_supp:       { label: 'Heures supp.',        color: '#6b8a5a', bg: 'rgba(107,138,90,0.12)' },
  acquise_jour_supp:  { label: 'Jour supplémentaire', color: '#6b8a5a', bg: 'rgba(107,138,90,0.12)' },
  recuperee:          { label: 'Récupération',         color: '#82b4a0', bg: 'rgba(130,180,160,0.12)' },
  payee:              { label: 'Heures payées',        color: '#d68a3c', bg: 'rgba(214,138,60,0.10)' },
  ajustement_manuel:  { label: 'Ajustement',           color: '#f1c987', bg: 'rgba(241,201,135,0.10)' },
}

function groupByMonth(movements: CounterMovement[]): { monthKey: string; items: CounterMovement[] }[] {
  const map = new Map<string, CounterMovement[]>()
  for (const m of movements) {
    const group = map.get(m.monthKey) ?? []
    group.push(m)
    map.set(m.monthKey, group)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, items]) => ({ monthKey, items }))
}

// ─── Page principale ──────────────────────────────────────────────────────────
export function CounterHistoryPage() {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const [dialogOpen, setDialogOpen] = useState(false)

  const { balanceMinutes, isLoading: balanceLoading } = useCounterBalance()

  const movementsQuery = useQuery({
    queryKey: ['counterMovements', uid],
    queryFn: () => getCounterMovements(uid!),
    enabled: !!uid,
    staleTime: 1000 * 30,
  })

  const groups = groupByMonth(movementsQuery.data ?? [])
  const balanceColor = balanceMinutes < 0 ? '#c87067' : balanceMinutes > 0 ? '#6b8a5a' : '#8e8775'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Compteur" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 6rem' }}>

        {/* Solde total */}
        <div style={{
          margin: '0.75rem 0 1.25rem',
          padding: '1.25rem',
          borderRadius: 14,
          background: 'var(--paper-2)',
          border: '1px solid var(--rule)',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(214,138,60,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Timer size={22} color="#d68a3c" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>
              Solde total
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '2rem', fontWeight: 700,
              color: balanceLoading ? 'var(--ink-3)' : balanceColor,
              letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              {balanceLoading ? '…' : formatMinutes(balanceMinutes, { sign: balanceMinutes > 0, compact: true })}
            </div>
          </div>
        </div>

        {/* Liste des mouvements groupés */}
        {movementsQuery.isLoading && (
          <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '3rem 0', fontSize: '0.85rem' }}>
            Chargement…
          </div>
        )}

        {!movementsQuery.isLoading && groups.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '3rem 0' }}>
            <Timer size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.9rem' }}>Aucun mouvement pour l'instant</p>
            <p style={{ fontSize: '0.75rem', marginTop: 4 }}>Saisir des jours dans le calendrier pour voir les mouvements ici</p>
          </div>
        )}

        {groups.map(({ monthKey, items }) => (
          <div key={monthKey} style={{ marginBottom: '1.25rem' }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--ink-3)', marginBottom: '0.5rem', paddingLeft: 2,
            }}>
              {monthKeyToLabel(monthKey)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {items.map(m => <MovementRow key={m.id} movement={m} />)}
            </div>
          </div>
        ))}
      </div>

      {/* FAB ajustement manuel */}
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        style={{
          position: 'fixed',
          bottom: 'calc(4.5rem + env(safe-area-inset-bottom))',
          right: '1.25rem',
          width: 52, height: 52,
          borderRadius: '50%',
          background: '#d68a3c',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(214,138,60,0.35)',
          zIndex: 10,
          transition: 'background 0.15s',
        }}
        aria-label="Ajustement manuel"
      >
        <Plus size={22} color="#1C1917" strokeWidth={2.5} />
      </button>

      <ManualAdjustmentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}

// ─── Ligne d'un mouvement ─────────────────────────────────────────────────────
function MovementRow({ movement: m }: { movement: CounterMovement }) {
  const meta = MOVEMENT_META[m.type]
  const isCredit = m.quantityMinutes > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.7rem 0.875rem',
        borderRadius: 12,
        background: 'var(--paper-2)',
        border: '1px solid var(--rule)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: meta.color, background: meta.bg,
            padding: '2px 6px', borderRadius: 4,
          }}>
            {meta.label}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--ink-3)' }}>
            {formatDateShort(m.date)}
          </span>
        </div>
        {m.note && (
          <p style={{ fontSize: '0.72rem', color: 'var(--ink-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {m.note}
          </p>
        )}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.9rem', fontWeight: 700,
        color: isCredit ? '#6b8a5a' : '#c87067',
        flexShrink: 0,
      }}>
        {formatMinutes(m.quantityMinutes, { sign: isCredit, compact: true })}
      </div>
    </motion.div>
  )
}

// ─── Dialog ajustement manuel ─────────────────────────────────────────────────
interface ManualAdjustmentDialogProps {
  open: boolean
  onClose: () => void
}

function ManualAdjustmentDialog({ open, onClose }: ManualAdjustmentDialogProps) {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const queryClient = useQueryClient()

  const [sign, setSign] = useState<'+' | '-'>('+')
  const [timeInput, setTimeInput] = useState('')
  const [note, setNote] = useState('')
  const [timeError, setTimeError] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (!uid) throw new Error('Non authentifié')
      const parsed = parseHHMM(timeInput)
      if (!parsed || parsed === 0) throw new Error('Durée invalide')

      const today = new Date()
      const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const monthKey = toMonthKey(today.getFullYear(), today.getMonth() + 1)
      const quantityMinutes = sign === '+' ? parsed : -parsed

      await addCounterMovement(uid, {
        date,
        monthKey,
        type: 'ajustement_manuel',
        quantityMinutes,
        valuationEuros: 0,
        note: note.trim(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counterMovements', uid] })
      handleClose()
    },
  })

  function handleClose() {
    setSign('+')
    setTimeInput('')
    setNote('')
    setTimeError('')
    onClose()
  }

  function handleSave() {
    const parsed = parseHHMM(timeInput)
    if (!parsed || parsed === 0) {
      setTimeError('Format invalide — ex: 1:30 ou 2h15')
      return
    }
    if (!note.trim()) {
      setTimeError('')
      return
    }
    setTimeError('')
    mutation.mutate()
  }

  const noteInvalid = !note.trim()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 2rem)',
              maxWidth: 400,
              borderRadius: 16,
              background: 'var(--paper-2)',
              border: '1px solid var(--rule)',
              zIndex: 51,
              padding: '1.25rem',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Ajustement manuel
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginTop: 2 }}>
                  Correction du compteur (motif obligatoire)
                </div>
              </div>
              <button
                type="button" onClick={handleClose}
                style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Signe + durée */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '0.5rem',
              }}>
                Durée
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* Toggle +/- */}
                <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  {(['+', '-'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSign(s)}
                      style={{
                        width: 40, height: 40,
                        background: sign === s
                          ? (s === '+' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)')
                          : 'transparent',
                        border: 'none', cursor: 'pointer',
                        color: sign === s
                          ? (s === '+' ? '#34D399' : '#c87067')
                          : '#8e8775',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '1.1rem', fontWeight: 700,
                        transition: 'all 0.15s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Input HH:MM */}
                <input
                  type="text"
                  placeholder="1:30"
                  value={timeInput}
                  onChange={e => { setTimeInput(autoFormatHHMM(e.target.value)); setTimeError('') }}
                  style={{
                    flex: 1,
                    background: 'var(--paper-3)',
                    border: `1px solid ${timeError ? '#c87067' : 'var(--border-default)'}`,
                    borderRadius: 10, padding: '0 0.75rem',
                    height: 40,
                    color: 'var(--ink)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>
              {timeError && (
                <p style={{ fontSize: '0.68rem', color: '#c87067', marginTop: 4 }}>{timeError}</p>
              )}
            </div>

            {/* Motif */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '0.5rem',
              }}>
                Motif <span style={{ color: '#c87067' }}>*</span>
              </div>
              <textarea
                placeholder="Ex : Correction saisie du 15 mars…"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--paper-3)',
                  border: `1px solid ${noteInvalid && mutation.isError ? '#c87067' : 'var(--border-default)'}`,
                  borderRadius: 10, padding: '0.6rem 0.75rem',
                  color: 'var(--ink)', fontSize: '0.85rem',
                  resize: 'none', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {mutation.isError && (
              <p style={{ fontSize: '0.72rem', color: '#c87067', marginBottom: '0.75rem' }}>
                Une erreur est survenue. Réessaie.
              </p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={handleClose} className="btn-ghost" style={{ flex: 1 }}>
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={mutation.isPending || !note.trim()}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
