interface DayNoteInputProps {
  value: string
  onChange: (note: string) => void
}

export function DayNoteInput({ value, onChange }: DayNoteInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{
        fontSize: '0.72rem', fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase', color: '#71717A',
      }}>
        Note
      </label>
      <textarea
        rows={2}
        placeholder="Note libre…"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '0.5rem 0.75rem',
          color: '#F4F4F5',
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
