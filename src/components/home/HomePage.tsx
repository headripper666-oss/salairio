import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Timer, TrendingUp, ChevronLeft, ChevronRight, Sun, Moon, Clock, Calendar, Coffee } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { MonthCalendar } from '@/components/home/MonthCalendar'
import { useUIStore } from '@/store/uiStore'
import { useSalaryEngine } from '@/hooks/useSalaryEngine'
import { useCounterBalance } from '@/hooks/useCounterBalance'
import { useCalendarMonth } from '@/hooks/useCalendarMonth'
import { useAnnualSummaries } from '@/hooks/useAnnualSummaries'
import { useAppointmentsMonth } from '@/hooks/useAppointments'
import { useSettings } from '@/hooks/useSettings'
import { monthKeyToLabel, toMonthKey, formatEuros, formatMinutes } from '@/utils/formatters'
import type { CalendarDayEnriched } from '@/hooks/useCalendarMonth'
import type { Appointment } from '@/types/firestore'

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
  }),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6)  return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function getContextMessage(params: {
  balanceMinutes: number
  workedCount: number
  totalDays: number
  overtimeMinutes: number
  recuperationDays: number
  firstName: string
}): { title: string; body: string } {
  const { balanceMinutes, workedCount, totalDays, overtimeMinutes, recuperationDays } = params
  const remaining = totalDays - workedCount

  if (balanceMinutes < -120) {
    return {
      title: 'Petit déficit à rattraper',
      body: `Il te reste ${formatMinutes(Math.abs(balanceMinutes))} à récupérer sur le compteur. ${remaining > 0 ? `Et encore ${remaining} poste${remaining > 1 ? 's' : ''} ce mois.` : 'Courage !'}`,
    }
  }
  if (balanceMinutes > 240) {
    return {
      title: 'Beau solde compteur',
      body: `Tu as ${formatMinutes(balanceMinutes)} d'avance. ${recuperationDays > 0 ? `N'oublie pas tes ${recuperationDays} récup à poser.` : 'Profites-en !'}`,
    }
  }
  if (overtimeMinutes > 60) {
    return {
      title: 'Heures supplémentaires',
      body: `Tu as cumulé ${formatMinutes(overtimeMinutes)} de majorées ce mois. Elles seront valorisées sur ta prochaine fiche de paie.`,
    }
  }
  if (remaining === 0) {
    return {
      title: 'Mois bouclé',
      body: 'Tous tes postes sont saisis. Tu peux consulter la synthèse mensuelle pour voir le détail de ton net.',
    }
  }
  return {
    title: 'Bon mois',
    body: `Il te reste ${remaining} poste${remaining > 1 ? 's' : ''} à pointer pour finir le mois. Continue comme ça !`,
  }
}

const WORKED_STATUSES = ['matin', 'apres_midi', 'jour_supp'] as const
const SHIFT_LABELS: Record<string, string> = {
  matin: 'Matin',
  apres_midi: 'Après-midi',
  jour_supp: 'Supp.',
  recuperation: 'Récup',
  conge_paye: 'Congé',
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const w = 180, h = 48
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 8) - 4
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="rgba(214,138,60,0.7)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dernier point */}
      {(() => {
        const [x, y] = pts[pts.length - 1].split(',').map(Number)
        return <circle cx={x} cy={y} r={3} fill="#d68a3c" />
      })()}
    </svg>
  )
}

// ─── Événement à venir ────────────────────────────────────────────────────────

interface UpcomingEvent {
  date: string
  label: string
  time?: string
  badge: string
  badgeColor: string
  isSpecial?: boolean
}

