import type { Session, SessionStatus } from '../types'

const STATUS_CONFIG: Record<SessionStatus, { color: string; label: string }> = {
  working: { color: '#F5C842', label: 'working' },
  waiting_permission: { color: '#F5813A', label: 'permission' },
  done: { color: '#4CAF7D', label: 'done' },
  aborted: { color: '#888899', label: 'aborted' }
}

interface Props {
  session: Session
}

export default function SessionCard({ session }: Props): React.JSX.Element {
  const { color, label } = STATUS_CONFIG[session.status]

  return (
    <div
      style={{
        WebkitAppRegion: 'no-drag',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.06)',
        marginBottom: '6px'
      }}
    >
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          marginTop: session.summary ? '-8px' : '0'
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {session.projectName}
        </div>
        {session.summary && (
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              marginTop: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {session.summary}
          </div>
        )}
        <div style={{ fontSize: '11px', color: color, marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  )
}
