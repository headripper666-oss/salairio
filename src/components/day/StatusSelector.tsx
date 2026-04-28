import { STATUS_STYLES } from '@/utils/colorUtils'
import type { DayStatus } from '@/types/firestore'

const STATUS_ORDER: DayStatus[] = [
  'matin',
  'apres_midi',
  'jour_supp',
  'recuperation',
  'conge_paye',
  'conge_sans_solde',
  'absence',
  'vide',
]

interface StatusSelectorProps {
  value: DayStatus
  onChange: (status: DayStatus) => void
}

export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
      {STATUS_ORDER.map(status => {
        const style = STATUS_STYLES[status]
        const isSelected = value === status
        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 10,
              border: isSelected
                ? `1.5px solid ${style.color}`
                : '1px solid var(--rule)',
              background: isSelected ? style.bgCell : 'var(--paper)',
              color: isSelected ? style.color : 'var(--ink-3)',
              fontSize: '0.8rem',
              fontWeight: isSelected ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isSelected ? style.dot : 'var(--rule)',
              flexShrink: 0,
            }} />
            {style.label}
          </button>
        )
      })}
    </div>
  )
}