function buildUpcomingEvents(
  dayMap: Map<string, CalendarDayEnriched>,
  appointments: Appointment[],
  holidaySet: Set<string>,
  today: string,
  limit = 5
): UpcomingEvent[] {
  const events: UpcomingEvent[] = []

  // Postes futurs
  for (const [date, day] of dayMap.entries()) {
    if (date <= today) continue
    if (!WORKED_STATUSES.includes(day.status as typeof WORKED_STATUSES[number]) &&
        day.status !== 'recuperation' && day.status !== 'conge_paye') continue

    const isHoliday = holidaySet.has(date)
    events.push({
      date,
      label: day.status === 'recuperation' ? 'Récup posée'
           : day.status === 'conge_paye'   ? 'Congé payé'
           : SHIFT_LABELS[day.shiftKey ?? day.status] ?? day.status,
      badge: day.status === 'recuperation' ? 'R'
           : day.status === 'conge_paye'   ? 'C'
           : day.shiftKey === 'matin'      ? 'M'
           : day.shiftKey === 'apres_midi' ? 'A'
           : 'S',
      badgeColor: day.status === 'recuperation' ? 'var(--moss)'
               : day.status === 'conge_paye'    ? '#7b9e87'
               : day.shiftKey === 'apres_midi'  ? '#c07a3a'
               : 'var(--amber)',
      isSpecial: isHoliday,
    })
  }

  // RDV futurs
  for (const appt of appointments) {
    if (appt.date <= today) continue
    events.push({
      date: appt.date,
      label: appt.title,
      time: appt.time,
      badge: '★',
      badgeColor: '#7b8ec8',
    })
  }

  return events
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))
    .slice(0, limit)
}

