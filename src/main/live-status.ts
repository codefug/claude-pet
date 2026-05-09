export interface LiveState {
  status: 'working' | 'waiting_permission' | 'done'
  pendingTool?: { name: string; input: Record<string, unknown> }
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

export function getLiveStateForSession(sessionId: string): LiveState | undefined {
  return liveStatus.get(sessionId)
}
