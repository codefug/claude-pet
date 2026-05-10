import type { JSX } from 'react'
import type { Session, SessionStatus } from '../../../shared/schemas/session'
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
  customImage?: string | null
}

export default function SessionCard({ session, customImage }: Props): JSX.Element {
  const { color, label } = STATUS_CONFIG[session.status]

  return (
    <button
      type="button"
      title={session.projectPath}
      onClick={() => window.claudePet.openPath(session.projectPath)}
      style={{ WebkitAppRegion: 'no-drag' }}
      className="w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-[10px] bg-white/6 mb-1.5 border-none cursor-pointer hover:bg-white/10 transition-colors"
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
        <div style={{ color }} className="text-[10px] mt-0.5">
          {label}
        </div>
      </div>
    </button>
  )
}
