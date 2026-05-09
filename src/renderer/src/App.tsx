import { useState, useEffect, useCallback } from 'react'
import SessionCard from './components/SessionCard'
import SettingsPanel from './components/SettingsPanel'
import { sortSessions } from './utils/sortSessions'
import type { Session, SessionStatus } from './types'
import type { SessionData } from '../../main/sessions/mockSource'

function App(): React.JSX.Element {
  const [sessions, setSessions] = useState<Session[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [characterImages, setCharacterImages] = useState<Record<SessionStatus, string | null>>({
    working: null,
    waiting_permission: null,
    done: null,
    aborted: null,
    interrupted: null
  })

  const update = useCallback((data: SessionData[]): void => {
    setSessions(
      sortSessions(
        data.map((s) => ({ ...s, lastMessageAt: new Date(s.lastMessageAt), pendingTool: s.pendingTool ?? null }))
      )
    )
  }, [])

  useEffect(() => {
    window.claudePet.getSessions().then(update)
    return window.claudePet.onSessionsUpdate(update)
  }, [update])

  useEffect(() => {
    window.claudePet.getSettings().then((s) => setCharacterImages(s.characterImages))
  }, [])

  const handleIgnore = useCallback((session: Session): void => {
    if (!session.pendingTool) return
    window.claudePet.ignoreSession(session.projectName, session.pendingTool.name, session.pendingTool.input)
    setSessions((prev) =>
      sortSessions(prev.map((s) => (s.id === session.id ? { ...s, status: 'working' } : s)))
    )
  }, [])

  const handleSettingsClose = useCallback((): void => {
    setShowSettings(false)
    window.claudePet.getSettings().then((s) => setCharacterImages(s.characterImages))
  }, [])

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
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {showSettings && (
        <SettingsPanel
          onClose={handleSettingsClose}
          onImagesChange={(imgs) => setCharacterImages(imgs)}
        />
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
          paddingTop: '4px',
          paddingBottom: '8px',
          WebkitAppRegion: 'drag',
          cursor: 'grab'
        }}
      >
        <div
          style={{
            flex: 1,
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            paddingLeft: '2px'
          }}
        >
          Claude Sessions
        </div>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            WebkitAppRegion: 'no-drag',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0 2px',
            lineHeight: 1
          }}
          title="설정"
        >
          ⚙️
        </button>
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
          sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              onIgnore={handleIgnore}
              customImage={characterImages[s.status]}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default App
