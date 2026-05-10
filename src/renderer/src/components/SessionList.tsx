import type { CSSProperties, JSX } from 'react'
import { useSessions } from '../store/sessionStore'
import { useSettingsStore } from '../store/settingsStore'
import SessionCard from './SessionCard'

const emptyStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.25)',
  fontSize: '12px',
  textAlign: 'center',
  marginTop: '40px'
}

export default function SessionList(): JSX.Element {
  const { images } = useSettingsStore()
  const { sessions, ignoreSession } = useSessions()

  if (sessions.length === 0) {
    return <div style={emptyStyle}>아직 Claude Code 세션이 없어요</div>
  }

  return (
    <>
      {sessions.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          onIgnore={ignoreSession}
          customImage={images[s.status]}
        />
      ))}
    </>
  )
}
