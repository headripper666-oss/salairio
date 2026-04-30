import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Plus, Trash2 } from 'lucide-react'
import { StatusSelector } from './StatusSelector'
import { OvertimeInput } from './OvertimeInput'
import { DayNoteInput } from './DayNoteInput'
import { formatDateFR } from '@/utils/formatters'
import { useCalendarDay } from '@/hooks/useCalendarDay'
import { useAppointmentsMonth, useSaveAppointment, useDeleteAppointment } from '@/hooks/useAppointments'
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
  year: number
  month: number
  existingDay?: CalendarDay | null
  isFerie: boolean
  onClose: () => void
}

export function DayDrawer({ date, year, month, existingDay, isFerie, onClose }: DayDrawerProps) {
  const [status, setStatus] = useState<DayStatus>(existingDay?.status ?? 'vide')
  const [overtime, setOvertime] = useState(existingDay?.overtimeMinutes ?? 0)
  const [extraHours, setExtraHours] = useState(existingDay?.extraHoursMinutes ?? 420)
  const [breakMins, setBreakMins] = useState(existingDay?.breakMinutes ?? 20)
  const [note, setNote] = useState(existingDay?.note ?? '')
  const [mealCount, setMealCount] = useState<0 | 1 | 2>((existingDay?.mealCount ?? 0) as 0 | 1 | 2)

  const { saveDay, isSaving } = useCalendarDay()
  const { settings } = useSettings()
  const isDesktop = useIsDesktop()

  const { appointments } = useAppointmentsMonth(year, month)
  const saveAppt = useSaveAppointment(year, month)
  const deleteAppt = useDeleteAppointment(year, month)

  const dayAppts = date ? appointments.filter(a => a.date === date) : []

  const [showApptForm, setShowApptForm] = useState(false)
  const [apptTitle, setApptTitle] = useState('')
  const [apptTime, setApptTime] = useState('09:00')

  function resetApptForm() {
    setApptTitle('')
    setApptTime('09:00')
    setShowApptForm(false)
  }

  function handleSaveAppt() {
    if (!date || !apptTitle.trim()) return
    const id = `${date}-${Date.now()}`
    saveAppt.mutate({
      id,
      date,
      title: apptTitle.trim(),
      time: apptTime,
    })
    resetApptForm()
  }

  useEffect(() => {
    setStatus(existingDay?.status ?? 'vide')
    setOvertime(existingDay?.overtimeMinutes ?? 0)
    setExtraHours(existingDay?.extraHoursMinutes ?? 420)
    setBreakMins(existingDay?.breakMinutes ?? 20)
    setNote(existingDay?.note ?? '')
    setMealCount((existingDay?.mealCount ?? 0) as 0 | 1 | 2)
    setShowApptForm(false)
    setApptTitle('')
    setApptTime('09:00')
  }, [date, existingDay])

  // Bouton retour Android / gestuelle retour PWA
  useEffect(() => {
    if (date !== null) {
      history.pushState({ drawerOpen: true }, '')
      const handler = () => onClose()
      window.addEventListener('popstate', handler)
      return () => window.removeEventListener('popstate', handler)
    }
  }, [date !== null])

  const showOvertime = status === 'matin' || status === 'apres_midi'
  const showJourSuppFields = status === 'jour_supp'
  const showMealPicker = status === 'matin' || status === 'apres_midi' || status === 'jour_supp'
  const jourSuppNet = Math.max(0, extraHours - breakMins)

  const valuation =
    showOvertime && overtime > 0 && settings
      ? computeOvertimeValuation(overtime, date ?? '', isFerie, settings)
      : 0

  function handleSave() {
    if (!date) return
    saveDay(date, {
      status,
      overtimeMinutes: showOvertime ? overtime : 0,
      extraHoursMinutes: showJourSuppFields ? extraHours : 420,
      breakMinutes: showJourSuppFields ? breakMins : 20,
      note,
      isFerie,
      shiftKey: getShiftKey(status, existingDay?.shiftKey, settings?.shifts[0]?.key),
      mealCount: showMealPicker ? mealCount : 0,
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
        inset: 0,
        margin: 'auto',
        width: '100%',
        maxWidth: 480,
        height: 'fit-content',
        maxHeight: '85vh',
        borderRadius: 16,
        background: 'var(--paper-2)',
        border: '1px solid var(--rule)',
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
        background: 'var(--paper-2)',
        border: '1px solid var(--rule)',
        borderBottom: 'none',
        overflowY: 'auto',
        zIndex: 51,
        paddingBottom: 'calc(var(--nav-height-mobile) + env(safe-area-inset-bottom) + 0.5rem)',
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
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--rule)' }} />
              </div>
            )}

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              padding: isDesktop ? '1.25rem 1.25rem 0.875rem' : '0.75rem 1.25rem 0.875rem',
              borderBottom: '1px solid var(--border-subtle)',
              gap: 8,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', textTransform: 'capitalize' }}>
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
                  color: 'var(--ink-3)', cursor: 'pointer',
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
                  color: 'var(--ink-3)', marginBottom: '0.5rem',
                }}>
                  Statut
                </div>
                <StatusSelector value={status} onChange={setStatus} />
              </div>

              {showOvertime && (
                <OvertimeInput value={overtime} onChange={setOvertime} valuation={valuation} />
              )}

              {showJourSuppFields && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'var(--ink-3)', marginBottom: '0.5rem',
                    }}>
                      Heures supp
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min={0}
                        max={1440}
                        step={15}
                        value={Math.floor(extraHours / 60)}
                        onChange={e => {
                          const h = Math.max(0, parseInt(e.target.value) || 0)
                          setExtraHours(h * 60 + (extraHours % 60))
                        }}
                        style={{
                          width: 64, padding: '0.4rem 0.5rem',
                          background: 'var(--paper-3)', border: '1px solid var(--rule)',
                          borderRadius: 8, color: 'var(--ink)', fontSize: '0.95rem',
                          textAlign: 'center',
                        }}
                      />
                      <span style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>h</span>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        step={5}
                        value={extraHours % 60}
                        onChange={e => {
                          const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                          setExtraHours(Math.floor(extraHours / 60) * 60 + m)
                        }}
                        style={{
                          width: 64, padding: '0.4rem 0.5rem',
                          background: 'var(--paper-3)', border: '1px solid var(--rule)',
                          borderRadius: 8, color: 'var(--ink)', fontSize: '0.95rem',
                          textAlign: 'center',
                        }}
                      />
                      <span style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>min</span>
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'var(--ink-3)', marginBottom: '0.5rem',
                    }}>
                      Pause
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min={0}
                        max={240}
                        step={5}
                        value={breakMins}
                        onChange={e => setBreakMins(Math.max(0, parseInt(e.target.value) || 0))}
                        style={{
                          width: 80, padding: '0.4rem 0.5rem',
                          background: 'var(--paper-3)', border: '1px solid var(--rule)',
                          borderRadius: 8, color: 'var(--ink)', fontSize: '0.95rem',
                          textAlign: 'center',
                        }}
                      />
                      <span style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>min</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--paper-3)', borderRadius: 8,
                    border: '1px solid var(--rule)',
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>Net compteur</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
                      {Math.floor(jourSuppNet / 60)}h{String(jourSuppNet % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              )}

              {showMealPicker && (
                <div>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'var(--ink-3)', marginBottom: '0.5rem',
                  }}>
                    Repas pris
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {([0, 1, 2] as const).map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setMealCount(n)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0',
                          borderRadius: 8,
                          border: `1.5px solid ${mealCount === n ? '#d68a3c' : 'var(--ink-4)'}`,
                          background: mealCount === n ? '#d68a3c' : 'transparent',
                          color: mealCount === n ? '#fff' : 'var(--ink-2)',
                          fontSize: '1rem',
                          fontWeight: mealCount === n ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <DayNoteInput value={note} onChange={setNote} />

              {/* ─── Section RDV ─────────────────────────────────── */}
              <div>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: 'var(--ink-3)', marginBottom: '0.5rem',
                }}>
                  Rendez-vous
                </div>

                {dayAppts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    {dayAppts
                      .slice()
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map(appt => (
                        <div key={appt.id} style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          padding: '0.4rem 0.6rem',
                          background: 'var(--paper-3)',
                          border: '1px solid var(--rule)',
                          borderRadius: 8,
                        }}>
                          <span style={{ color: 'var(--sky, #5b9bd5)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                            {appt.time}
                          </span>
                          <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--ink)' }}>{appt.title}</span>
                          <button
                            type="button"
                            onClick={() => deleteAppt.mutate(appt.id)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--ink-3)', padding: 2, borderRadius: 4,
                              display: 'flex', alignItems: 'center',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {showApptForm ? (
                  <div style={{
                    padding: '0.6rem', border: '1px solid var(--rule)',
                    borderRadius: 8, background: 'var(--paper-3)',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  }}>
                    <input
                      type="text"
                      placeholder="Titre du RDV"
                      value={apptTitle}
                      onChange={e => setApptTitle(e.target.value)}
                      style={{
                        padding: '0.4rem 0.5rem',
                        background: 'var(--paper-2)', border: '1px solid var(--rule)',
                        borderRadius: 6, color: 'var(--ink)', fontSize: '0.85rem', width: '100%',
                      }}
                    />
                    <input
                      type="time"
                      value={apptTime}
                      onChange={e => setApptTime(e.target.value)}
                      style={{
                        padding: '0.4rem 0.5rem',
                        background: 'var(--paper-2)', border: '1px solid var(--rule)',
                        borderRadius: 6, color: 'var(--ink)', fontSize: '0.85rem', width: '100%',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={resetApptForm}
                        className="btn-ghost"
                        style={{ flex: 1, fontSize: '0.78rem', padding: '0.3rem' }}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAppt}
                        disabled={!apptTitle.trim()}
                        className="btn-primary"
                        style={{ flex: 1, fontSize: '0.78rem', padding: '0.3rem' }}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowApptForm(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '0.35rem 0.6rem',
                      background: 'none', border: '1px dashed var(--rule)',
                      borderRadius: 8, color: 'var(--ink-3)', cursor: 'pointer',
                      fontSize: '0.78rem', width: '100%',
                    }}
                  >
                    <Plus size={13} /> Ajouter un RDV
                  </button>
                )}
              </div>

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
