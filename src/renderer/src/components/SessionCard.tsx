import type { Session, SessionStatus } from '../types'
import { relativeTime } from '../utils/relativeTime'
import Yorkie from './Yorkie'

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
  const isWorking = session.status === 'working'

  return (
    <div
      title={session.projectPath}
      style={{
        WebkitAppRegion: 'no-drag',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.06)',
        marginBottom: '6px'
      }}
    >
      <Yorkie status={session.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1
            }}
          >
            {session.projectName}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
            {relativeTime(session.lastMessageAt)}
          </div>
        </div>
        {session.summary && (
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.45)',
              marginTop: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {session.summary}
          </div>
        )}
        <div style={{ fontSize: '10px', color: color, marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  )
}
