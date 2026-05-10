import type { PendingTool, SessionStatus } from '../shared/schemas/session'

export interface LiveState {
  status: Exclude<SessionStatus, 'aborted'>
  pendingTool?: PendingTool
  cwd?: string
  updatedAt: number
}

const liveStatus = new Map<string, LiveState>()

export function getLiveState(sessionId: string): LiveState | undefined {
  return liveStatus.get(sessionId)
}

export function setLiveState(sessionId: string, state: LiveState): void {
  liveStatus.set(sessionId, state)
}
