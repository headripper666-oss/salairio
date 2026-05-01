import { useState, useEffect } from 'react'
import { formatEuros, minutesToHHMM, parseHHMM, autoFormatHHMM } from '@/utils/formatters'

interface OvertimeInputProps {
  value: number
  onChange: (minutes: number) => void
  valuation: number
}

export function OvertimeInput({ value, onChange, valuation }: OvertimeInputProps) {
  const [raw, setRaw] = useState(value > 0 ? minutesToHHMM(value) : '')

  function handleBlur() {
    if (raw.trim() === '') {
      onChange(0)
      return
    }
    const parsed = parseHHMM(raw)
    if (parsed !== null && parsed > 0) {
      onChange(parsed)
      setRaw(minutesToHHMM(parsed))
    } else {
      onChange(0)
      setRaw('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{
        fontSize: '0.72rem', fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)',
      }}>
        Heures supplémentaires
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="HH:MM"
          value={raw}
          onChange={e => setRaw(autoFormatHHMM(e.target.value))}
          onBlur={handleBlur}
          style={{
            flex: 1,
            background: 'var(--input-bg)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            padding: '0.5rem 0.75rem',
            color: 'var(--ink)',
            fontSize: '0.9rem',
            fontFamily: "'JetBrains Mono', monospace",
            outline: 'none',
          }}
        />
        <div style={{
          fontSize: '0.78rem',
          color: value > 0 ? 'var(--amber)' : 'var(--ink-4)',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          minWidth: 72,
          textAlign: 'right',
          transition: 'color 0.15s',
        }}>
          {value > 0 ? `≈ ${formatEuros(valuation, { decimals: 0 })}` : '—'}
        </div>
      </div>
    </div>
  )
}