function formatDateShort(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

// ─── Composants UI ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent, icon, danger }: {
  label: string; value: string; sub?: string; accent: string
  icon: React.ReactNode; danger?: boolean
}) {
  return (
    <div className="card" style={{ padding: '0.75rem 0.875rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: accent, marginBottom: '0.4rem',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        {icon}{label}
      </div>
      <div style={{
        fontFamily: 'Fraunces, serif', fontSize: '1.45rem', fontWeight: 600, lineHeight: 1.1,
        color: danger ? 'var(--rose)' : 'var(--ink)', letterSpacing: '-0.02em',
      }}>{value}</div>
      {sub && <div style={{ fontSize: '0.62rem', color: 'var(--ink-3)', marginTop: '0.25rem', fontFamily: 'JetBrains Mono, monospace' }}>{sub}</div>}
    </div>
  )
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const { selectedYear, selectedMonth, goToPrevMonth, goToNextMonth, goToCurrentMonth, isDark, toggleDark } = useUIStore()
  const monthKey = toMonthKey(selectedYear, selectedMonth)
  const monthLabel = monthKeyToLabel(monthKey)

  const { result, isLoading: salaryLoading } = useSalaryEngine(monthKey)
  const { balanceMinutes, isLoading: counterLoading } = useCounterBalance()
  const { dayMap, holidaySet } = useCalendarMonth(selectedYear, selectedMonth)
  const { summaries } = useAnnualSummaries(selectedYear)
  const { appointments } = useAppointmentsMonth(selectedYear, selectedMonth)
  const { settings } = useSettings()

  const firstName = settings?.firstName?.trim() || ''
  const greeting = getGreeting()

  const isCurrentMonth = (() => {
    const n = new Date()
    return n.getFullYear() === selectedYear && n.getMonth() + 1 === selectedMonth
  })()

  // ── Stats du mois ──
  const { workedCount, totalDays, overtimeMinutes, recuperationDays } = useMemo(() => {
    let worked = 0, total = 0, overtime = 0, recup = 0
    const today = new Date().toISOString().slice(0, 10)
    for (const [date, day] of dayMap.entries()) {
      const d = new Date(date + 'T00:00:00')
      if (d.getDay() === 0 || d.getDay() === 6) continue // exclure WE
      total++
      if (WORKED_STATUSES.includes(day.status as typeof WORKED_STATUSES[number])) {
        if (date <= today) worked++
        overtime += day.overtimeMinutes
      }
      if (day.status === 'recuperation' && date > today) recup++
    }
    return { workedCount: worked, totalDays: total, overtimeMinutes: overtime, recuperationDays: recup }
  }, [dayMap])

  // ── Sparkline 12 mois ──
  const sparkValues = useMemo(() => {
    const vals: number[] = []
    for (let m = 1; m <= 12; m++) {
      const k = toMonthKey(selectedYear, m)
      const s = summaries.get(k)
      if (s) vals.push(s.netAfterTax)
    }
    return vals
  }, [summaries, selectedYear])

  // ── Événements à venir ──
  const today = new Date().toISOString().slice(0, 10)
  const upcomingEvents = useMemo(() =>
    buildUpcomingEvents(dayMap, appointments, holidaySet, today),
    [dayMap, appointments, holidaySet, today]
  )

  // ── Message contextuel ──
  const contextMsg = useMemo(() => getContextMessage({
    balanceMinutes, workedCount, totalDays, overtimeMinutes, recuperationDays, firstName,
  }), [balanceMinutes, workedCount, totalDays, overtimeMinutes, recuperationDays, firstName])

  // ── Décomposition salaire ──
  const hasResult = !salaryLoading && result
  const netDisplay = salaryLoading ? '…' : result ? formatEuros(result.netAfterTax, { decimals: 2 }) : '—'
  const counterDisplay = counterLoading ? '…' : formatMinutes(balanceMinutes, { compact: true, sign: balanceMinutes > 0 })

  // ── Desktop vs mobile ──
  const isDesktop = window.innerWidth >= 900

  if (!isDesktop) {
    // ── VUE MOBILE (inchangée) ──
    return (
      <div style={{ padding: '0 0 1.5rem' }}>
        <PageHeader
          title={monthLabel}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button className="theme-toggle" onClick={toggleDark} type="button">
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                <span>{isDark ? 'Jour' : 'Nuit'}</span>
              </button>
              <button className="btn-icon" onClick={goToPrevMonth} type="button"><ChevronLeft size={16} /></button>
              {!isCurrentMonth && (
                <button className="btn-ghost" onClick={goToCurrentMonth} style={{ fontSize: '0.72rem', padding: '0.35rem 0.6rem' }} type="button">
                  Aujourd'hui
                </button>
              )}
              <button className="btn-icon" onClick={goToNextMonth} type="button"><ChevronRight size={16} /></button>
            </div>
          }
        />
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <KpiCard label="Net estimé" value={netDisplay} accent="var(--moss)" icon={<TrendingUp size={14} />} />
            </motion.div>
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <KpiCard label="Compteur" value={counterDisplay} accent="var(--amber)" icon={<Timer size={14} />} danger={!counterLoading && balanceMinutes < 0} />
            </motion.div>
          </div>
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <MonthCalendar year={selectedYear} month={selectedMonth} />
          </motion.div>
        </div>
      </div>
    )
  }

  // ── VUE DESKTOP ──
  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Header */}
      <PageHeader
        title={`${greeting}${firstName ? `, ${firstName}` : ''}.`}
        subtitle={`Tableau de bord — ${monthLabel}`}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="theme-toggle" onClick={toggleDark} type="button">
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
              <span>{isDark ? 'Jour' : 'Nuit'}</span>
            </button>
            <button className="btn-icon" onClick={goToPrevMonth} type="button"><ChevronLeft size={16} /></button>
            {!isCurrentMonth && (
              <button className="btn-ghost" onClick={goToCurrentMonth} style={{ fontSize: '0.72rem', padding: '0.35rem 0.6rem' }} type="button">
                Aujourd'hui
              </button>
            )}
            <button className="btn-icon" onClick={goToNextMonth} type="button"><ChevronRight size={16} /></button>
          </div>
        }
      />

      <div style={{ padding: '0 1.25rem', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* ── Hero ── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="card" style={{
            padding: '1.5rem 1.75rem',
            background: isDark
              ? 'linear-gradient(135deg, #1a2340 0%, #111827 100%)'
              : 'linear-gradient(135deg, #2c3a5e 0%, #1a2340 100%)',
            border: 'none', color: '#e8dcc8', position: 'relative', overflow: 'hidden',
          }}>
            {/* Déco lune/étoiles */}
            <div style={{ position: 'absolute', right: 200, top: '50%', transform: 'translateY(-50%)', opacity: 0.12, fontSize: 120, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
              ◑
            </div>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              {/* Left : net + sous-titre */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(232,220,200,0.55)', marginBottom: '0.5rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  Net après prélèvement
                </div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: '#f0e6d0' }}>
                  {salaryLoading ? '…' : result ? (
                    <>
                      {formatEuros(Math.floor(result.netAfterTax), { decimals: 0 })}
                      <span style={{ fontSize: '0.45em', opacity: 0.7 }}>
                        ,{String(Math.round((result.netAfterTax % 1) * 100)).padStart(2, '0')} €
                      </span>
                    </>
                  ) : '—'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(232,220,200,0.55)', marginTop: '0.5rem', lineHeight: 1.5, fontFamily: 'JetBrains Mono, monospace' }}>
                  Estimation actualisée à partir des postes saisis.
                  {totalDays - workedCount > 0 && ` Il reste ${totalDays - workedCount} jour${totalDays - workedCount > 1 ? 's' : ''} à pointer pour finir ${monthLabel.split(' ')[0].toLowerCase()}.`}
                </div>
                {/* Badges */}
                {hasResult && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                    {result.overtimePaidEuros > 0 && (
                      <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(214,138,60,0.25)', color: '#f0c070', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                        +{formatEuros(result.overtimePaidEuros, { decimals: 0 })} majorations
                      </span>
                    )}
                    {balanceMinutes > 0 && (
                      <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(100,180,120,0.2)', color: '#90d4a0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                        +{formatMinutes(balanceMinutes)} crédit
                      </span>
                    )}
                    {balanceMinutes < 0 && (
                      <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(251,69,101,0.2)', color: '#ff8090', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                        {formatMinutes(balanceMinutes)} débit
                      </span>
                    )}
                    {workedCount > 0 && (
                      <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(232,220,200,0.1)', color: 'rgba(232,220,200,0.6)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {workedCount} poste{workedCount > 1 ? 's' : ''} ce mois
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right : sparkline 12 mois */}
              {sparkValues.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', minWidth: 200 }}>
                  <div style={{ fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(232,220,200,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>
                    Net sur 12 mois
                  </div>
                  <Sparkline values={sparkValues} />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── 4 KPIs ── */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <KpiCard
              label="Postes ce mois"
              value={String(workedCount)}
              sub={`sur ${totalDays} ouvrés`}
              accent="var(--amber)"
              icon={<Calendar size={12} />}
            />
            <KpiCard
              label="Heures sup."
              value={overtimeMinutes > 0 ? formatMinutes(overtimeMinutes, { compact: true }) : '—'}
              sub="majorées ce mois"
              accent="var(--moss)"
              icon={<Clock size={12} />}
            />
            <KpiCard
              label="Récup à poser"
              value={recuperationDays > 0 ? `${recuperationDays}j` : '—'}
              sub="jours planifiés"
              accent="#7b9e87"
              icon={<Coffee size={12} />}
            />
            <KpiCard
              label="Solde compteur"
              value={counterLoading ? '…' : formatMinutes(balanceMinutes, { compact: true, sign: balanceMinutes > 0 })}
              sub={balanceMinutes >= 0 ? 'en avance' : 'déficit doux'}
              accent="var(--amber)"
              icon={<Timer size={12} />}
              danger={balanceMinutes < -120}
            />
          </div>
        </motion.div>

        {/* ── Calendrier + colonne droite ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '0.875rem', alignItems: 'start' }}>

          {/* Calendrier */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <MonthCalendar year={selectedYear} month={selectedMonth} />
          </motion.div>

          {/* Colonne droite */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

            {/* Card contextuelle */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <div className="card" style={{ padding: '1rem 1.125rem', background: 'rgba(214,138,60,0.07)', border: '1px solid rgba(214,138,60,0.18)' }}>
                <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>☕</span>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--amber)', fontFamily: 'Fraunces, serif', fontStyle: 'italic', marginBottom: '0.35rem' }}>
                      « {contextMsg.title}{firstName ? `, ${firstName}` : ''} »
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--ink-2)', lineHeight: 1.55 }}>
                      {contextMsg.body}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* À venir */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <div className="card" style={{ padding: '1rem 1.125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace' }}>
                    À venir
                  </div>
                  {upcomingEvents.length > 0 && (
                    <span style={{ fontSize: '0.55rem', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {upcomingEvents.length} prochains
                    </span>
                  )}
                </div>

                {upcomingEvents.length === 0 ? (
                  <div style={{ fontSize: '0.68rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>
                    Aucun événement à venir ce mois.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {upcomingEvents.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        {/* Badge */}
                        <div style={{
                          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                          background: ev.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6rem', fontWeight: 700, color: '#fff', fontFamily: 'JetBrains Mono, monospace',
                        }}>
                          {ev.badge}
                        </div>
                        {/* Infos */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.label}
                            {ev.isSpecial && <span style={{ marginLeft: 4, fontSize: '0.55rem', color: '#d68a3c' }}>★ Férié</span>}
                          </div>
                          <div style={{ fontSize: '0.6rem', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace' }}>
                            {formatDateShort(ev.date)}{ev.time ? ` · ${ev.time}` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* D'où vient ton net */}
            {hasResult && (
              <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
                <div className="card" style={{ padding: '1rem 1.125rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>
                    D'où vient ton net
                  </div>

                  {[
                    { label: 'Brut total', value: formatEuros(result.grossTotal, { decimals: 2 }), color: 'var(--ink)' },
                    { label: 'Cotisations & mutuelle', value: `− ${formatEuros(result.cssEmployee + result.mutuelleEmployee, { decimals: 2 })}`, color: 'var(--rose)' },
                    { label: 'Net imposable', value: formatEuros(result.netImposable, { decimals: 2 }), color: 'var(--ink)' },
                    { label: 'Prélèvement à la source', value: `− ${formatEuros(result.pasAmount, { decimals: 2 })}`, color: 'var(--rose)' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.3rem 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--ink-2)' }}>{row.label}</span>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: row.color }}>{row.value}</span>
                    </div>
                  ))}

                  {/* Barre net/cot */}
                  <div style={{ marginTop: '0.75rem' }}>
                    {(() => {
                      const gross = result.grossTotal
                      const net = result.netAfterTax
                      const cotPct = Math.round(((gross - net) / gross) * 100)
                      const netPct = 100 - cotPct
                      return (
                        <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', height: 8, gap: 2 }}>
                          <div style={{ flex: netPct, background: 'var(--moss)', borderRadius: '4px 0 0 4px' }} title={`Net ${netPct}%`} />
                          <div style={{ flex: cotPct, background: 'var(--rose)', borderRadius: '0 4px 4px 0', opacity: 0.7 }} title={`Cot. ${cotPct}%`} />
                        </div>
                      )
                    })()}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                      <span style={{ fontSize: '0.55rem', color: 'var(--moss)', fontFamily: 'JetBrains Mono, monospace' }}>
                        net {Math.round((result.netAfterTax / result.grossTotal) * 100)}%
                      </span>
                      <span style={{ fontSize: '0.55rem', color: 'var(--rose)', fontFamily: 'JetBrains Mono, monospace', opacity: 0.7 }}>
                        cot. {Math.round(((result.grossTotal - result.netAfterTax) / result.grossTotal) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
