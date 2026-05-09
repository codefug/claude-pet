import type { Session, SessionStatus } from '../types'

const PRIORITY: Record<SessionStatus, number> = {
  waiting_permission: 0,
  working: 1,
  done: 2,
  aborted: 3
}

export function sortSessions(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => {
    const pd = PRIORITY[a.status] - PRIORITY[b.status]
    if (pd !== 0) return pd
    return b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  })
}
