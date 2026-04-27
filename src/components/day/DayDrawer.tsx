import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star } from 'lucide-react'
import { StatusSelector } from './StatusSelector'
import { OvertimeInput } from './OvertimeInput'
import { DayNoteInput } from './DayNoteInput'
import { formatDateFR } from '@/utils/formatters'
import { useCalendarDay } from '@/hooks/useCalendarDay'
import { computeOvertimeValuation } from '@/engine/overtime'
import { useSettings } from '@/hooks/useSettings'
import type { CalendarDay, DayStatus } from '@/types/firestore'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isDesktop
}

function getShiftKey(
  status: DayStatus,
  existingShiftKey: string | undefined,
  firstShiftKey: string | undefined,
): string | undefined {
  if (status === 'matin') return 'matin'
  if (status === 'apres_midi') return 'apres_midi'
  if (status === 'jour_supp' || status === 'recuperation') {
    return existingShiftKey ?? firstShiftKey
  }
  return undefined
}

interface DayDrawerProps {
  date: string | null
  existingDay?: CalendarDay | null
  isFerie: boolean
  onClose: () => void
}

export function DayDrawer({ date, existingDay, isFerie, onClose }: DayDrawerProps) {
  const [status, setStatus] = useState<DayStatus>(existingDay?.status ?? 'vide')
  const [overtime, setOvertime] = useState(existingDay?.overtimeMinutes ?? 0)
  const [note, setNote] = useState(existingDay?.note ?? '')

  const { saveDay, isSaving } = useCalendarDay()
  const { settings } = useSettings()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    setStatus(existingDay?.status ?? 'vide')
    setOvertime(existingDay?.overtimeMinutes ?? 0)
    setNote(existingDay?.note ?? '')
  }, [date, existingDay])

  const showOvertime = status === 'matin' || status === 'apres_midi'

  const valuation =
    showOvertime && overtime > 0 && settings
      ? computeOvertimeValuation(overtime, date ?? '', isFerie, settings)
      : 0

  function handleSave() {
    if (!date) return
    saveDay(date, {
      status,
      overtimeMinutes: showOvertime ? overtime : 0,
      note,
      isFerie,
      shiftKey: getShiftKey(status, existingDay?.shiftKey, settings?.shifts[0]?.key),
    })
    onClose()
  }

  const sheetVariants = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit:    { opacity: 0, scale: 0.95 },
      }
    : {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit:    { y: '100%' },
      }

  const sheetStyle: React.CSSProperties = isDesktop
    ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 480,
        maxHeight: '85vh',
        borderRadius: 16,
        background: '#1b2238',
        border: '1px solid rgba(241,231,210,0.08)',
        overflowY: 'auto',
        zIndex: 51,
      }
    : {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '16px 16px 0 0',
        maxHeight: '90vh',
        background: '#1b2238',
        border: '1px solid rgba(241,231,210,0.08)',
        borderBottom: 'none',
        overflowY: 'auto',
        zIndex: 51,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }

  return (
    <AnimatePresence>
      {date !== null && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.70)',
            }}
          />

          <motion.div
            initial={sheetVariants.initial}
            animate={sheetVariants.animate}
            exit={sheetVariants.exit}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            style={sheetStyle}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle (mobile only) */}
            {!isDesktop && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(241,231,210,0.10)' }} />
              </div>
            )}

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              padding: isDesktop ? '1.25rem 1.25rem 0.875rem' : '0.75rem 1.25rem 0.875rem',
              borderBottom: '1px solid rgba(241,231,210,0.06)',
              gap: 8,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1e7d2', textTransform: 'capitalize' }}>
                  {date ? formatDateFR(date) : ''}
                </div>
                {isFerie && (
                  <div style={{
                    marginTop: 5,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: '#F59E0B', background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4, padding: '2px 7px',
                  }}>
                    <Star size={9} fill="currentColor" />
                    Jour férié
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none', border: 'none',
                  color: '#8e8775', cursor: 'pointer',
                  padding: 4, borderRadius: 6,
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{
              padding: '1rem 1.25rem',
              display: 'flex', flexDirection: 'column', gap: '1.125rem',
            }}>
              <div>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: '#8e8775', marginBottom: '0.5rem',
                }}>
                  Statut
                </div>
                <StatusSelector value={status} onChange={setStatus} />
              </div>

              {showOvertime && (
                <OvertimeInput value={overtime} onChange={setOvertime} valuation={valuation} />
              )}

              <DayNoteInput value={note} onChange={setNote} />

              <div style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.25rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost"
                  style={{ flex: 1 }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
