import { contextBridge, ipcRenderer } from 'electron'
import type { SessionData } from '../main/sessions/mockSource'
import type { AppSettings } from '../main/settings'

const claudePet = {
  getSessions: (): Promise<SessionData[]> => ipcRenderer.invoke('get-sessions'),
  onSessionsUpdate: (cb: (sessions: SessionData[]) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, sessions: SessionData[]): void => cb(sessions)
    ipcRenderer.on('sessions-update', handler)
    return () => ipcRenderer.off('sessions-update', handler)
  },
  ignoreSession: (id: string): Promise<void> => ipcRenderer.invoke('ignore-session', id),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  setCharacterImage: (status: string): Promise<string | null> =>
    ipcRenderer.invoke('set-character-image', status),
  clearCharacterImage: (status: string): Promise<void> =>
    ipcRenderer.invoke('clear-character-image', status),
  setSessionWindow: (hours: number): Promise<void> =>
    ipcRenderer.invoke('set-session-window', hours)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('claudePet', claudePet)
  } catch (error) {
    console.error(error)
  }
} else {
  ;(window as any).claudePet = claudePet
}
