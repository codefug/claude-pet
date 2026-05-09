export type SessionStatus = 'working' | 'waiting_permission' | 'done' | 'aborted'

export interface PendingTool {
  name: string
  input: Record<string, unknown>
}

export interface Session {
  id: string
  projectName: string
  projectPath: string
  status: SessionStatus
  lastMessageAt: Date
  summary: string | null
  pendingTool: PendingTool | null
}
