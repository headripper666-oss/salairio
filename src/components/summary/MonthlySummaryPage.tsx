import { useState } from 'react'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PageHeader } from '@/components/layout/PageHeader'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useSalaryEngine } from '@/hooks/useSalaryEngine'
import { useMonthlySummary } from '@/hooks/useMonthlySummary'
import { useAnnualSummaries } from '@/hooks/useAnnualSummaries'

function monthKeyNow(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function fmtMin(min: number): string {
  const h = Math.floor(Math.abs(min) / 60)
  const m = Math.abs(min) % 60
  const sign = min < 0 ? '−' : '+'
  return `${sign}${h}h${m.toString().padStart(2, '0')}`
}

const TeacupIllu = () => (
  <svg viewBox="0 0 64 64" fill="none" width="56" height="56" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M22 10 q-3 6 0 12 M32 8 q-3 6 0 12 M42 10 q-3 6 0 12"
      stroke="#d68a3c" strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
    <path d="M14 28 h36 v14 a14 14 0 0 1-14 14 h-8 a14 14 0 0 1-14-14 z"
      fill="#d68a3c" stroke="#b0701e" strokeWidth="1.8" />
    <ellipse cx="32" cy="28" rx="18" ry="3" fill="#3a230a" opacity=".2" />
    <path d="M50 32 q8 0 8 8 q0 8-8 8" stroke="#b0701e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <ellipse cx="32" cy="58" rx="22" ry="3" fill="#b0701e" opacity=".18" />
  </svg>
)

function ReceiptRow({
  label, value, color, bold, sep,
}: {
  label: string
  value: string
  color?: string
  bold?: boolean
  sep?: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: bold ? 600 : 400,
      paddingTop: sep ? 6 : 0,
      borderTop: sep ? '1px solid rgba(29,26,23,.14)' : undefined,
    }}>
      <span style={{ color: color ?? '#4a443d' }}>{label}</span>
      <span style={{ color: color ?? '#1d1a17' }}>{value}</span>
    </div>
  )
}

function CounterTile({
  label, value, sub, bg, border, color, labelColor,
}: {
  label: string
  value: string
  sub: string
  bg: string
  border: string
  color: string
  labelColor?: string
}) {
  return (
    <div style={{ padding: '14px 10px', borderRadius: 16, background: bg, border: `1px solid ${border}` }}>
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
        color: labelColor ?? color, marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontWeight: 700, fontSize: 20, color, lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#8e8775', marginTop: 4 }}>{sub}</div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        display: 'inline-block', width: 8, height: 8,
        borderRadius: 999, background: color, flexShrink: 0,
      }} />
      {label}
    </span>
  )
}

