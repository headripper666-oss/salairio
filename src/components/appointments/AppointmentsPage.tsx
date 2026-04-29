import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Plus, Trash2, Clock, Bell, BellOff, Pencil, X, Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAllAppointments, useSaveAppointment, useDeleteAppointment } from '@/hooks/useAppointments'
import { getMotivationalMessage } from '@/utils/motivationalMessages'
import { useUIStore } from '@/store/uiStore'
import type { Appointment } from '@/types/firestore'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.05, ease: 'easeOut' as const } }),
}

const REMINDER_OPTIONS = [
  { label: 'Aucun rappel', value: 0 },
  { label: '15 min avant', value: 15 },
  { label: '30 min avant', value: 30 },
  { label: '1 heure avant', value: 60 },
  { label: '2 heures avant', value: 120 },
  { label: '1 jour avant', value: 1440 },
  { label: '2 jours avant', value: 2880 },
]

function reminderLabel(minutes?: number): string {
  const opt = REMINDER_OPTIONS.find(o => o.value === (minutes ?? 0))
  return opt?.label ?? 'Aucun rappel'
}

// ─── Formulaire ajout / édition ───────────────────────────────────────────────

interface FormState {
  date: string
  title: string
  time: string
  note: string
  reminderMinutes: number
}

const DEFAULT_FORM: FormState = {
  date: new Date().toISOString().slice(0, 10),
  title: '',
  time: '',
  note: '',
  reminderMinutes: 0,
}

function AppointmentForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<FormState>
  onSave: (form: FormState) => void
  onCancel?: () => void
}) {
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM, ...initial })

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: key === 'reminderMinutes' ? Number(e.target.value) : e.target.value }))

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '0.5rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--rule)',
    background: 'var(--paper)',
    color: 'var(--ink)',
    fontSize: '0.78rem',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {/* Titre */}
      <div>
        <label style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 4 }}>
          Titre
        </label>
        <input
          type="text"
          value={form.title}
          onChange={set('title')}
          placeholder="Ex : Dentiste, Réunion…"
          style={inputStyle}
          autoFocus
        />
      </div>

      {/* Date + Heure */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 4 }}>
            Date
          </label>
          <input type="date" value={form.date} onChange={set('date')} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 4 }}>
            Heure
          </label>
          <input type="time" value={form.time} onChange={set('time')} style={inputStyle} />
        </div>
      </div>

      {/* Rappel */}
      <div>
        <label style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 4 }}>
          Rappel
        </label>
        <select value={form.reminderMinutes} onChange={set('reminderMinutes')} style={inputStyle}>
          {REMINDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Note */}
      <div>
        <label style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 4 }}>
          Note (optionnel)
        </label>
        <textarea
          value={form.note}
          onChange={set('note')}
          placeholder="Détails, adresse…"
          rows={2}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 48 }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: 4 }}>
        {onCancel && (
          <button onClick={onCancel} type="button" style={{
            padding: '0.45rem 0.875rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--rule)', background: 'transparent',
            color: 'var(--ink-3)', fontSize: '0.72rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <X size={13} /> Annuler
          </button>
        )}
        <button
          onClick={() => form.title.trim() && onSave(form)}
          type="button"
          disabled={!form.title.trim()}
          style={{
            padding: '0.45rem 0.875rem', borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: form.title.trim() ? 'var(--amber)' : 'var(--paper-3)',
            color: form.title.trim() ? '#fff' : 'var(--ink-4)',
            fontSize: '0.72rem', fontWeight: 600, cursor: form.title.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <Check size={13} /> Enregistrer
        </button>
      </div>
    </div>
  )
}

// ─── Carte d'un rendez-vous ───────────────────────────────────────────────────

function AppointmentCard({
  appt,
  onDelete,
  onEdit,
  past,
}: {
  appt: Appointment
  onDelete: () => void
  onEdit: () => void
  past?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      padding: '0.875rem 1rem',
      borderRadius: 'var(--radius-md)',
      background: past ? 'var(--paper-2)' : 'var(--paper)',
      border: `1px solid var(--rule)`,
      opacity: past ? 0.65 : 1,
    }}>
      {/* Icône date */}
      <div style={{
        width: 44, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: past ? 'var(--paper-3)' : 'rgba(214,138,60,0.12)',
        borderRadius: 8, padding: '0.35rem 0.5rem',
        gap: 1,
      }}>
        <span style={{ fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {new Date(appt.date + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'short' })}
        </span>
        <span style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 700, lineHeight: 1, color: past ? 'var(--ink-3)' : 'var(--ink)' }}>
          {new Date(appt.date + 'T00:00:00').getDate()}
        </span>
        <span style={{ fontSize: '0.5rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink-4)', textTransform: 'uppercase' }}>
          {new Date(appt.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short' })}
        </span>
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--ink)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {appt.title}
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {appt.time && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace' }}>
              <Clock size={10} /> {appt.time}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: 'var(--ink-4)', fontFamily: 'JetBrains Mono, monospace' }}>
            {appt.reminderMinutes ? <Bell size={10} /> : <BellOff size={10} />}
            {reminderLabel(appt.reminderMinutes)}
          </span>
        </div>
        {appt.note && (
          <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>
            {appt.note}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button onClick={onEdit} type="button" style={{
          width: 28, height: 28, borderRadius: 6, border: '1px solid var(--rule)',
          background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Pencil size={13} />
        </button>
        <button onClick={onDelete} type="button" style={{
          width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(200,112,103,0.3)',
          background: 'transparent', color: 'var(--rose)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export function AppointmentsPage() {
  const { isDark } = useUIStore()
  const { data: allAppts = [], isLoading } = useAllAppointments()
  const saveAppt = useSaveAppointment(0, 0)
  const deleteAppt = useDeleteAppointment(0, 0)

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 900)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const { upcoming, past } = useMemo(() => {
    const sorted = [...allAppts].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    return {
      upcoming: sorted.filter(a => a.date >= today),
      past: sorted.filter(a => a.date < today).reverse(),
    }
  }, [allAppts, today])

  const editingAppt = editId ? allAppts.find(a => a.id === editId) : null

  const motivMsg = getMotivationalMessage('general', 5)

  function handleSave(form: FormState) {
    const id = editId ?? crypto.randomUUID()
    saveAppt.mutate({
      id,
      date: form.date,
      title: form.title.trim(),
      time: form.time,
      note: form.note.trim(),
      reminderMinutes: form.reminderMinutes,
    })
    setShowForm(false)
    setEditId(null)
  }

  function handleEdit(appt: Appointment) {
    setEditId(appt.id)
    setShowForm(false)
  }

  function handleDelete(id: string) {
    deleteAppt.mutate(id)
  }

  const editInitial = editingAppt ? {
    date: editingAppt.date,
    title: editingAppt.title,
    time: editingAppt.time,
    note: editingAppt.note ?? '',
    reminderMinutes: editingAppt.reminderMinutes ?? 0,
  } : undefined

  // ── Encart motivant ──
  const motivCard = (
    <div style={{
      borderRadius: 'var(--radius)',
      background: isDark
        ? 'linear-gradient(145deg, #2a1f0e 0%, #1e1608 100%)'
        : 'linear-gradient(145deg, #f5ddb0 0%, #edd090 100%)',
      border: `1px solid ${isDark ? 'rgba(214,138,60,0.22)' : 'rgba(180,110,20,0.18)'}`,
      padding: '1rem 1.125rem',
    }}>
      <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0, marginTop: 2 }}>📅</span>
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
    </div>
  )

  // ── Formulaire actif (add ou edit) ──
  const activeForm = (showForm || editId) && (
    <div className="card" style={{ padding: '1rem 1.125rem' }}>
      <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>
        {editId ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
      </div>
      <AppointmentForm
        initial={editInitial}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditId(null) }}
      />
    </div>
  )

  // ── Liste RDV ──
  const listContent = (
    <>
      {/* À venir */}
      <div>
        <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>À venir</span>
          <span style={{ fontWeight: 400, color: 'var(--ink-4)' }}>{upcoming.length} rendez-vous</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--ink-3)', fontSize: '0.75rem', fontStyle: 'italic' }}>
            Aucun rendez-vous à venir. Ajoutez-en un !
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <AnimatePresence>
              {upcoming.map((appt, i) => (
                <motion.div key={appt.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -6 }}>
                  <AppointmentCard
                    appt={appt}
                    onDelete={() => handleDelete(appt.id)}
                    onEdit={() => handleEdit(appt)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Passés */}
      {past.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.625rem' }}>
            Passés
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {past.slice(0, 10).map(appt => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                past
                onDelete={() => handleDelete(appt.id)}
                onEdit={() => handleEdit(appt)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )

  return (
    <div style={{ padding: '0 0 2rem' }}>
      <PageHeader
        title="Rendez-vous"
        action={
          <button
            onClick={() => { setShowForm(s => !s); setEditId(null) }}
            type="button"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '0.45rem 0.875rem', borderRadius: 'var(--radius-sm)',
              border: 'none', background: 'var(--amber)', color: '#fff',
              fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Annuler' : 'Nouveau RDV'}
          </button>
        }
      />

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-3)', fontSize: '0.75rem' }}>Chargement…</div>
      ) : isDesktop ? (
        /* ── VUE DESKTOP ── */
        <div style={{ padding: '0 1.25rem', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', alignItems: 'start' }}>
          {/* Colonne gauche : liste */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {editId && activeForm}
            {listContent}
          </div>

          {/* Colonne droite : formulaire + encart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {!editId && (showForm ? activeForm : (
              <div className="card" style={{ padding: '1rem 1.125rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>
                  Nouveau rendez-vous
                </div>
                <AppointmentForm onSave={handleSave} />
              </div>
            ))}
            {motivCard}
          </div>
        </div>
      ) : (
        /* ── VUE MOBILE ── */
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {activeForm}
          {listContent}
        </div>
      )}
    </div>
  )
}
