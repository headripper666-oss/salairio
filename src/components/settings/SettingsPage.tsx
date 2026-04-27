import { useState, useCallback, useRef } from 'react'
import {
  DollarSign, Clock, Zap, TrendingUp, CalendarDays,
  ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2, Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSettings } from '@/hooks/useSettings'
import { useTaxRates } from '@/hooks/useTaxRates'
import { useHolidayOverrides } from '@/hooks/useHolidayOverrides'
import { getPublicHolidays } from '@/engine/calendar'
import { BASE_MONTHLY_HOURS } from '@/engine/constants'
import { formatDateShort, monthKeyToLabel } from '@/utils/formatters'
import type { MajorationRule, ShiftDefinition } from '@/types/firestore'

// ─── Hook save indicator ───────────────────────────────────────────────────────
function useSaveIndicator() {
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const show = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setVisible(true)
    timer.current = setTimeout(() => setVisible(false), 2200)
  }, [])
  return { visible, show }
}

// ─── Composant accordion ───────────────────────────────────────────────────────
interface AccordionProps {
  icon: React.ReactNode
  title: string
  defaultOpen?: boolean
  saved?: boolean
  children: React.ReactNode
}

function AccordionSection({ icon, title, defaultOpen = false, saved, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`accordion-section${open ? ' accordion-section--open' : ''}`}>
      <button className="accordion-header" onClick={() => setOpen(o => !o)} type="button">
        <span className="accordion-icon">{icon}</span>
        <span className="accordion-title">{title}</span>
        <AnimatePresence>
          {saved && (
            <motion.span
              key="saved"
              className="accordion-save-badge accordion-save-badge--visible"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Sauvegardé ✓
            </motion.span>
          )}
        </AnimatePresence>
        <ChevronDown size={16} className={`accordion-chevron${open ? ' accordion-chevron--open' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="accordion-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Champ settings générique ─────────────────────────────────────────────────
interface FieldProps {
  label: string
  hint?: string
  value: string | number
  onChange: (v: string) => void
  onBlur?: () => void
  suffix?: string
  type?: string
  step?: string
  min?: string
  placeholder?: string
  full?: boolean
}

function Field({ label, hint, value, onChange, onBlur, suffix, type = 'number', step, min, placeholder, full }: FieldProps) {
  return (
    <div className={`settings-field${full ? ' settings-field--full' : ''}`}>
      <label className="settings-label">{label}</label>
      {hint && <span className="settings-hint">{hint}</span>}
      <div className="settings-input-wrap">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className={`settings-input${suffix ? ' settings-input--has-suffix' : ''}`}
          step={step}
          min={min}
          placeholder={placeholder}
        />
        {suffix && <span className="settings-suffix">{suffix}</span>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTION 1 — Paramètres de paie
// ═══════════════════════════════════════════════════════════
function PaySection() {
  const { settings, updateSettings, isSaving } = useSettings()
  const { visible, show } = useSaveIndicator()

  const [hourly, setHourly] = useState(() => String(settings?.hourlyRateGross ?? ''))
  const [css,    setCss]    = useState(() => String(settings?.cssRatePercent  ?? 22))
  const [mut,    setMut]    = useState(() => String(settings?.mutuelleEmployee ?? ''))

  // Brut mensuel calculé automatiquement (taux × 151,67h — contrat 35h FR)
  const computedGross = parseFloat(hourly) > 0
    ? (parseFloat(hourly) * BASE_MONTHLY_HOURS).toFixed(2)
    : null

  const saveHourly = useCallback(() => {
    const rate = parseFloat(hourly)
    if (isNaN(rate) || rate <= 0) return
    const gross = parseFloat((rate * BASE_MONTHLY_HOURS).toFixed(2))
    // On sauvegarde les deux champs en une seule écriture Firestore
    updateSettings({ hourlyRateGross: rate, grossMonthlySalary: gross }, { onSuccess: show })
  }, [hourly, updateSettings, show])

  const saveField = useCallback((field: string, val: string) => {
    const n = parseFloat(val)
    if (isNaN(n)) return
    updateSettings({ [field]: n }, { onSuccess: show })
  }, [updateSettings, show])

  return (
    <AccordionSection
      icon={<DollarSign size={16} />}
      title="Paramètres de paie"
      defaultOpen
      saved={visible}
    >
      <div className="settings-grid">
        <Field
          label="Taux horaire brut"
          hint="Votre taux connu sur votre fiche de paie"
          value={hourly}
          onChange={setHourly}
          onBlur={saveHourly}
          suffix="€/h"
          step="0.01"
          min="0"
          placeholder="18,45"
        />

        {/* Salaire brut mensuel — lecture seule, calculé automatiquement */}
        <div className="settings-field">
          <label className="settings-label">Brut mensuel calculé</label>
          <span className="settings-hint">Taux × 151,67 h (contrat 35h FR)</span>
          <div className="settings-input-wrap">
            <div className="settings-input settings-input--has-suffix" style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(240,160,32,0.04)',
              border: '1px solid rgba(240,160,32,0.15)',
              color: computedGross ? '#F0A020' : '#3F3F46',
              fontFamily: "'DM Mono', monospace",
              userSelect: 'none',
            }}>
              {computedGross ?? '—'}
            </div>
            <span className="settings-suffix">€</span>
          </div>
        </div>

        <Field
          label="Cotisations salariales"
          hint="Taux global estimatif"
          value={css}
          onChange={setCss}
          onBlur={() => saveField('cssRatePercent', css)}
          suffix="%"
          step="0.1"
          min="0"
          placeholder="22"
        />
        <Field
          label="Mutuelle (part salariale)"
          hint="Montant prélevé chaque mois"
          value={mut}
          onChange={setMut}
          onBlur={() => saveField('mutuelleEmployee', mut)}
          suffix="€/mois"
          step="0.01"
          min="0"
          placeholder="42"
        />
      </div>

      {isSaving && (
        <p style={{ fontSize: '0.72rem', color: '#52525B', marginTop: 4 }}>Enregistrement…</p>
      )}
    </AccordionSection>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTION 2 — Horaires des postes
// ═══════════════════════════════════════════════════════════
function ShiftsSection() {
  const { settings, updateSettings } = useSettings()
  const { visible, show } = useSaveIndicator()

  const [shifts, setShifts] = useState<ShiftDefinition[]>(
    () => settings?.shifts ?? [],
  )

  const update = (idx: number, key: keyof ShiftDefinition, val: string) => {
    const next = shifts.map((s, i) => {
      if (i !== idx) return s
      const isNumField = key === 'durationMinutes' || key === 'breakMinutes'
      const updated = { ...s, [key]: isNumField ? parseInt(val, 10) || 0 : val }
      // Auto-recalcul durée nette quand début, fin ou pause change
      if (key === 'startTime' || key === 'endTime' || key === 'breakMinutes') {
        const [sh, sm] = updated.startTime.split(':').map(Number)
        const [eh, em] = updated.endTime.split(':').map(Number)
        const start = sh * 60 + sm
        const end   = eh * 60 + em
        const total = end > start ? end - start : end - start + 24 * 60
        updated.durationMinutes = Math.max(0, total - (updated.breakMinutes ?? 0))
      }
      return updated
    })
    setShifts(next)
  }

  const saveShifts = () => {
    updateSettings({ shifts }, { onSuccess: show })
  }

  return (
    <AccordionSection
      icon={<Clock size={16} />}
      title="Horaires des postes"
      saved={visible}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {shifts.map((shift, idx) => (
          <div key={shift.key} className="shift-card">
            <div className="shift-name">{shift.label}</div>
            <div className="shift-times">
              <div className="settings-field">
                <label className="settings-label">Début</label>
                <input
                  type="time"
                  value={shift.startTime}
                  onChange={e => update(idx, 'startTime', e.target.value)}
                  onBlur={saveShifts}
                  className="settings-input"
                />
              </div>
              <div className="settings-field">
                <label className="settings-label">Fin</label>
                <input
                  type="time"
                  value={shift.endTime}
                  onChange={e => update(idx, 'endTime', e.target.value)}
                  onBlur={saveShifts}
                  className="settings-input"
                />
              </div>
              <div className="settings-field">
                <label className="settings-label">Pause (min)</label>
                <input
                  type="number"
                  value={shift.breakMinutes ?? 0}
                  onChange={e => update(idx, 'breakMinutes', e.target.value)}
                  onBlur={saveShifts}
                  className="settings-input"
                  min="0"
                />
              </div>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#52525B', margin: 0 }}>
              = {Math.floor(shift.durationMinutes / 60)}h{shift.durationMinutes % 60 > 0 ? ` ${shift.durationMinutes % 60}min` : ''} de travail effectif
            </p>
          </div>
        ))}
      </div>
    </AccordionSection>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTION 3 — Majorations
// ═══════════════════════════════════════════════════════════
function MajorationsSection() {
  const { settings, updateSettings } = useSettings()
  const { visible, show } = useSaveIndicator()

  const [rules, setRules] = useState<MajorationRule[]>(
    () => settings?.majorationRules ?? [],
  )
  const [mode, setMode] = useState(() => settings?.majorationMode ?? 'priorite')

  const toggleRule = (key: string) => {
    const next = rules.map(r => r.key === key ? { ...r, enabled: !r.enabled } : r)
    setRules(next)
    updateSettings({ majorationRules: next }, { onSuccess: show })
  }

  const updateRate = (key: string, val: string) => {
    const rate = parseFloat(val)
    if (isNaN(rate)) return
    const next = rules.map(r => r.key === key ? { ...r, ratePercent: rate } : r)
    setRules(next)
    updateSettings({ majorationRules: next }, { onSuccess: show })
  }

  const changeMode = (m: 'cumul' | 'priorite') => {
    setMode(m)
    updateSettings({ majorationMode: m }, { onSuccess: show })
  }

  return (
    <AccordionSection
      icon={<Zap size={16} />}
      title="Majorations"
      saved={visible}
    >
      <div className="settings-section-title">Mode de calcul</div>
      <div className="mode-selector">
        <button
          type="button"
          className={`mode-btn${mode === 'priorite' ? ' mode-btn--active' : ''}`}
          onClick={() => changeMode('priorite')}
        >
          Priorité (max)
        </button>
        <button
          type="button"
          className={`mode-btn${mode === 'cumul' ? ' mode-btn--active' : ''}`}
          onClick={() => changeMode('cumul')}
        >
          Cumul (addition)
        </button>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#52525B', margin: 0 }}>
        {mode === 'priorite'
          ? "Seule la majoration la plus haute s'applique quand plusieurs se cumulent."
          : "Toutes les majorations applicables s'additionnent."}
      </p>

      <div className="settings-divider" />
      <div className="settings-section-title">Taux par type</div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rules.map(rule => (
          <div key={rule.key} className="settings-row">
            <button
              type="button"
              className={`toggle-btn${rule.enabled ? ' toggle-btn--on' : ''}`}
              onClick={() => toggleRule(rule.key)}
              aria-label={`${rule.enabled ? 'Désactiver' : 'Activer'} ${rule.label}`}
            />
            <span className={`settings-row-label${!rule.enabled ? ' settings-row-label--muted' : ''}`}>
              {rule.label}
            </span>
            <div className="rate-input-wrap">
              <input
                type="number"
                value={rule.ratePercent}
                onChange={e => updateRate(rule.key, e.target.value)}
                className="rate-input"
                disabled={!rule.enabled}
                min="0"
                max="200"
                step="5"
              />
              <span className="rate-suffix">%</span>
            </div>
          </div>
        ))}
      </div>
    </AccordionSection>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTION 4 — Taux PAS historisé
// ═══════════════════════════════════════════════════════════
function TaxRateSection() {
  const { taxRates, addRate, deleteRate, isAdding } = useTaxRates()
  const now = new Date()

  // Formulaire d'ajout
  const [newRate,  setNewRate]  = useState('')
  const [newYear,  setNewYear]  = useState(String(now.getFullYear()))
  const [newMonth, setNewMonth] = useState(String(now.getMonth() + 1))
  const [newNote,  setNewNote]  = useState('')

  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const handleAdd = () => {
    const rate = parseFloat(newRate)
    if (isNaN(rate) || rate <= 0 || rate > 100) return
    const monthKey = `${newYear}-${String(parseInt(newMonth, 10)).padStart(2, '0')}`
    addRate({ ratePercent: rate, effectiveFrom: monthKey, note: newNote.trim() })
    setNewRate('')
    setNewNote('')
  }

  return (
    <AccordionSection
      icon={<TrendingUp size={16} />}
      title="Taux d'imposition (PAS)"
    >
      <p style={{ fontSize: '0.78rem', color: '#71717A', margin: 0 }}>
        Le taux actif est celui dont la date d'effet est la plus récente antérieure ou égale au mois calculé. Les anciens mois utilisent leur taux historique.
      </p>

      {taxRates.length === 0 ? (
        <p style={{ fontSize: '0.82rem', color: '#52525B', fontStyle: 'italic' }}>
          Aucun taux configuré — les calculs netAfterTax ne seront pas disponibles.
        </p>
      ) : (
        <div className="tax-rate-list">
          {[...taxRates].reverse().map(rate => {
            const isActive = rate.effectiveFrom <= currentMonthKey &&
              !taxRates.some(r => r.effectiveFrom > rate.effectiveFrom && r.effectiveFrom <= currentMonthKey)
            return (
              <div key={rate.id} className={`tax-rate-item${isActive ? ' tax-rate-item--active' : ''}`}>
                <span className="tax-rate-value">{rate.ratePercent.toFixed(1)} %</span>
                <span className="tax-rate-from">
                  depuis {monthKeyToLabel(rate.effectiveFrom, true)}
                </span>
                {rate.note && <span className="tax-rate-note">{rate.note}</span>}
                {isActive && <span className="tax-rate-active-badge">Actif</span>}
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => deleteRate(rate.id)}
                  aria-label="Supprimer ce taux"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Formulaire ajout */}
      <div className="add-form">
        <p className="settings-section-title" style={{ padding: 0, marginBottom: 4 }}>
          Ajouter un taux
        </p>
        <div className="add-form-row" style={{ flexWrap: 'wrap' }}>
          <div className="settings-field" style={{ width: 90 }}>
            <label className="settings-label">Taux</label>
            <div className="settings-input-wrap">
              <input
                type="number"
                value={newRate}
                onChange={e => setNewRate(e.target.value)}
                className="settings-input settings-input--has-suffix"
                placeholder="9,0"
                min="0"
                max="100"
                step="0.1"
              />
              <span className="settings-suffix">%</span>
            </div>
          </div>
          <div className="settings-field" style={{ width: 70 }}>
            <label className="settings-label">Mois</label>
            <select
              value={newMonth}
              onChange={e => setNewMonth(e.target.value)}
              className="settings-select"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div className="settings-field" style={{ width: 90 }}>
            <label className="settings-label">Année</label>
            <input
              type="number"
              value={newYear}
              onChange={e => setNewYear(e.target.value)}
              className="settings-input"
              min="2020"
              max="2035"
              step="1"
            />
          </div>
          <div className="settings-field" style={{ flex: 1, minWidth: 120 }}>
            <label className="settings-label">Note (opt.)</label>
            <input
              type="text"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              className="settings-input"
              placeholder="Déclaration 2024…"
            />
          </div>
        </div>
        <button
          type="button"
          className="add-btn"
          onClick={handleAdd}
          disabled={isAdding || !newRate}
          style={{ alignSelf: 'flex-start' }}
        >
          <Plus size={14} />
          {isAdding ? 'Enregistrement…' : 'Ajouter ce taux'}
        </button>
      </div>
    </AccordionSection>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTION 5 — Jours fériés
// ═══════════════════════════════════════════════════════════
function HolidaySection() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { overrides, addOverride, deleteOverride, isAdding } = useHolidayOverrides(year)
  const baseHolidays = getPublicHolidays(year)

  const removedDates = new Set(overrides.filter(o => o.action === 'remove').map(o => o.date))

  // Formulaire ajout
  const [newDate,   setNewDate]   = useState('')
  const [newLabel,  setNewLabel]  = useState('')
  const [newAction, setNewAction] = useState<'add' | 'remove'>('add')

  const handleAdd = () => {
    if (!newDate) return
    addOverride({
      date: newDate,
      action: newAction,
      label: newLabel || (newAction === 'add' ? 'Jour ajouté' : 'Jour supprimé'),
      year,
    })
    setNewDate('')
    setNewLabel('')
  }

  return (
    <AccordionSection
      icon={<CalendarDays size={16} />}
      title="Jours fériés"
    >
      {/* Sélecteur d'année */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
        <button
          type="button" className="btn-icon"
          onClick={() => setYear(y => y - 1)} aria-label="Année précédente"
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: '#F4F4F5', minWidth: 40, textAlign: 'center' }}>
          {year}
        </span>
        <button
          type="button" className="btn-icon"
          onClick={() => setYear(y => y + 1)} aria-label="Année suivante"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#71717A', margin: 0 }}>
        Base légale France métropolitaine. Modifiez avec des surcharges pour votre situation.
      </p>

      <div className="holiday-list">
        {/* Jours de base */}
        {baseHolidays.map(h => {
          const isRemoved = removedDates.has(h.date)
          return (
            <div key={h.date} className="holiday-item">
              <span className={`holiday-dot${isRemoved ? ' holiday-dot--removed' : ' holiday-dot--base'}`} />
              <span className="holiday-date">{formatDateShort(h.date)}</span>
              <span className={`holiday-label${isRemoved ? ' holiday-label--removed' : ''}`}>
                {h.label}
                {h.isMobile && <span style={{ fontSize: '0.68rem', color: '#3F3F46', marginLeft: 4 }}>mobile</span>}
              </span>
              {isRemoved ? (
                <button
                  type="button"
                  className="add-btn"
                  style={{ fontSize: '0.68rem', padding: '2px 7px' }}
                  onClick={() => {
                    const ov = overrides.find(o => o.date === h.date && o.action === 'remove')
                    if (ov) deleteOverride(ov.id)
                  }}
                >
                  Restaurer
                </button>
              ) : (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => addOverride({ date: h.date, action: 'remove', label: h.label, year })}
                  aria-label={`Supprimer ${h.label}`}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )
        })}

        {/* Jours ajoutés par override */}
        {overrides
          .filter(o => o.action === 'add')
          .map(o => (
            <div key={o.id} className="holiday-item">
              <span className="holiday-dot holiday-dot--added" />
              <span className="holiday-date">{formatDateShort(o.date)}</span>
              <span className="holiday-label holiday-label--added">{o.label}</span>
              <button
                type="button"
                className="delete-btn"
                onClick={() => deleteOverride(o.id)}
                aria-label="Supprimer cette surcharge"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
      </div>

      {/* Formulaire ajout surcharge */}
      <div className="add-form">
        <p className="settings-section-title" style={{ padding: 0, marginBottom: 4 }}>
          Ajouter une surcharge
        </p>
        <div className="add-form-row" style={{ flexWrap: 'wrap' }}>
          <div className="settings-field">
            <label className="settings-label">Date</label>
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="settings-input"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Action</label>
            <select
              value={newAction}
              onChange={e => setNewAction(e.target.value as 'add' | 'remove')}
              className="settings-select"
            >
              <option value="add">Ajouter comme férié</option>
              <option value="remove">Retirer du calendrier</option>
            </select>
          </div>
          <div className="settings-field" style={{ flex: 1 }}>
            <label className="settings-label">Libellé</label>
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="settings-input"
              placeholder="Pont accordé…"
            />
          </div>
        </div>
        <button
          type="button"
          className="add-btn"
          onClick={handleAdd}
          disabled={isAdding || !newDate}
          style={{ alignSelf: 'flex-start' }}
        >
          <Plus size={14} />
          {isAdding ? 'Enregistrement…' : 'Ajouter la surcharge'}
        </button>
      </div>
    </AccordionSection>
  )
}

// ═══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════
export function SettingsPage() {
  const { isLoading, isError } = useSettings()

  if (isError) {
    return (
      <div>
        <PageHeader title="Réglages" />
        <div style={{
          margin: '1rem',
          padding: '1rem',
          background: 'rgba(251,69,101,0.08)',
          border: '1px solid rgba(251,69,101,0.22)',
          borderRadius: 12,
          fontSize: '0.82rem',
          color: '#FB4565',
          lineHeight: 1.6,
        }}>
          <strong>Impossible de charger les réglages.</strong><br />
          Vérifiez que la base Firestore est activée dans la console Firebase
          (<em>Firestore Database → Créer une base de données</em>).
          <br /><br />
          Ouvre aussi F12 → Console pour voir l'erreur précise.
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Réglages" />
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <PageHeader
        title="Réglages"
        subtitle="Paramètres de paie et règles métier"
        action={
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#F0A020',
            background: 'rgba(240,160,32,0.08)', border: '1px solid rgba(240,160,32,0.18)',
            borderRadius: 4, padding: '2px 8px',
          }}>
            V1
          </span>
        }
      />

      <motion.div
        style={{ padding: '0 1rem' }}
        className="accordion"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <PaySection />
        <ShiftsSection />
        <MajorationsSection />
        <TaxRateSection />
        <HolidaySection />
      </motion.div>

      {/* Note de bas de page */}
      <div style={{
        margin: '1.5rem 1rem 0',
        padding: '0.875rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        fontSize: '0.72rem',
        color: '#3F3F46',
        lineHeight: 1.6,
      }}>
        <Check size={12} style={{ display: 'inline', color: '#F0A020', marginRight: 5 }} />
        Les réglages sont sauvegardés automatiquement dans Firestore à chaque modification.
        Toutes les estimations sont personnelles et non officielles.
      </div>
    </div>
  )
}
