import { useCallback, useEffect, useState } from 'react'
import type { SessionData } from '../../../main/sessions/types'
import type { Session } from '../types'
import { sortSessions } from '../utils/sortSessions'

function toSession(s: SessionData): Session {
  return {
    ...s,
    lastMessageAt: new Date(s.lastMessageAt),
    pendingTool: s.pendingTool ?? null
  }
}

export function useSessions(): {
  sessions: Session[]
  handleIgnore: (session: Session) => void
} {
  const [sessions, setSessions] = useState<Session[]>([])

  const update = useCallback((data: SessionData[]): void => {
    setSessions(sortSessions(data.map(toSession)))
  }, [])

  useEffect(() => {
    window.claudePet.getSessions().then(update)
    return window.claudePet.onSessionsUpdate(update)
  }, [update])

  const handleIgnore = useCallback((session: Session): void => {
    if (!session.pendingTool) return
    window.claudePet.ignoreSession(
      session.projectName,
      session.pendingTool.name,
      session.pendingTool.input
    )
    setSessions((prev) =>
      sortSessions(prev.map((s) => (s.id === session.id ? { ...s, status: 'working' } : s)))
    )
  }, [])

  return { sessions, handleIgnore }
}
