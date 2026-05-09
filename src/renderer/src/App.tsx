import { useState, useEffect, useCallback } from 'react'
import SessionCard from './components/SessionCard'
import { sortSessions } from './utils/sortSessions'
import type { Session } from './types'
import type { SessionData } from '../../main/sessions/mockSource'

function App(): React.JSX.Element {
  const [sessions, setSessions] = useState<Session[]>([])

  const update = useCallback((data: SessionData[]): void => {
    setSessions(sortSessions(data.map((s) => ({ ...s, lastMessageAt: new Date(s.lastMessageAt) }))))
  }, [])

  useEffect(() => {
    window.claudePet.getSessions().then(update)
    return window.claudePet.onSessionsUpdate(update)
  }, [update])

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        WebkitAppRegion: 'no-drag',
        background: 'rgba(20, 20, 30, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 12px',
        boxSizing: 'border-box',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '10px',
          paddingLeft: '2px',
          paddingTop: '4px',
          paddingBottom: '8px',
          WebkitAppRegion: 'drag',
          cursor: 'grab'
        }}
      >
        Claude Sessions
      </div>
      <div style={{ flex: 1, overflowY: 'auto', WebkitAppRegion: 'no-drag' }}>
        {sessions.length === 0 ? (
          <div
            style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '40px'
            }}
          >
            아직 Claude Code 세션이 없어요
          </div>
        ) : (
          sessions.map((s) => <SessionCard key={s.id} session={s} />)
        )}
      </div>
    </div>
  )
}

export default App