export function MonthlySummaryPage() {
  const [monthKey, setMonthKey] = useState(monthKeyNow)
  const { result, isLoading } = useSalaryEngine(monthKey)
  const { saveSummary, isSaving } = useMonthlySummary(monthKey)

  const year = parseInt(monthKey.split('-')[0])
  const { summaries } = useAnnualSummaries(year)

  const displayDate = parseISO(`${monthKey}-01`)
  const monthLabel = format(displayDate, 'MMMM yyyy', { locale: fr })

  function prev() {
    setMonthKey(k => format(subMonths(parseISO(`${k}-01`), 1), 'yyyy-MM'))
  }
  function next() {
    setMonthKey(k => format(addMonths(parseISO(`${k}-01`), 1), 'yyyy-MM'))
  }

  const barMonths = Array.from({ length: 12 }, (_, i) => {
    const mk = `${year}-${String(i + 1).padStart(2, '0')}`
    return { mk, v: summaries.get(mk)?.netAfterTax ?? 0 }
  })
  const barMax = Math.max(...barMonths.map(b => b.v), 1)

  const credit = result?.counterCreditMinutes ?? 0
  const debit = result?.counterDebitMinutes ?? 0
  const solde = credit - debit

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Synthèse" />

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Sélecteur de mois */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button
            onClick={prev}
            className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-zinc-100 capitalize">{monthLabel}</span>
          <button
            onClick={next}
            className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {isLoading && <div className="px-4"><CardSkeleton /></div>}

        {!isLoading && result && (
          <div className="px-4 space-y-4 md:space-y-0 md:grid md:gap-5 md:items-start"
            style={{ gridTemplateColumns: 'minmax(340px,460px) 1fr' }}>

            {/* ── Reçu papier ─────────────────────────────── */}
            <div style={{
              background: 'linear-gradient(180deg, #fbf6ea 0%, #f5edd9 100%)',
              color: '#1d1a17',
              borderRadius: 18,
              padding: '28px 24px 22px',
              boxShadow: '0 12px 32px -16px rgba(29,26,23,.28), 0 1px 0 rgba(29,26,23,.06)',
              clipPath: [
                'polygon(0 0,100% 0,100% calc(100% - 14px)',
                '96% 100%,92% calc(100% - 8px),88% 100%,84% calc(100% - 8px)',
                '80% 100%,76% calc(100% - 8px),72% 100%,68% calc(100% - 8px)',
                '64% 100%,60% calc(100% - 8px),56% 100%,52% calc(100% - 8px)',
                '48% 100%,44% calc(100% - 8px),40% 100%,36% calc(100% - 8px)',
                '32% 100%,28% calc(100% - 8px),24% 100%,20% calc(100% - 8px)',
                '16% 100%,12% calc(100% - 8px),8% 100%,4% calc(100% - 8px)',
                '0 calc(100% - 14px))',
              ].join(','),
            }}>
              {/* En-tête */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: '#5a3a14', fontWeight: 700, lineHeight: 1.1 }}>
                  · salairio ·
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8278', marginTop: 3 }}>
                  reçu mensuel · {monthLabel}
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#aaa090', marginTop: 2 }}>
                  estimation indicative · n'a pas valeur de bulletin
                </div>
              </div>

              {/* Séparateur pointillé */}
              <div style={{ height: 1, background: 'repeating-linear-gradient(90deg, #1d1a17 0 4px, transparent 4px 8px)', opacity: .28, marginBottom: 14 }} />

              {/* Lignes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                <ReceiptRow label="Salaire de base" value={fmt(result.grossBase)} />
                {result.fixedExtrasTotal > 0 && (
                  <ReceiptRow label="Primes fixes" value={`+ ${fmt(result.fixedExtrasTotal)}`} color="#6b8a5a" />
                )}
                {result.oneOffBonusesTotal > 0 && (
                  <ReceiptRow label="Primes ponctuelles" value={`+ ${fmt(result.oneOffBonusesTotal)}`} color="#6b8a5a" />
                )}
                {result.overtimePaidEuros > 0 && (
                  <ReceiptRow label="Heures supp. payées" value={`+ ${fmt(result.overtimePaidEuros)}`} color="#6b8a5a" />
                )}
                <ReceiptRow label="Brut total" value={fmt(result.grossTotal)} bold sep />
                <div style={{ height: 2 }} />
                <ReceiptRow label="Cotisations salariales" value={`− ${fmt(result.cssEmployee)}`} color="#c87067" />
                {result.mutuelleEmployee > 0 && (
                  <ReceiptRow label="Mutuelle (part salariale)" value={`− ${fmt(result.mutuelleEmployee)}`} color="#c87067" />
                )}
                <ReceiptRow label="Net imposable" value={fmt(result.netImposable)} sep />
                <ReceiptRow label={`PAS (${result.pasRate} %)`} value={`− ${fmt(result.pasAmount)}`} color="#c87067" />
              </div>

              {/* Ligne ondulée */}
              <div style={{
                margin: '14px 0',
                height: 8,
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='8'><path d='M2 4 Q 25 0 50 4 T 100 4 T 150 4 T 200 4' stroke='%231d1a17' stroke-width='1.2' fill='none' opacity='.45'/></svg>\")",
                backgroundRepeat: 'repeat-x',
              }} />

              {/* Net final */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontWeight: 600, fontSize: 16, color: '#5a3a14' }}>Net après PAS</span>
                <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 32, color: '#5a3a14', lineHeight: 1 }}>
                  {fmt(result.netAfterTax)}
                </span>
              </div>

              {/* Bouton sauvegarder */}
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => saveSummary()}
                  disabled={isSaving}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '11px 28px', borderRadius: 999,
                    background: '#1d1a17', color: '#f4ecdc',
                    border: 'none', cursor: isSaving ? 'default' : 'pointer',
                    fontSize: 14, fontWeight: 600,
                    opacity: isSaving ? .55 : 1,
                    fontFamily: 'inherit',
                    transition: 'opacity .15s',
                  }}
                >
                  <Save size={15} />
                  {isSaving ? 'Sauvegarde…' : "Sauvegarder l'estimation"}
                </button>
              </div>
            </div>

            {/* ── Colonne droite ───────────────────────────── */}
            <div className="space-y-4">

              {/* D'où vient ton net */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-zinc-100 text-base m-0">D'où vient ton net</h3>
                  {result.grossTotal > 0 && (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#71717A' }}>
                      {Math.round(result.netAfterTax / result.grossTotal * 100)} % sur ton compte
                    </span>
                  )}
                </div>
                {result.grossTotal > 0 && (() => {
                  const netPct = result.netAfterTax / result.grossTotal * 100
                  const cotPct = (result.cssEmployee + result.mutuelleEmployee) / result.grossTotal * 100
                  return (
                    <>
                      <div style={{ display: 'flex', height: 32, borderRadius: 999, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
                        <div style={{ width: `${netPct}%`, background: '#6b8a5a', display: 'grid', placeItems: 'center', color: '#f6f1e7', fontFamily: "'DM Mono'", fontSize: 11, fontWeight: 600 }}>
                          {netPct >= 22 ? `net ${Math.round(netPct)}%` : ''}
                        </div>
                        <div style={{ width: `${cotPct}%`, background: '#c87067', display: 'grid', placeItems: 'center', color: '#f6f1e7', fontFamily: "'DM Mono'", fontSize: 11, fontWeight: 600 }}>
                          {cotPct >= 15 ? `cot. ${Math.round(cotPct)}%` : ''}
                        </div>
                        <div style={{ flex: 1, background: '#2e2c28' }} />
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 12, fontSize: 12, color: '#A1A1AA' }}>
                        <LegendDot color="#6b8a5a" label={`Net · ${fmt(result.netAfterTax)}`} />
                        <LegendDot color="#c87067" label={`Cotisations · ${fmt(result.cssEmployee + result.mutuelleEmployee)}`} />
                        <LegendDot color="#2e2c28" label={`PAS · ${fmt(result.pasAmount)}`} />
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Compteur du mois */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
                <h3 className="font-semibold text-zinc-100 text-base mb-4">Compteur du mois</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <CounterTile
                    label="crédit" value={fmtMin(credit)} sub="heures en plus"
                    bg="rgba(107,138,90,.15)" border="rgba(107,138,90,.3)" color="#6b8a5a"
                  />
                  <CounterTile
                    label="débit" value={fmtMin(-debit)} sub="heures dûes"
                    bg="#0e0e16" border="rgba(255,255,255,.06)" color="#F4F4F5" labelColor="#f1c987"
                  />
                  <CounterTile
                    label="solde" value={fmtMin(solde)} sub={solde >= 0 ? 'en avance' : 'en retard'}
                    bg={solde >= 0 ? 'rgba(241,201,135,.14)' : 'rgba(200,112,103,.12)'}
                    border={solde >= 0 ? 'rgba(241,201,135,.35)' : 'rgba(200,112,103,.3)'}
                    color={solde >= 0 ? '#d68a3c' : '#c87067'}
                  />
                </div>
              </div>

              {/* Année — bar chart */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-zinc-100 text-base m-0">Année {year}</h3>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#71717A' }}>
                    net après prélèvement
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110, paddingTop: 10 }}>
                  {barMonths.map(({ mk, v }) => {
                    const isCurrent = mk === monthKey
                    const label = format(parseISO(`${mk}-01`), 'MMM', { locale: fr }).slice(0, 3)
                    return (
                      <div key={mk} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
                        <div style={{
                          width: '100%', maxWidth: 18,
                          height: v > 0 ? `${Math.max((v / barMax) * 82, 4)}px` : 4,
                          background: isCurrent ? '#d68a3c' : (v > 0 ? '#3a3a52' : 'rgba(255,255,255,.05)'),
                          borderRadius: '3px 3px 2px 2px',
                          transition: 'height .3s ease',
                        }} />
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: isCurrent ? '#d68a3c' : '#52525B' }}>
                          {label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Conseil cosy */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(241,201,135,.10) 0%, rgba(214,138,60,.06) 100%)',
                borderRadius: 18,
                padding: '18px 20px',
                border: '1px solid rgba(214,138,60,.18)',
                display: 'flex', gap: 16, alignItems: 'center',
              }}>
                <TeacupIllu />
                <div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: '#f1c987', lineHeight: 1.1, marginBottom: 4, fontWeight: 700 }}>
                    « beau mois »
                  </div>
                  <div style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.5 }}>
                    Retrouve l'évolution dans <strong style={{ color: '#F4F4F5' }}>Tableau annuel</strong>.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {!isLoading && !result && (
          <div className="text-center text-zinc-500 py-12 px-4">
            <p>Aucune donnée disponible.</p>
            <p className="text-sm mt-1">Configure tes réglages pour voir l'estimation.</p>
          </div>
        )}
      </div>
    </div>
  )
}
