export type SessionStatus = 'working' | 'waiting_permission' | 'done' | 'aborted'

export interface Session {
  id: string
  projectName: string
  projectPath: string
  status: SessionStatus
  lastMessageAt: Date
  summary: string | null
}
