interface DayNoteInputProps {
  value: string
  onChange: (note: string) => void
}

export function DayNoteInput({ value, onChange }: DayNoteInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{
        fontSize: '0.72rem', fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8e8775',
      }}>
        Note
      </label>
      <textarea
        rows={2}
        placeholder="Note libre…"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'rgba(241,231,210,0.04)',
          border: '1px solid rgba(241,231,210,0.10)',
          borderRadius: 8,
          padding: '0.5rem 0.75rem',
          color: '#f1e7d2',
          fontSize: '0.85rem',
          resize: 'none',
          outline: 'none',
          fontFamily: 'inherit',
          lineHeight: 1.5,
        }}
      />
    </div>
  )
}
