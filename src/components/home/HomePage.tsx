import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Timer, TrendingUp, ChevronLeft, ChevronRight, Sun, Moon, Clock, Calendar, Coffee, Sunrise, Sunset } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSwipe } from '@/hooks/useSwipe'
import { MonthCalendar } from '@/components/home/MonthCalendar'
import { useUIStore } from '@/store/uiStore'
import { useSalaryEngine } from '@/hooks/useSalaryEngine'
import { useCounterBalance } from '@/hooks/useCounterBalance'
import { useCalendarMonth } from '@/hooks/useCalendarMonth'
import { useAnnualSummaries } from '@/hooks/useAnnualSummaries'
import { useAppointmentsMonth } from '@/hooks/useAppointments'
import { useSettings } from '@/hooks/useSettings'
import { monthKeyToLabel, toMonthKey, formatEuros, formatMinutes } from '@/utils/formatters'
import { getMotivationalMessage, resolveCategory } from '@/utils/motivationalMessages'
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

interface TimeOfDayInfo {
  Icon: LucideIcon
  gradient: [string, string]
  textPrimary: string   // couleur du montant + titres
  textMuted: string     // couleur des sous-titres
  sparkColor: string    // couleur de la sparkline
  label: string
  decoOpacity: number
}

function getTimeOfDay(): TimeOfDayInfo {
  const h = new Date().getHours()
  // Nuit profonde
  if (h < 6)  return {
    Icon: Moon, label: 'Nuit',
    gradient: ['#162038', '#0c1528'],
    textPrimary: '#e8dfc8', textMuted: 'rgba(232,223,200,0.50)',
    sparkColor: 'rgba(214,138,60,0.70)', decoOpacity: 0.10,
  }
  // Aube — orange chaud levant
  if (h < 9)  return {
    Icon: Sunrise, label: 'Aube',
    gradient: ['#6b3512', '#4a2208'],
    textPrimary: '#fde8c8', textMuted: 'rgba(253,232,200,0.55)',
    sparkColor: 'rgba(255,215,130,0.75)', decoOpacity: 0.15,
  }
  // Matin — amber éclatant
  if (h < 12) return {
    Icon: Sun, label: 'Matin',
    gradient: ['#7a3c10', '#522808'],
    textPrimary: '#fde8c8', textMuted: 'rgba(253,232,200,0.55)',
    sparkColor: 'rgba(255,215,130,0.75)', decoOpacity: 0.14,
  }
  // Midi — doré lumineux
  if (h < 14) return {
    Icon: Sun, label: 'Midi',
    gradient: ['#6e5010', '#4a3608'],
    textPrimary: '#fdecc0', textMuted: 'rgba(253,236,192,0.55)',
    sparkColor: 'rgba(255,220,110,0.70)', decoOpacity: 0.13,
  }
  // Après-midi — ambré doré
  if (h < 18) return {
    Icon: Sun, label: 'Après-midi',
    gradient: ['#624a10', '#403008'],
    textPrimary: '#fde8c0', textMuted: 'rgba(253,232,192,0.55)',
    sparkColor: 'rgba(255,215,110,0.70)', decoOpacity: 0.13,
  }
  // Soir — amber orangé couchant
  if (h < 22) return {
    Icon: Sunset, label: 'Soir',
    gradient: ['#6e3010', '#4a1e08'],
    textPrimary: '#fde8c8', textMuted: 'rgba(253,232,200,0.55)',
    sparkColor: 'rgba(255,210,130,0.75)', decoOpacity: 0.15,
  }
  // Nuit tardive
  return {
    Icon: Moon, label: 'Nuit tardive',
    gradient: ['#121830', '#0a1020'],
    textPrimary: '#e8dfc8', textMuted: 'rgba(232,223,200,0.50)',
    sparkColor: 'rgba(214,138,60,0.70)', decoOpacity: 0.10,
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

function Sparkline({ values, sparkColor = 'rgba(214,138,60,0.7)' }: { values: number[]; sparkColor?: string }) {
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
        stroke={sparkColor}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {(() => {
        const [x, y] = pts[pts.length - 1].split(',').map(Number)
        return <circle cx={x} cy={y} r={3} fill={sparkColor} />
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

  // ── Message contextuel (pool rotatif) ──
  const contextMsg = useMemo(() => {
    const category = resolveCategory({ balanceMinutes, overtimeMinutes, workedCount, totalDays })
    return getMotivationalMessage(category, 0)
  }, [balanceMinutes, overtimeMinutes, workedCount, totalDays])

  // ── Décomposition salaire ──
  const hasResult = !salaryLoading && result
  const netDisplay = salaryLoading ? '…' : result ? formatEuros(result.netAfterTax, { decimals: 2 }) : '—'
  const counterDisplay = counterLoading ? '…' : formatMinutes(balanceMinutes, { compact: true, sign: balanceMinutes > 0 })

  // ── Desktop vs mobile ──
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 900)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const swipe = useSwipe(
    useCallback(() => goToNextMonth(), [goToNextMonth]),
    useCallback(() => goToPrevMonth(), [goToPrevMonth]),
  )

  if (!isDesktop) {
    // ── VUE MOBILE ──
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - var(--nav-height-mobile))' }}
        onTouchStart={swipe.onTouchStart}
        onTouchEnd={swipe.onTouchEnd}
      >
        <PageHeader
          title=""
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', justifyContent: 'space-between' }}>
              <button className="theme-toggle" onClick={toggleDark} type="button">
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                <span>{isDark ? 'Jour' : 'Nuit'}</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button className="btn-icon" onClick={goToPrevMonth} type="button"><ChevronLeft size={16} /></button>
                <span style={{
                  fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '1rem',
                  color: 'var(--ink)', textTransform: 'capitalize', whiteSpace: 'nowrap',
                  minWidth: 140, textAlign: 'center',
                }}>
                  {monthLabel}
                </span>
                <button className="btn-icon" onClick={goToNextMonth} type="button"><ChevronRight size={16} /></button>
              </div>
              {!isCurrentMonth ? (
                <button className="btn-ghost" onClick={goToCurrentMonth} style={{ fontSize: '0.72rem', padding: '0.35rem 0.6rem', whiteSpace: 'nowrap' }} type="button">
                  Auj.
                </button>
              ) : (
                <div style={{ width: 40 }} />
              )}
            </div>
          }
        />
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="popLayout" initial={false} custom={swipe.direction}>
            <motion.div
              key={monthKey}
              custom={swipe.direction}
              variants={{
                enter: (d: number) => ({ x: d === 0 ? 0 : d < 0 ? '100%' : '-100%', opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d < 0 ? '-100%' : '100%', opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.8 }}
              style={{
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                padding: '0.75rem 0.875rem 0.875rem',
                maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box',
                height: '100%',
              }}
            >
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', flexShrink: 0 }}>
                <KpiCard label="Net estimé" value={netDisplay} accent="var(--moss)" icon={<TrendingUp size={14} />} />
                <KpiCard label="Compteur" value={counterDisplay} accent="var(--amber)" icon={<Timer size={14} />} danger={!counterLoading && balanceMinutes < 0} />
              </div>
              {/* Calendrier étiré */}
              <div style={{ flex: 1, minHeight: 0 }}>
                <MonthCalendar year={selectedYear} month={selectedMonth} stretch />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // ── VUE DESKTOP ──
  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Header desktop custom */}
      <header style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: '1.75rem 1.5rem 0.75rem',
      }}>
        <div>
          <div style={{
            fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '0.3rem',
          }}>
            Tableau de bord — {monthLabel}
          </div>
          <h1 style={{
            fontFamily: 'Fraunces, serif', fontSize: '2.4rem', fontWeight: 700,
            letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--ink)',
            margin: 0,
          }}>
            {greeting}{firstName ? <>, <span style={{ color: 'var(--amber)' }}>{firstName}</span></> : null}.
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 4 }}>
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
      </header>

      <div style={{ padding: '0 1.25rem', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* ── Hero dynamique ── */}
        {(() => {
          const tod = getTimeOfDay()
          const DecoIcon = tod.Icon
          return (
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <div className="card" style={{
                padding: '1.5rem 1.75rem',
                background: `linear-gradient(135deg, ${tod.gradient[0]} 0%, ${tod.gradient[1]} 100%)`,
                border: 'none', color: tod.textPrimary, position: 'relative', overflow: 'hidden',
              }}>
                {/* Déco icône heure du jour */}
                <div style={{
                  position: 'absolute', right: 190, top: '50%', transform: 'translateY(-50%)',
                  opacity: tod.decoOpacity, pointerEvents: 'none',
                }}>
                  <DecoIcon size={130} strokeWidth={0.8} color={tod.textPrimary} />
                </div>

                {/* Badge moment de la journée */}
                <div style={{
                  position: 'absolute', top: '1rem', right: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: tod.textMuted,
                }}>
                  <DecoIcon size={10} strokeWidth={1.5} />
                  {tod.label}
                </div>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                  {/* Left : net + sous-titre */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: tod.textMuted, marginBottom: '0.5rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      Net après prélèvement
                    </div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: tod.textPrimary }}>
                      {salaryLoading ? '…' : result ? (
                        <>
                          {formatEuros(Math.floor(result.netAfterTax), { decimals: 0 })}
                          <span style={{ fontSize: '0.45em', opacity: 0.7 }}>
                            ,{String(Math.round((result.netAfterTax % 1) * 100)).padStart(2, '0')} €
                          </span>
                        </>
                      ) : '—'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: tod.textMuted, marginTop: '0.5rem', lineHeight: 1.5, fontFamily: 'JetBrains Mono, monospace' }}>
                      Estimation actualisée à partir des postes saisis.
                      {totalDays - workedCount > 0 && ` Il reste ${totalDays - workedCount} jour${totalDays - workedCount > 1 ? 's' : ''} à pointer pour finir ${monthLabel.split(' ')[0].toLowerCase()}.`}
                    </div>
                    {/* Badges */}
                    {hasResult && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                        {result.overtimePaidEuros > 0 && (
                          <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(214,138,60,0.28)', color: '#f0c070', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                            +{formatEuros(result.overtimePaidEuros, { decimals: 0 })} majorations
                          </span>
                        )}
                        {balanceMinutes > 0 && (
                          <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(100,180,120,0.22)', color: '#90d4a0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                            +{formatMinutes(balanceMinutes)} crédit
                          </span>
                        )}
                        {balanceMinutes < 0 && (
                          <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(251,69,101,0.22)', color: '#ff8090', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                            {formatMinutes(balanceMinutes)} débit
                          </span>
                        )}
                        {workedCount > 0 && (
                          <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', color: tod.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
                            {workedCount} poste{workedCount > 1 ? 's' : ''} ce mois
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right : sparkline 12 mois */}
                  {sparkValues.length > 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', minWidth: 200 }}>
                      <div style={{ fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: tod.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
                        Net sur 12 mois
                      </div>
                      <Sparkline values={sparkValues} sparkColor={tod.sparkColor} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })()}

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
              <div style={{
                borderRadius: 'var(--radius)',
                background: isDark
                  ? 'linear-gradient(145deg, #2a1f0e 0%, #1e1608 100%)'
                  : 'linear-gradient(145deg, #f5ddb0 0%, #edd090 100%)',
                border: `1px solid ${isDark ? 'rgba(214,138,60,0.22)' : 'rgba(180,110,20,0.18)'}`,
                padding: '1.125rem 1.25rem',
                boxShadow: isDark
                  ? '0 2px 16px -4px rgba(214,138,60,0.18)'
                  : '0 2px 16px -4px rgba(180,110,20,0.18)',
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0, marginTop: 2 }}>☕</span>
                  <div>
                    <div style={{
                      fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 600,
                      fontSize: '1rem', lineHeight: 1.2,
                      color: isDark ? '#f0c070' : '#7a4a0a',
                      marginBottom: '0.4rem',
                    }}>
                      « {contextMsg.title}{firstName ? `, ${firstName}` : ''} »
                    </div>
                    <div style={{
                      fontSize: '0.7rem', lineHeight: 1.6,
                      color: isDark ? 'rgba(240,192,112,0.75)' : 'rgba(100,60,10,0.75)',
                    }}>
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
