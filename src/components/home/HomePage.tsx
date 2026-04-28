import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Timer, TrendingUp, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { MonthCalendar } from '@/components/home/MonthCalendar'
import { useUIStore } from '@/store/uiStore'
import { useSalaryEngine } from '@/hooks/useSalaryEngine'
import { useCounterBalance } from '@/hooks/useCounterBalance'
import { monthKeyToLabel, toMonthKey, formatEuros, formatMinutes } from '@/utils/formatters'

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
  }),
}

export function HomePage() {
  const { selectedYear, selectedMonth, goToPrevMonth, goToNextMonth, goToCurrentMonth, isDark, toggleDark } = useUIStore()
  const monthKey = toMonthKey(selectedYear, selectedMonth)
  const monthLabel = monthKeyToLabel(monthKey)

  const { result, isLoading: salaryLoading } = useSalaryEngine(monthKey)
  const { balanceMinutes, isLoading: counterLoading } = useCounterBalance()

  const isCurrentMonth = (() => {
    const n = new Date()
    return n.getFullYear() === selectedYear && n.getMonth() + 1 === selectedMonth
  })()

  const netValue = salaryLoading
    ? '…'
    : result
      ? formatEuros(result.netAfterTax, { decimals: 0 })
      : '—'

  const netSub = salaryLoading
    ? 'Calcul en cours…'
    : result
      ? `Net après PAS — ${monthKeyToLabel(monthKey, true)}`
      : 'Configurez les réglages'

  const counterValue = counterLoading
    ? '…'
    : formatMinutes(balanceMinutes, { compact: true, sign: balanceMinutes > 0 })

  const counterSub = counterLoading
    ? 'Calcul en cours…'
    : balanceMinutes === 0
      ? 'Aucune heure saisie'
      : balanceMinutes > 0
        ? 'Solde en avance'
        : 'Solde en déficit'

  return (
    <div style={{ padding: '0 0 1.5rem' }}>
      <PageHeader
        title={monthLabel}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Bouton jour / nuit */}
            <button
              className="theme-toggle"
              onClick={toggleDark}
              type="button"
              aria-label={isDark ? 'Passer en mode jour' : 'Passer en mode nuit'}
            >
              {isDark
                ? <Sun size={13} />
                : <Moon size={13} />
              }
              <span>{isDark ? 'Jour' : 'Nuit'}</span>
            </button>

            <button className="btn-icon" onClick={goToPrevMonth} aria-label="Mois précédent" type="button">
              <ChevronLeft size={16} />
            </button>
            {!isCurrentMonth && (
              <button
                className="btn-ghost"
                onClick={goToCurrentMonth}
                style={{ fontSize: '0.72rem', padding: '0.35rem 0.6rem' }}
                type="button"
              >
                Aujourd'hui
              </button>
            )}
            <button className="btn-icon" onClick={goToNextMonth} aria-label="Mois suivant" type="button">
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

        {/* Cartes synthèse */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <SummaryCard
              badge="Net estimé"
              value={netValue}
              sub={netSub}
              accent="var(--moss)"
              icon={<TrendingUp size={16} />}
            />
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <SummaryCard
              badge="Compteur"
              value={counterValue}
              sub={counterSub}
              accent="var(--amber)"
              icon={<Timer size={16} />}
              valueColor={!counterLoading && balanceMinutes < 0 ? 'var(--rose)' : undefined}
            />
          </motion.div>
        </div>

        {/* Calendrier */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <MonthCalendar year={selectedYear} month={selectedMonth} />
        </motion.div>
      </div>
    </div>
  )
}

// ─── Carte synthèse ─────────────────────────────────────────────────────────
interface SummaryCardProps {
  badge: string
  value: string
  sub: string
  accent: string
  icon: React.ReactNode
  valueColor?: string
}

function SummaryCard({ badge, value, sub, accent, icon, valueColor }: SummaryCardProps) {
  return (
    <div
      className="card"
      style={{ padding: '0.875rem 1rem' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: accent, marginBottom: '0.5rem',
      }}>
        {icon}
        {badge}
      </div>
      <div style={{
        fontFamily: 'Fraunces, serif',
        fontSize: '1.6rem',
        fontWeight: 600,
        color: valueColor ?? 'var(--ink)',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.68rem',
        color: 'var(--ink-3)',
        marginTop: '0.3rem',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        {sub}
      </div>
    </div>
  )
}
