export type SessionStatus = 'working' | 'waiting_permission' | 'done' | 'aborted'

export interface Session {
  id: string
  projectName: string
  status: SessionStatus
  lastMessageAt: Date
}
