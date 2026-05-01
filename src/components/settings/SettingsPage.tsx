import { useState, useCallback, useRef } from 'react'
import {
  DollarSign, Clock, Zap, TrendingUp, CalendarDays, Bell,
  ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2, Check, AlertTriangle,
  Smartphone, ExternalLink, Sparkles, Eye, EyeOff,
} from 'lucide-react'
import { requestNotificationPermission, scheduleNotification, isNotificationGranted, getScheduledIds } from '@/hooks/useNotifications'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSettings } from '@/hooks/useSettings'
import { useTaxRates } from '@/hooks/useTaxRates'
import { useHolidayOverrides } from '@/hooks/useHolidayOverrides'
import { getPublicHolidays } from '@/engine/calendar'
import { BASE_MONTHLY_HOURS } from '@/engine/constants'
import { formatDateShort, monthKeyToLabel } from '@/utils/formatters'
import { cleanMonth, cleanYear, resetAccount } from '@/services/firestore/cleanup'
import { useAuthStore } from '@/store/authStore'
import { useQueryClient } from '@tanstack/react-query'
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
// SECTION 0 — Profil
// ═══════════════════════════════════════════════════════════
function ProfileSection() {
  const { settings, updateSettings } = useSettings()
  const { visible, show } = useSaveIndicator()
  const [firstName, setFirstName] = useState(() => settings?.firstName ?? '')

  return (
    <AccordionSection icon={<CalendarDays size={16} />} title="Profil" saved={visible}>
      <div className="settings-grid">
        <Field
          label="Prénom"
          hint="Affiché sur la page d'accueil"
          value={firstName}
          onChange={setFirstName}
          onBlur={() => {
            updateSettings({ firstName: firstName.trim() }, { onSuccess: show })
          }}
          type="text"
          placeholder="Marine"
          full
        />
      </div>
    </AccordionSection>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTION 1 — Paramètres de paie
// ═══════════════════════════════════════════════════════════
function PaySection() {
  const { settings, updateSettings, isSaving } = useSettings()
  const { visible, show } = useSaveIndicator()

  const [hourly,    setHourly]    = useState(() => String(settings?.hourlyRateGross ?? ''))
  const [css,       setCss]       = useState(() => String(settings?.cssRatePercent  ?? 22))
  const [mut,       setMut]       = useState(() => String(settings?.mutuelleEmployee ?? ''))
  const [mealPrice, setMealPrice] = useState(() => String(settings?.mealPriceEuros ?? ''))

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
              background: 'rgba(214,138,60,0.04)',
              border: '1px solid rgba(214,138,60,0.15)',
              color: computedGross ? '#d68a3c' : '#5a5448',
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
        <Field
          label="Prix d'un repas"
          hint="Retenue sur salaire par repas pris au travail"
          value={mealPrice}
          onChange={setMealPrice}
          onBlur={() => saveField('mealPriceEuros', mealPrice)}
          suffix="€"
          step="0.01"
          min="0"
          placeholder="3.50"
        />
      </div>

      {isSaving && (
        <p style={{ fontSize: '0.72rem', color: '#8e8775', marginTop: 4 }}>Enregistrement…</p>
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
            <p style={{ fontSize: '0.72rem', color: '#8e8775', margin: 0 }}>
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
  const [anciennetePct, setAnciennetePct] = useState(() => settings?.anciennetePct ?? 0)
  const [ancienneteBase, setAncienneteBase] = useState(() => settings?.ancienneteBaseSalaire ?? 0)

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

  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')

  const startEditLabel = (rule: MajorationRule) => {
    setEditingKey(rule.key)
    setEditingLabel(rule.label)
  }

  const commitLabel = (key: string) => {
    const trimmed = editingLabel.trim()
    if (!trimmed) { setEditingKey(null); return }
    const next = rules.map(r => r.key === key ? { ...r, label: trimmed } : r)
    setRules(next)
    updateSettings({ majorationRules: next }, { onSuccess: show })
    setEditingKey(null)
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
      <p style={{ fontSize: '0.72rem', color: '#8e8775', margin: 0 }}>
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
            {editingKey === rule.key ? (
              <input
                autoFocus
                type="text"
                value={editingLabel}
                onChange={e => setEditingLabel(e.target.value)}
                onBlur={() => commitLabel(rule.key)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitLabel(rule.key)
                  if (e.key === 'Escape') setEditingKey(null)
                }}
                className="label-edit-input"
              />
            ) : (
              <span
                className={`settings-row-label${!rule.enabled ? ' settings-row-label--muted' : ''}`}
                onClick={() => startEditLabel(rule)}
                title="Cliquer pour renommer"
                style={{ cursor: 'text' }}
              >
                {rule.label}
              </span>
            )}
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

      <div className="settings-divider" />
      <div className="settings-section-title">Ancienneté</div>

      {/* Salaire de référence du poste */}
      <div className="settings-row">
        <span className="settings-row-label">Salaire de référence du poste</span>
        <div className="rate-input-wrap" style={{ gap: 4 }}>
          <input
            type="number"
            value={ancienneteBase || ''}
            placeholder="0"
            onChange={e => setAncienneteBase(parseFloat(e.target.value) || 0)}
            onBlur={() => updateSettings({ ancienneteBaseSalaire: ancienneteBase }, { onSuccess: show })}
            className="rate-input"
            style={{ width: 80 }}
            min="0"
            step="10"
          />
          <span className="rate-suffix">€</span>
        </div>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#8e8775', margin: '0 0 8px' }}>
        Salaire brut mensuel de référence du poste (grille de la convention collective). Si vide, le salaire de base de l'utilisateur est utilisé.
      </p>

      {/* Taux ancienneté */}
      <div className="settings-row">
        <button
          type="button"
          className={`toggle-btn${anciennetePct > 0 ? ' toggle-btn--on' : ''}`}
          onClick={() => {
            const next = anciennetePct > 0 ? 0 : 3
            setAnciennetePct(next)
            updateSettings({ anciennetePct: next }, { onSuccess: show })
          }}
          aria-label={anciennetePct > 0 ? 'Désactiver ancienneté' : 'Activer ancienneté'}
        />
        <span className={`settings-row-label${anciennetePct === 0 ? ' settings-row-label--muted' : ''}`}>
          Taux d'ancienneté
        </span>
        <div className="rate-input-wrap">
          <input
            type="number"
            value={anciennetePct}
            onChange={e => {
              const val = Math.max(0, Math.min(50, parseFloat(e.target.value) || 0))
              setAnciennetePct(val)
            }}
            onBlur={() => updateSettings({ anciennetePct }, { onSuccess: show })}
            className="rate-input"
            disabled={anciennetePct === 0}
            min="0"
            max="50"
            step="0.5"
          />
          <span className="rate-suffix">%</span>
        </div>
      </div>
      {anciennetePct > 0 && (
        <p style={{ fontSize: '0.72rem', color: '#8e8775', margin: 0 }}>
          Prime = {anciennetePct} % × {ancienneteBase > 0 ? `${ancienneteBase.toFixed(2)} €` : 'salaire de base'} = <strong style={{ color: '#d68a3c' }}>
            {((ancienneteBase > 0 ? ancienneteBase : 0) * anciennetePct / 100).toFixed(2)} €
          </strong> / mois
        </p>
      )}
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
      <p style={{ fontSize: '0.78rem', color: '#8e8775', margin: 0 }}>
        Le taux actif est celui dont la date d'effet est la plus récente antérieure ou égale au mois calculé. Les anciens mois utilisent leur taux historique.
      </p>

      {taxRates.length === 0 ? (
        <p style={{ fontSize: '0.82rem', color: '#8e8775', fontStyle: 'italic' }}>
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
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', minWidth: 40, textAlign: 'center' }}>
          {year}
        </span>
        <button
          type="button" className="btn-icon"
          onClick={() => setYear(y => y + 1)} aria-label="Année suivante"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#8e8775', margin: 0 }}>
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
                {h.isMobile && <span style={{ fontSize: '0.68rem', color: '#5a5448', marginLeft: 4 }}>mobile</span>}
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

const APPT_REMINDER_PRESETS = [
  { label: '15 min avant', value: 15 },
  { label: '30 min avant', value: 30 },
  { label: '1 heure avant', value: 60 },
  { label: '2 heures avant', value: 120 },
  { label: '1 jour avant', value: 1440 },
  { label: '2 jours avant', value: 2880 },
]

function formatReminderLabel(min: number): string {
  if (min >= 1440) return `${min / 1440} jour${min / 1440 > 1 ? 's' : ''} avant`
  if (min >= 60)   return `${min / 60} heure${min / 60 > 1 ? 's' : ''} avant`
  return `${min} min avant`
}

// ═══════════════════════════════════════════════════════════
// SECTION 6 — Rappels (pilule + RDV)
// ═══════════════════════════════════════════════════════════
function RemindersSection() {
  const { settings, updateSettings } = useSettings()
  const { visible, show } = useSaveIndicator()
  const [permState, setPermState] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  )
  const shifts = settings?.shifts ?? []
  const times = settings?.pillReminderTimes ?? { offDay: '09:00' }
  const enabled = settings?.pillReminderEnabled ?? false
  const apptRules = settings?.apptReminderRules ?? []

  const handleToggle = useCallback(async () => {
    if (!enabled) {
      const granted = await requestNotificationPermission()
      setPermState('Notification' in window ? Notification.permission : 'denied')
      if (!granted) return
    }
    updateSettings({ pillReminderEnabled: !enabled }, { onSuccess: show })
  }, [enabled, updateSettings, show])

  const saveTime = useCallback((key: string, val: string) => {
    const next = { ...times, [key]: val }
    updateSettings({ pillReminderTimes: next as any }, { onSuccess: show })
  }, [times, updateSettings, show])

  const addApptRule = useCallback((minutesBefore: number) => {
    if (apptRules.some(r => r.minutesBefore === minutesBefore)) return
    const next = [...apptRules, { minutesBefore }].sort((a, b) => b.minutesBefore - a.minutesBefore)
    updateSettings({ apptReminderRules: next }, { onSuccess: show })
  }, [apptRules, updateSettings, show])

  const removeApptRule = useCallback((minutesBefore: number) => {
    const next = apptRules.filter(r => r.minutesBefore !== minutesBefore)
    updateSettings({ apptReminderRules: next }, { onSuccess: show })
  }, [apptRules, updateSettings, show])

  const availablePresets = APPT_REMINDER_PRESETS.filter(
    p => !apptRules.some(r => r.minutesBefore === p.value)
  )

  return (
    <AccordionSection icon={<Bell size={16} />} title="Rappels" saved={visible}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ── Rappels pilule ── */}
        <div>
          <p className="settings-section-title" style={{ padding: 0, marginBottom: 8 }}>Pilule contraceptive</p>
          <div className="settings-grid">
            <div className="settings-field settings-field--full">
              <span className="settings-hint">Notification quotidienne à l'heure selon ton poste</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={handleToggle}
                  style={{
                    position: 'relative',
                    width: 44, height: 24, borderRadius: 12,
                    background: enabled ? '#6b8a5a' : 'var(--rule)',
                    border: 'none', cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: 3, left: enabled ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                  }} />
                </button>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>
                  {enabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              {permState === 'denied' && (
                <span style={{ fontSize: '0.72rem', color: '#c87067', marginTop: 4, display: 'block' }}>
                  Les notifications sont bloquées dans le navigateur. Autorise-les dans les paramètres du site.
                </span>
              )}
            </div>

            {enabled && (
              <>
                {shifts.map(shift => (
                  <div key={shift.key} className="settings-field">
                    <label className="settings-label">Poste {shift.label}</label>
                    <div className="settings-input-wrap">
                      <input
                        type="time"
                        value={times[shift.key] ?? '20:00'}
                        onChange={e => saveTime(shift.key, e.target.value)}
                        className="settings-input"
                      />
                    </div>
                  </div>
                ))}
                <div className="settings-field">
                  <label className="settings-label">Jour non travaillé</label>
                  <div className="settings-input-wrap">
                    <input
                      type="time"
                      value={times.offDay ?? '09:00'}
                      onChange={e => saveTime('offDay', e.target.value)}
                      className="settings-input"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Rappels RDV ── */}
        <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '1rem' }}>
          <p className="settings-section-title" style={{ padding: 0, marginBottom: 4 }}>Rendez-vous</p>
          <span className="settings-hint" style={{ display: 'block', marginBottom: 10 }}>
            Ces rappels s'appliquent à tous tes RDV. Ajoute autant de créneaux que tu veux.
          </span>

          {/* Règles actives */}
          {apptRules.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              {apptRules.map(rule => (
                <div key={rule.minutesBefore} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  background: 'var(--paper-3)',
                  border: '1px solid var(--rule)',
                  borderRadius: 8,
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--ink)' }}>
                    🔔 {formatReminderLabel(rule.minutesBefore)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeApptRule(rule.minutesBefore)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--ink-3)', padding: 2, borderRadius: 4,
                      display: 'flex', alignItems: 'center',
                    }}
                    aria-label="Supprimer ce rappel"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Ajouter une règle */}
          {availablePresets.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {availablePresets.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => addApptRule(preset.value)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    background: 'transparent',
                    border: '1px dashed var(--ink-4)',
                    borderRadius: 6,
                    color: 'var(--ink-3)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          )}

          {apptRules.length === 0 && availablePresets.length === APPT_REMINDER_PRESETS.length && (
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-4)' }}>
              Aucun rappel configuré — clique sur un créneau pour l'ajouter.
            </span>
          )}

          {/* Bouton de test */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--rule)' }}>
            <button
              type="button"
              onClick={async () => {
                if (!isNotificationGranted()) {
                  alert('Les notifications ne sont pas autorisées.\nActive-les d\'abord via le toggle Pilule ci-dessus.')
                  return
                }
                const at = new Date(Date.now() + 5000)
                scheduleNotification('test-notif', '🔔 Test Salairio', 'Les notifications fonctionnent !', at)
                const ids = getScheduledIds()
                const swOk = 'serviceWorker' in navigator
                  ? await navigator.serviceWorker.ready.then(() => true).catch(() => false)
                  : false
                alert(
                  `✅ Notification programmée dans 5 secondes.\n\n` +
                  `Service Worker : ${swOk ? '✅ actif (mobile OK)' : '❌ inactif (desktop seulement)'}\n` +
                  `Permission : ${Notification.permission}\n\n` +
                  `Rappels planifiés (${ids.length}) :\n${ids.join('\n') || '(aucun pour l\'instant)'}`,
                )
              }}
              style={{
                padding: '0.35rem 0.75rem',
                background: 'transparent',
                border: '1px solid var(--ink-4)',
                borderRadius: 6,
                color: 'var(--ink-3)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Tester les notifications (dans 5 s)
            </button>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--ink-4)', marginTop: 4 }}>
              L'onglet doit rester ouvert. Sur mobile, installe l'app en PWA pour de meilleures notifications.
            </span>
          </div>
        </div>

      </div>
    </AccordionSection>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTION 7 — Gotify (notifications push)
// ═══════════════════════════════════════════════════════════

const GOTIFY_URL = 'https://renaud-quawks.tailb0d68d.ts.net'
const GOTIFY_APK_URL = 'https://github.com/gotify/android/releases/latest'

function GotifySection() {
  const { settings, updateSettings } = useSettings()
  const { visible, show } = useSaveIndicator()
  const [token, setToken] = useState(() => settings?.gotifyToken ?? '')

  return (
    <AccordionSection icon={<Smartphone size={16} />} title="Notifications Gotify" saved={visible}>
      <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', margin: '0 0 12px' }}>
        Gotify permet de recevoir des notifications push fiables même quand l'app est fermée.
        Chaque utilisateur doit avoir son propre token pour ne recevoir que ses rappels.
      </p>

      {/* Liens rapides */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <a
          href={GOTIFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0.5rem 0.75rem', borderRadius: 8,
            background: 'var(--paper-3)', border: '1px solid var(--rule)',
            color: 'var(--ink)', textDecoration: 'none', fontSize: '0.78rem',
          }}
        >
          <ExternalLink size={13} color="var(--amber)" />
          <span>Ouvrir l'interface Gotify</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace' }}>
            Apps → Créer → copier le token
          </span>
        </a>
        <a
          href={GOTIFY_APK_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0.5rem 0.75rem', borderRadius: 8,
            background: 'var(--paper-3)', border: '1px solid var(--rule)',
            color: 'var(--ink)', textDecoration: 'none', fontSize: '0.78rem',
          }}
        >
          <ExternalLink size={13} color="#6b8a5a" />
          <span>Télécharger l'APK Gotify (Android)</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace' }}>
            github.com/gotify/android
          </span>
        </a>
      </div>

      {/* Champ token */}
      <div className="settings-section-title">Mon token Gotify</div>
      <Field
        label="Token personnel"
        hint="Coller le token de ton application Gotify — différent pour chaque utilisateur"
        value={token}
        onChange={setToken}
        onBlur={() => updateSettings({ gotifyToken: token.trim() }, { onSuccess: show })}
        type="text"
        placeholder="ex: ApxKtfigDwA0dWa"
        full
      />
    </AccordionSection>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTION 8 — Analyse IA (Mistral)
// ═══════════════════════════════════════════════════════════
function MistralSection() {
  const { settings, updateSettings } = useSettings()
  const { visible, show } = useSaveIndicator()

  const [apiKey, setApiKey] = useState(() => settings?.mistralApiKey ?? '')
  const [model, setModel] = useState(() => settings?.mistralModel ?? 'mistral-small-latest')
  const [prompt, setPrompt] = useState(() => settings?.mistralSystemPrompt ?? '')
  const [showKey, setShowKey] = useState(false)

  return (
    <AccordionSection icon={<Sparkles size={16} />} title="Analyse IA (Mistral)" saved={visible}>
      <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', margin: '0 0 14px', lineHeight: 1.6 }}>
        Analyse tes fiches de paie avec Mistral AI pour comprendre les écarts entre ton salaire estimé et le réel.
        La clé API est stockée dans Firestore, jamais transmise à un tiers.
      </p>

      {/* Clé API */}
      <div className="settings-field settings-field--full">
        <label className="settings-label">Clé API Mistral</label>
        <span className="settings-hint">
          Crée une clé sur{' '}
          <a href="https://console.mistral.ai/api-keys" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--amber)', textDecoration: 'none' }}>
            console.mistral.ai
          </a>
          {' '}· ~0,003 € / analyse
        </span>
        <div className="settings-input-wrap" style={{ position: 'relative' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            onBlur={() => updateSettings({ mistralApiKey: apiKey.trim() }, { onSuccess: show })}
            className="settings-input"
            placeholder="sk-..."
            style={{ paddingRight: 38 }}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowKey(v => !v)}
            title={showKey ? 'Masquer' : 'Afficher'}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-4)', display: 'flex', alignItems: 'center', padding: 2,
            }}
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div className="settings-divider" />
      <div className="settings-section-title">Modèle utilisé</div>

      {/* Modèle */}
      <div className="settings-field settings-field--full">
        <label className="settings-label">Nom du modèle</label>
        <span className="settings-hint">
          Actuellement : <strong style={{ color: 'var(--amber)', fontFamily: "'DM Mono', monospace" }}>mistral-small-latest</strong> (Small 4, vision + texte)
        </span>
        <div className="settings-input-wrap">
          <input
            type="text"
            value={model}
            onChange={e => setModel(e.target.value)}
            onBlur={() => updateSettings({ mistralModel: model.trim() }, { onSuccess: show })}
            className="settings-input"
            placeholder="mistral-small-latest"
          />
        </div>
      </div>

      <div className="settings-divider" />
      <div className="settings-section-title">Prompt système</div>

      {/* Prompt système */}
      <div className="settings-field settings-field--full">
        <label className="settings-label">Instructions par défaut</label>
        <span className="settings-hint">
          Laisser vide pour utiliser le prompt par défaut intégré à l'app.
          Modifier uniquement pour ajuster le comportement du modèle.
        </span>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onBlur={() => updateSettings({ mistralSystemPrompt: prompt.trim() }, { onSuccess: show })}
          className="settings-input"
          placeholder="Laisser vide = prompt par défaut"
          rows={6}
          style={{ resize: 'vertical', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', lineHeight: 1.55 }}
        />
      </div>
      {prompt && (
        <button
          type="button"
          onClick={() => {
            setPrompt('')
            updateSettings({ mistralSystemPrompt: '' }, { onSuccess: show })
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '0.3rem 0.65rem', borderRadius: 6, marginTop: 4,
            border: '1px dashed var(--rule)',
            background: 'transparent', color: 'var(--ink-3)', fontSize: '0.72rem', cursor: 'pointer',
          }}
        >
          Revenir au prompt par défaut
        </button>
      )}
    </AccordionSection>
  )
}

// ═══════════════════════════════════════════════════════════
// ZONE DE DANGER
// ═══════════════════════════════════════════════════════════

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function DangerZoneSection() {
  const uid = useAuthStore(s => s.user?.uid) ?? null
  const queryClient = useQueryClient()

  const [monthYear, setMonthYear] = useState(CURRENT_YEAR)
  const [monthMonth, setMonthMonth] = useState(new Date().getMonth() + 1)
  const [yearYear, setYearYear] = useState(CURRENT_YEAR)
  const [resetInput, setResetInput] = useState('')
  const [pendingAction, setPendingAction] = useState<'month' | 'year' | 'reset' | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  const monthKey = `${monthYear}-${String(monthMonth).padStart(2, '0')}`

  async function runClean(action: 'month' | 'year' | 'reset') {
    if (!uid) return
    setBusy(true)
    setDone(null)
    try {
      if (action === 'month') {
        await cleanMonth(uid, monthKey)
        setDone(`Mois ${MONTHS[monthMonth - 1]} ${monthYear} nettoyé.`)
      } else if (action === 'year') {
        await cleanYear(uid, yearYear)
        setDone(`Année ${yearYear} nettoyée.`)
      } else {
        await resetAccount(uid)
        setDone('Compte réinitialisé. Toutes les données de pointage ont été supprimées.')
        setResetInput('')
      }
      queryClient.invalidateQueries()
    } catch {
      setDone('Une erreur est survenue. Réessaie.')
    } finally {
      setBusy(false)
      setPendingAction(null)
    }
  }

  const selectStyle: React.CSSProperties = {
    padding: '0.4rem 0.6rem', borderRadius: 6,
    border: '1px solid var(--rule)', background: 'var(--paper)',
    color: 'var(--ink)', fontSize: '0.75rem', fontFamily: 'inherit', cursor: 'pointer',
  }

  const dangerBtn = (label: string, disabled?: boolean, onClick?: () => void): React.ReactNode => (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      style={{
        padding: '0.45rem 0.875rem', borderRadius: 6,
        border: '1px solid rgba(200,112,103,0.5)',
        background: disabled || busy ? 'var(--paper-3)' : 'rgba(200,112,103,0.1)',
        color: disabled || busy ? 'var(--ink-4)' : 'var(--rose)',
        fontSize: '0.72rem', fontWeight: 600, cursor: disabled || busy ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 5,
      }}
    >
      <Trash2 size={13} /> {label}
    </button>
  )

  return (
    <AccordionSection
      icon={<AlertTriangle size={16} color="var(--rose)" />}
      title="Zone de danger"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Retour d'action */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 6, background: 'rgba(107,138,90,0.12)', border: '1px solid rgba(107,138,90,0.25)', fontSize: '0.7rem', color: 'var(--moss)' }}
            >
              ✓ {done}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Nettoyer un mois ── */}
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '0.5rem' }}>
            Nettoyer un mois
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--ink-3)', marginBottom: '0.625rem', lineHeight: 1.5 }}>
            Supprime tous les postes, mouvements compteur et primes du mois sélectionné.
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={monthYear} onChange={e => setMonthYear(Number(e.target.value))} style={selectStyle}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={monthMonth} onChange={e => setMonthMonth(Number(e.target.value))} style={selectStyle}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            {pendingAction === 'month' ? (
              <>
                <span style={{ fontSize: '0.65rem', color: 'var(--rose)', fontWeight: 600 }}>Confirmer ?</span>
                <button type="button" onClick={() => runClean('month')} disabled={busy} style={{ ...selectStyle, background: 'var(--rose)', color: '#fff', border: 'none', fontWeight: 700 }}>
                  {busy ? '…' : 'Oui, supprimer'}
                </button>
                <button type="button" onClick={() => setPendingAction(null)} style={{ ...selectStyle }}>Annuler</button>
              </>
            ) : (
              dangerBtn('Nettoyer ce mois', false, () => setPendingAction('month'))
            )}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(200,112,103,0.12)' }} />

        {/* ── Nettoyer une année ── */}
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '0.5rem' }}>
            Nettoyer une année complète
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--ink-3)', marginBottom: '0.625rem', lineHeight: 1.5 }}>
            Supprime 12 mois d'un coup : postes, compteur, primes et synthèses de l'année.
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={yearYear} onChange={e => setYearYear(Number(e.target.value))} style={selectStyle}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {pendingAction === 'year' ? (
              <>
                <span style={{ fontSize: '0.65rem', color: 'var(--rose)', fontWeight: 600 }}>Confirmer la suppression de {yearYear} ?</span>
                <button type="button" onClick={() => runClean('year')} disabled={busy} style={{ ...selectStyle, background: 'var(--rose)', color: '#fff', border: 'none', fontWeight: 700 }}>
                  {busy ? '…' : 'Oui, supprimer'}
                </button>
                <button type="button" onClick={() => setPendingAction(null)} style={selectStyle}>Annuler</button>
              </>
            ) : (
              dangerBtn('Nettoyer cette année', false, () => setPendingAction('year'))
            )}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(200,112,103,0.12)' }} />

        {/* ── Réinitialiser le compte ── */}
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--rose)', marginBottom: '0.5rem' }}>
            Réinitialiser le compte
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--ink-3)', marginBottom: '0.625rem', lineHeight: 1.5 }}>
            Supprime <strong>toutes</strong> les données de pointage (postes, compteur, RDV, primes, synthèses).
            Tes réglages de profil et de paie sont conservés. <strong>Cette action est définitive.</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={resetInput}
              onChange={e => setResetInput(e.target.value)}
              placeholder='Tape "REINITIALISER" pour confirmer'
              style={{ ...selectStyle, minWidth: 260 }}
            />
            <button
              type="button"
              disabled={resetInput !== 'REINITIALISER' || busy}
              onClick={() => runClean('reset')}
              style={{
                padding: '0.45rem 0.875rem', borderRadius: 6, border: 'none',
                background: resetInput === 'REINITIALISER' && !busy ? 'var(--rose)' : 'var(--paper-3)',
                color: resetInput === 'REINITIALISER' && !busy ? '#fff' : 'var(--ink-4)',
                fontSize: '0.72rem', fontWeight: 700,
                cursor: resetInput === 'REINITIALISER' && !busy ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <AlertTriangle size={13} /> {busy ? 'Suppression…' : 'Tout supprimer'}
            </button>
          </div>
        </div>

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
            textTransform: 'uppercase', color: '#d68a3c',
            background: 'rgba(240,160,32,0.08)', border: '1px solid rgba(240,160,32,0.18)',
            borderRadius: 4, padding: '2px 8px',
          }}>
            V1.3A
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
        <ProfileSection />
        <PaySection />
        <ShiftsSection />
        <MajorationsSection />
        <TaxRateSection />
        <HolidaySection />
        <RemindersSection />
        <GotifySection />
        <MistralSection />
        <DangerZoneSection />
      </motion.div>

      {/* Note de bas de page */}
      <div style={{
        margin: '1.5rem 1rem 0',
        padding: '0.875rem',
        background: 'rgba(241,231,210,0.02)',
        border: '1px solid rgba(241,231,210,0.06)',
        borderRadius: 10,
        fontSize: '0.72rem',
        color: '#5a5448',
        lineHeight: 1.6,
      }}>
        <Check size={12} style={{ display: 'inline', color: '#d68a3c', marginRight: 5 }} />
        Les réglages sont sauvegardés automatiquement dans Firestore à chaque modification.
        Toutes les estimations sont personnelles et non officielles.
      </div>
    </div>
  )
}
