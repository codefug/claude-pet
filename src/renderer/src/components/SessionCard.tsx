import { type JSX, useState } from 'react'
import type { Session, SessionStatus } from '../types'
import { relativeTime } from '../utils/relativeTime'
import CharacterAvatar from './CharacterAvatar'

const STATUS_CONFIG: Record<SessionStatus, { color: string; label: string }> = {
  working: { color: '#F5C842', label: 'working' },
  waiting_permission: { color: '#F5813A', label: 'permission' },
  done: { color: '#4CAF7D', label: 'done' },
  aborted: { color: '#888899', label: 'aborted' }
}

interface Props {
  session: Session
  onIgnore: (session: Session) => void
  customImage?: string | null
}

export default function SessionCard({ session, onIgnore, customImage }: Props): JSX.Element {
  const { color, label } = STATUS_CONFIG[session.status]
  const [hovered, setHovered] = useState(false)

  return (
    <div
      title={session.projectPath}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ WebkitAppRegion: 'no-drag' }}
      className="flex items-start gap-2.5 px-3 py-2 rounded-[10px] bg-white/6 mb-1.5 relative"
    >
      <CharacterAvatar status={session.status} customImage={customImage} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <div className="text-xs font-semibold text-white overflow-hidden text-ellipsis whitespace-nowrap flex-1">
            {session.projectName}
          </div>
          <div className="text-[10px] text-white/30 shrink-0">
            {relativeTime(session.lastMessageAt)}
          </div>
        </div>
        {session.summary && (
          <div className="text-[10px] text-white/45 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
            {session.summary}
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-0.5">
          <div style={{ color }} className="text-[10px]">
            {label}
          </div>
          {session.status === 'waiting_permission' && hovered && (
            <button
              type="button"
              onClick={() => onIgnore(session)}
              className="text-[9px] text-[#F5C842] bg-[rgba(245,200,66,0.15)] border border-[rgba(245,200,66,0.3)] rounded cursor-pointer px-1.25 py-px leading-3.5"
            >
              working으로 무시
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
