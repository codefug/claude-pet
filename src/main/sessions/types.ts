export type SessionStatus = 'working' | 'waiting_permission' | 'done' | 'aborted' | 'interrupted'

export interface PendingTool {
  name: string
  input: Record<string, unknown>
}

export interface SessionData {
  id: string
  projectName: string
  projectPath: string
  status: SessionStatus
  lastMessageAt: string
  summary: string | null
  pendingTool: PendingTool | null
}
