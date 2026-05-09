import type { Session, SessionStatus } from '../types'
import SessionCard from './SessionCard'

const emptyStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.25)',
  fontSize: '12px',
  textAlign: 'center',
  marginTop: '40px'
}

interface Props {
  sessions: Session[]
  characterImages: Record<SessionStatus, string | null>
  onIgnore: (session: Session) => void
}

export default function SessionList({ sessions, characterImages, onIgnore }: Props): React.JSX.Element {
  if (sessions.length === 0) {
    return <div style={emptyStyle}>아직 Claude Code 세션이 없어요</div>
  }

  return (
    <>
      {sessions.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          onIgnore={onIgnore}
          customImage={characterImages[s.status]}
        />
      ))}
    </>
  )
}
