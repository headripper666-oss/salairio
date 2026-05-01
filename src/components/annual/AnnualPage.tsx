import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, CalendarRange, CheckCircle2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAnnualSummaries } from '@/hooks/useAnnualSummaries'
import { useYearWorkStats } from '@/hooks/useYearWorkStats'
import { formatEuros, formatMinutes, monthKeyToLabel } from '@/utils/formatters'
import { getMotivationalMessage } from '@/utils/motivationalMessages'
import { useUIStore } from '@/store/uiStore'
import type { MonthlySummary, WorkedDays } from '@/types/firestore'

const MONTH_LABELS_SHORT = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
]

function buildMonthKeys(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`)
}

function currentMonthKey(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

// ─── Totaux annuels depuis les mois sauvegardés et le calendrier ──────────────
function computeAnnualTotals(summaries: Map<string, MonthlySummary>, calendarStats: Map<string, WorkedDays>) {
  let netTotal = 0
  let grossTotal = 0
  let overtimeMin = 0
  let creditMin = 0
  let count = 0
  let daysMatin = 0
  let daysAM = 0
  let daysSupp = 0
  let totalMinutes = 0

  // Financier : uniquement les mois sauvegardés
  summaries.forEach(s => {
    netTotal    += s.realNetAfterTax  ?? s.netAfterTax
    grossTotal  += s.realGrossTotal   ?? s.grossTotal
    overtimeMin += s.overtimePaidMinutes
    creditMin   += s.counterCreditMinutes
    count++
  })

  // Travail : on prend le calendrier pour tout l'année
  calendarStats.forEach(s => {
    daysMatin   += s.matin
    daysAM      += s.apres_midi
    daysSupp    += s.jour_supp
    totalMinutes += s.totalMinutes
  })

  return { netTotal, grossTotal, overtimeMin, creditMin, count, daysMatin, daysAM, daysSupp, totalMinutes }
}

// ─── Page principale ──────────────────────────────────────────────────────────
export function AnnualPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { summaries, isLoading: summariesLoading } = useAnnualSummaries(year)
  const { stats: calendarStats, isLoading: statsLoading } = useYearWorkStats(year)
  const { isDark } = useUIStore()

  const isLoading = summariesLoading || statsLoading

  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 900)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const months = buildMonthKeys(year)
  const today = currentMonthKey()
  const totals = computeAnnualTotals(summaries, calendarStats)
  const motivMsg = getMotivationalMessage('general', 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Tableau annuel"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="btn-icon" onClick={() => setYear(y => y - 1)} type="button" aria-label="Année précédente">
              <ChevronLeft size={16} />
            </button>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)',
              minWidth: 44, textAlign: 'center',
            }}>
              {year}
            </span>
            <button className="btn-icon" onClick={() => setYear(y => y + 1)} type="button" aria-label="Année suivante">
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 5rem' }}>

        {/* Cartes totaux annuels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
          gap: '0.625rem',
          margin: '0.75rem 0 1.25rem',
        }}>
          <TotalCard label="Net annuel" value={formatEuros(totals.netTotal, { decimals: 0 })} accent="#6b8a5a" />
          <TotalCard label="Brut annuel" value={formatEuros(totals.grossTotal, { decimals: 0 })} accent="#d68a3c" />
          <TotalCard label="Jours travaillés" value={`${totals.daysMatin + totals.daysAM + totals.daysSupp}j`} accent="#82b4a0" />
          <TotalCard label="Heures travaillées" value={formatMinutes(totals.totalMinutes, { compact: true })} accent="#f1c987" />
        </div>

        {/* Message vide */}
        {!isLoading && summaries.size === 0 && calendarStats.size === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '2.5rem 0' }}>
            <CalendarRange size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.9rem' }}>Aucune donnée pour {year}</p>
            <p style={{ fontSize: '0.75rem', marginTop: 4 }}>
              Saisis tes jours dans le calendrier pour voir les stats ici
            </p>
          </div>
        )}

        {/* Table scrollable */}
        {(isLoading || summaries.size > 0 || calendarStats.size > 0) && (
          <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--rule)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                  {['Mois', 'Net', 'Brut', 'Matin', 'AM', 'Supp.j', 'Total.j', 'Total.h', 'H.supp', 'Cpt', ''].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '0.6rem 0.875rem',
                        textAlign: i === 0 ? 'left' : 'right',
                        fontSize: '0.6rem', fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: 'var(--ink-3)', whiteSpace: 'nowrap',
                        background: 'var(--paper-2)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 12 }, (_, i) => <SkeletonRow key={i} />)
                  : months.map((mk, i) => (
                      <MonthRow
                        key={mk}
                        monthKey={mk}
                        shortLabel={MONTH_LABELS_SHORT[i]}
                        summary={summaries.get(mk) ?? null}
                        workStats={calendarStats.get(mk) ?? null}
                        isCurrent={mk === today}
                        isLast={i === 11}
                      />
                    ))
                }
              </tbody>
            </table>
          </div>
        )}

        {/* Légende */}
        <p style={{ fontSize: '0.65rem', color: 'var(--ink-4)', marginTop: '0.875rem', textAlign: 'center' }}>
          Les finances (Net/Brut) sont basées sur les mois sauvegardés. Les jours/heures viennent du calendrier.
        </p>

        {/* Encart motivant — PC uniquement */}
        {isDesktop && (
          <div style={{
            borderRadius: 'var(--radius)',
            background: isDark
              ? 'linear-gradient(145deg, #2a1f0e 0%, #1e1608 100%)'
              : 'linear-gradient(145deg, #f5ddb0 0%, #edd090 100%)',
            border: `1px solid ${isDark ? 'rgba(214,138,60,0.22)' : 'rgba(180,110,20,0.18)'}`,
            padding: '0.875rem 1rem',
            marginTop: '0.875rem',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0, marginTop: 2 }}>📊</span>
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
    </div>
  )
}

// ─── Ligne de mois ────────────────────────────────────────────────────────────
interface MonthRowProps {
  monthKey: string
  shortLabel: string
  summary: MonthlySummary | null
  workStats: WorkedDays | null
  isCurrent: boolean
  isLast: boolean
}

function MonthRow({ monthKey, shortLabel, summary, workStats, isCurrent, isLast }: MonthRowProps) {
  const full = monthKeyToLabel(monthKey)
  const hasSummary = summary !== null
  const hasWork = workStats !== null

  const cellStyle: React.CSSProperties = {
    padding: '0.7rem 0.875rem',
    fontSize: '0.8rem',
    color: (hasSummary || hasWork) ? 'var(--ink)' : 'var(--ink-4)',
    borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
    background: isCurrent ? 'rgba(214,138,60,0.05)' : 'transparent',
    whiteSpace: 'nowrap',
  }

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Mois */}
      <td style={{ ...cellStyle, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: isCurrent ? 700 : 500 }}>{shortLabel}</span>
          {isCurrent && (
            <span style={{
              fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#d68a3c', background: 'rgba(214,138,60,0.12)',
              border: '1px solid rgba(214,138,60,0.25)', borderRadius: 3, padding: '1px 5px',
            }}>
              En cours
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)', marginTop: 1 }}>{full}</div>
      </td>

      {/* Net */}
      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
        {hasSummary
          ? <span title={summary.realNetAfterTax != null ? 'Valeur réelle saisie' : 'Estimation'}>
              {formatEuros(summary.realNetAfterTax ?? summary.netAfterTax, { decimals: 0 })}
              {summary.realNetAfterTax != null && <span style={{ color: '#6b8a5a', marginLeft: 2, fontSize: '0.6rem' }}>✓</span>}
            </span>
          : '—'
        }
      </td>

      {/* Brut */}
      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: hasSummary ? 'var(--ink-3)' : 'var(--ink-4)', fontSize: '0.75rem' }}>
        {hasSummary
          ? <span title={summary.realGrossTotal != null ? 'Valeur réelle saisie' : 'Estimation'}>
              {formatEuros(summary.realGrossTotal ?? summary.grossTotal, { decimals: 0 })}
              {summary.realGrossTotal != null && <span style={{ color: '#6b8a5a', marginLeft: 2, fontSize: '0.6rem' }}>✓</span>}
            </span>
          : '—'
        }
      </td>

      {/* Matin */}
      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: hasWork && workStats.matin > 0 ? 'var(--ink)' : 'var(--ink-4)' }}>
        {hasWork && workStats.matin > 0 ? workStats.matin : '—'}
      </td>

      {/* AM */}
      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: hasWork && workStats.apres_midi > 0 ? 'var(--ink)' : 'var(--ink-4)' }}>
        {hasWork && workStats.apres_midi > 0 ? workStats.apres_midi : '—'}
      </td>

      {/* Jours supp */}
      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: hasWork && workStats.jour_supp > 0 ? '#8aaee0' : 'var(--ink-4)' }}>
        {hasWork && workStats.jour_supp > 0 ? workStats.jour_supp : '—'}
      </td>

      {/* Total jours */}
      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: hasWork && workStats.total > 0 ? 'var(--ink)' : 'var(--ink-4)' }}>
        {hasWork && workStats.total > 0 ? workStats.total : '—'}
      </td>

      {/* Total heures */}
      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: hasWork && workStats.totalMinutes > 0 ? 'var(--ink)' : 'var(--ink-4)' }}>
        {hasWork && workStats.totalMinutes > 0 ? formatMinutes(workStats.totalMinutes, { compact: true }) : '—'}
      </td>

      {/* H. supp payées */}
      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: hasSummary && summary.overtimePaidMinutes > 0 ? '#8aaee0' : 'var(--ink-4)', fontSize: '0.75rem' }}>
        {hasSummary && summary.overtimePaidMinutes > 0
          ? formatMinutes(summary.overtimePaidMinutes, { compact: true })
          : '—'
        }
      </td>

      {/* Compteur crédit */}
      <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: hasSummary && summary.counterCreditMinutes > 0 ? '#6b8a5a' : 'var(--ink-4)', fontSize: '0.75rem' }}>
        {hasSummary && summary.counterCreditMinutes > 0
          ? `+${formatMinutes(summary.counterCreditMinutes, { compact: true })}`
          : '—'
        }
      </td>

      {/* Badge sauvegardé / non validé */}
      <td style={{ ...cellStyle, textAlign: 'right', paddingRight: '0.875rem' }}>
        {hasSummary ? (
          <CheckCircle2 size={14} color="#6b8a5a" style={{ opacity: 0.7 }} title="Estimation sauvegardée" />
        ) : (hasWork && (
          <AlertCircle size={14} color="var(--ink-4)" style={{ opacity: 0.5 }} title="Non validé (estimation uniquement)" />
        ))}
      </td>
    </motion.tr>
  )
}


// ─── Ligne squelette ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid rgba(241,231,210,0.04)' }}>
      {[80, 64, 56, 28, 28, 28, 32, 40, 40, 40, 16].map((w, i) => (
        <td key={i} style={{ padding: '0.7rem 0.875rem', textAlign: i === 0 ? 'left' : 'right' }}>
          <div className="skeleton" style={{ width: w, height: 12, display: 'inline-block' }} />
        </td>
      ))}
    </tr>
  )
}

// ─── Carte total annuel ───────────────────────────────────────────────────────
function TotalCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{
      padding: '0.875rem',
      borderRadius: 12,
      background: 'var(--paper-2)',
      border: '1px solid var(--rule)',
    }}>
      <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)' }}>
        {value}
      </div>
    </div>
  )
}
