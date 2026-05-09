import { BrowserWindow } from 'electron'

export type SessionStatus = 'working' | 'waiting_permission' | 'done' | 'aborted'

export interface SessionData {
  id: string
  projectName: string
  projectPath: string
  status: SessionStatus
  lastMessageAt: string
  summary: string | null
}

export function startMockSource(win: BrowserWindow, getSessions: () => SessionData[]): void {
  setInterval(() => {
    win.webContents.send('sessions-update', getSessions())
  }, 5000)
}
