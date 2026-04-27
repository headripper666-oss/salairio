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
                : '1.5px solid rgba(255,255,255,0.06)',
              background: isSelected ? style.bgCell : 'rgba(255,255,255,0.02)',
              color: isSelected ? style.color : '#71717A',
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
              background: isSelected ? style.dot : 'rgba(255,255,255,0.15)',
              flexShrink: 0,
            }} />
            {style.label}
          </button>
        )
      })}
    </div>
  )
}
