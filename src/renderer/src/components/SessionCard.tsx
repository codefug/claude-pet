import { useState } from 'react'
import type { Session, SessionStatus } from '../types'
import { relativeTime } from '../utils/relativeTime'
import CharacterAvatar from './CharacterAvatar'

const STATUS_CONFIG: Record<SessionStatus, { color: string; label: string }> = {
  working: { color: '#F5C842', label: 'working' },
  waiting_permission: { color: '#F5813A', label: 'permission' },
  done: { color: '#4CAF7D', label: 'done' },
  aborted: { color: '#888899', label: 'aborted' },
  interrupted: { color: '#A78BFA', label: 'interrupted' }
}

interface Props {
  session: Session
  onIgnore: (session: Session) => void
  customImage?: string | null
}

export default function SessionCard({ session, onIgnore, customImage }: Props): React.JSX.Element {
  const { color, label } = STATUS_CONFIG[session.status]
  const [hovered, setHovered] = useState(false)

  return (
    <div
      title={session.projectPath}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        WebkitAppRegion: 'no-drag',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.06)',
        marginBottom: '6px',
        position: 'relative'
      }}
    >
      <CharacterAvatar status={session.status} customImage={customImage} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <div style={{ fontSize: '10px', color }}>{label}</div>
          {session.status === 'waiting_permission' && hovered && (
            <button
              type="button"
              onClick={() => onIgnore(session)}
              style={{
                fontSize: '9px',
                color: '#F5C842',
                background: 'rgba(245,200,66,0.15)',
                border: '1px solid rgba(245,200,66,0.3)',
                borderRadius: '4px',
                padding: '1px 5px',
                cursor: 'pointer',
                lineHeight: '14px'
              }}
            >
              working으로 무시
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
