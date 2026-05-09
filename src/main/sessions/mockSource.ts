import { BrowserWindow } from 'electron'

export type SessionStatus = 'working' | 'waiting_permission' | 'done' | 'aborted'

export interface SessionData {
  id: string
  projectName: string
  status: SessionStatus
  lastMessageAt: string
}

const STATUSES: SessionStatus[] = ['working', 'waiting_permission', 'done', 'aborted']

let tick = 0

export function makeSessions(): SessionData[] {
  return [
    {
      id: '1',
      projectName: 'claude-pet',
      status: STATUSES[tick % 4],
      lastMessageAt: new Date().toISOString()
    },
    {
      id: '2',
      projectName: 'my-next-app',
      status: STATUSES[(tick + 1) % 4],
      lastMessageAt: new Date().toISOString()
    },
    {
      id: '3',
      projectName: 'api-server',
      status: STATUSES[(tick + 2) % 4],
      lastMessageAt: new Date().toISOString()
    },
    {
      id: '4',
      projectName: 'old-project',
      status: STATUSES[(tick + 3) % 4],
      lastMessageAt: new Date().toISOString()
    }
  ]
}

export function startMockSource(win: BrowserWindow): void {
  setInterval(() => {
    tick++
    win.webContents.send('sessions-update', makeSessions())
  }, 5000)
}
