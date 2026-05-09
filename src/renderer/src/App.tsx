import { useState, useEffect } from 'react'
import SessionCard from './components/SessionCard'
import type { Session } from './types'

function App(): React.JSX.Element {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    window.claudePet.getSessions().then((data) => {
      setSessions(data.map((s) => ({ ...s, lastMessageAt: new Date(s.lastMessageAt) })))
    })

    const unsubscribe = window.claudePet.onSessionsUpdate((data) => {
      setSessions(data.map((s) => ({ ...s, lastMessageAt: new Date(s.lastMessageAt) })))
    })

    return unsubscribe
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        WebkitAppRegion: 'drag',
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
          paddingLeft: '2px'
        }}
      >
        Claude Sessions
      </div>
      <div style={{ flex: 1, overflowY: 'auto', WebkitAppRegion: 'no-drag' }}>
        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>
    </div>
  )
}

export default App
