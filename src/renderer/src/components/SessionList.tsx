import type { JSX } from 'react'
import { useSessions } from '../store/sessionStore'
import { useSettingsStore } from '../store/settingsStore'
import SessionCard from './SessionCard'

export default function SessionList(): JSX.Element {
  const { images } = useSettingsStore()
  const { sessions, ignoreSession } = useSessions()

  if (sessions.length === 0) {
    return (
      <div className="text-white/25 text-xs text-center mt-10">아직 Claude Code 세션이 없어요</div>
    )
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
