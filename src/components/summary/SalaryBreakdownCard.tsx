import { TrendingDown, TrendingUp, Info } from 'lucide-react'
import type { SalaryResult } from '@/engine/salary'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function Row({ label, value, sign = 'neutral', small }: {
  label: string
  value: string
  sign?: 'positive' | 'negative' | 'neutral'
  small?: boolean
}) {
  const valueColor =
    sign === 'negative' ? 'text-red-400' :
    sign === 'positive' ? 'text-emerald-400' :
    'text-zinc-200'

  return (
    <div className={`flex justify-between items-center ${small ? 'text-sm' : ''}`}>
      <span className="text-zinc-400">{label}</span>
      <span className={`font-mono ${valueColor}`}>{value}</span>
    </div>
  )
}

function Divider() {
  return <hr className="border-zinc-700/60 my-1" />
}

interface Props {
  result: SalaryResult
}

export function SalaryBreakdownCard({ result }: Props) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={18} className="text-amber-400" />
        <span className="font-semibold text-zinc-100">Estimation du mois</span>
        <span className="ml-auto text-xs text-zinc-500 flex items-center gap-1">
          <Info size={12} /> Estimation
        </span>
      </div>

      <Divider />

      {/* Brut */}
      <div className="space-y-1.5">
        <Row label="Salaire de base" value={fmt(result.grossBase)} />
        {result.fixedExtrasTotal > 0 && (
          <Row label="Primes fixes" value={`+ ${fmt(result.fixedExtrasTotal)}`} sign="positive" small />
        )}
        {result.oneOffBonusesTotal > 0 && (
          <Row label="Primes ponctuelles" value={`+ ${fmt(result.oneOffBonusesTotal)}`} sign="positive" small />
        )}
        {result.overtimePaidEuros > 0 && (
          <Row
            label={`Heures supp. payées (${Math.round(result.overtimePaidMinutes / 60)}h)`}
            value={`+ ${fmt(result.overtimePaidEuros)}`}
            sign="positive"
            small
          />
        )}
      </div>

      <Divider />
      <Row label="Brut total" value={fmt(result.grossTotal)} />

      <Divider />

      {/* Déductions */}
      <div className="space-y-1.5">
        <Row
          label={`Cotisations salariales`}
          value={`− ${fmt(result.cssEmployee)}`}
          sign="negative"
          small
        />
        {result.mutuelleEmployee > 0 && (
          <Row label="Mutuelle (part salariale)" value={`− ${fmt(result.mutuelleEmployee)}`} sign="negative" small />
        )}
      </div>

      <Divider />
      <Row label="Net imposable" value={fmt(result.netImposable)} />

      <Divider />

      {/* PAS */}
      <Row
        label={`Prélèvement à la source (${result.pasRate} %)`}
        value={`− ${fmt(result.pasAmount)}`}
        sign="negative"
        small
      />

      <Divider />

      {/* Net final */}
      <div className="flex justify-between items-center pt-1">
        <span className="font-semibold text-zinc-100 flex items-center gap-1">
          <TrendingDown size={16} className="text-amber-400" />
          Net après prélèvement
        </span>
        <span className="font-mono text-xl font-bold text-amber-400">{fmt(result.netAfterTax)}</span>
      </div>
    </div>
  )
}
