import { useCharacterImages } from '@renderer/hooks/useCharacterImages'
import { useSessions } from '@renderer/hooks/useSessions'
import type { CSSProperties, JSX } from 'react'
import SessionCard from './SessionCard'

const emptyStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.25)',
  fontSize: '12px',
  textAlign: 'center',
  marginTop: '40px'
}

export default function SessionList(): JSX.Element {
  const { images } = useCharacterImages()
  const { sessions, handleIgnore } = useSessions()

  if (sessions.length === 0) {
    return <div style={emptyStyle}>아직 Claude Code 세션이 없어요</div>
  }

  return (
    <>
      {sessions.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          onIgnore={handleIgnore}
          customImage={images[s.status]}
        />
      ))}
    </>
  )
}
