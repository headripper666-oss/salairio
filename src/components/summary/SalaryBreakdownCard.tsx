import { TrendingDown, TrendingUp, Info } from 'lucide-react'
import type { SalaryResult } from '@/engine/salary'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

const S = {
  card: {
    background: '#1b2238',
    border: '1px solid rgba(241,231,210,0.07)',
    borderRadius: 14,
    padding: '1.25rem',
  } as React.CSSProperties,
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  divider: {
    height: 1,
    background: 'rgba(241,231,210,0.06)',
    margin: '0.375rem 0',
  } as React.CSSProperties,
}

function Row({ label, value, color, small, bold }: {
  label: string
  value: string
  color?: string
  small?: boolean
  bold?: boolean
}) {
  return (
    <div style={S.row}>
      <span style={{ fontSize: small ? '0.78rem' : '0.85rem', color: '#8e8775' }}>{label}</span>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: small ? '0.78rem' : '0.85rem',
        fontWeight: bold ? 600 : 400,
        color: color ?? '#f1e7d2',
      }}>
        {value}
      </span>
    </div>
  )
}

interface Props {
  result: SalaryResult
}

export function SalaryBreakdownCard({ result }: Props) {
  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
        <TrendingUp size={16} color="#d68a3c" />
        <span style={{ fontWeight: 600, color: '#f1e7d2', fontSize: '0.88rem' }}>Estimation du mois</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#8e8775', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Info size={11} /> Estimation
        </span>
      </div>

      <div style={S.divider} />

      <Row label="Salaire de base" value={fmt(result.grossBase)} />
      {result.fixedExtrasTotal > 0 && (
        <Row label="Primes fixes" value={`+ ${fmt(result.fixedExtrasTotal)}`} color="#6b8a5a" small />
      )}
      {result.oneOffBonusesTotal > 0 && (
        <Row label="Primes ponctuelles" value={`+ ${fmt(result.oneOffBonusesTotal)}`} color="#6b8a5a" small />
      )}
      {result.overtimePaidEuros > 0 && (
        <Row
          label={`Heures supp. (${Math.round(result.overtimePaidMinutes / 60)}h)`}
          value={`+ ${fmt(result.overtimePaidEuros)}`}
          color="#6b8a5a"
          small
        />
      )}

      <div style={S.divider} />
      <Row label="Brut total" value={fmt(result.grossTotal)} bold />
      <div style={S.divider} />

      <Row
        label="Cotisations salariales"
        value={`− ${fmt(result.cssEmployee)}`}
        color="#c87067"
        small
      />
      {result.mutuelleEmployee > 0 && (
        <Row label="Mutuelle (part salariale)" value={`− ${fmt(result.mutuelleEmployee)}`} color="#c87067" small />
      )}

      <div style={S.divider} />
      <Row label="Net imposable" value={fmt(result.netImposable)} />
      <div style={S.divider} />

      <Row
        label={`PAS (${result.pasRate} %)`}
        value={`− ${fmt(result.pasAmount)}`}
        color="#c87067"
        small
      />

      <div style={S.divider} />

      <div style={{ ...S.row, paddingTop: 4 }}>
        <span style={{ fontWeight: 600, color: '#f1e7d2', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}>
          <TrendingDown size={15} color="#d68a3c" />
          Net après prélèvement
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: '#d68a3c' }}>
          {fmt(result.netAfterTax)}
        </span>
      </div>
    </div>
  )
}
