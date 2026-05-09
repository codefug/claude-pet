const WINDOW_OPTIONS = [5, 12, 24, 48, 72]

interface Props {
  value: number
  onChange: (hours: number) => void
}

export default function SessionWindowSection({ value, onChange }: Props): React.JSX.Element {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}
      >
        세션 표시 기간
      </div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {WINDOW_OPTIONS.map((h) => (
          <button
            type="button"
            key={h}
            onClick={() => onChange(h)}
            style={{
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: value === h ? 'rgba(245,200,66,0.25)' : 'rgba(255,255,255,0.08)',
              color: value === h ? '#F5C842' : 'rgba(255,255,255,0.45)',
              fontWeight: value === h ? 700 : 400
            }}
          >
            {h}h
          </button>
        ))}
      </div>
    </div>
  )
}
