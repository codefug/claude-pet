import { contextBridge, ipcRenderer } from 'electron'
import type { SessionData } from '../main/sessions/mockSource'

const claudePet = {
  getSessions: (): Promise<SessionData[]> => ipcRenderer.invoke('get-sessions'),
  onSessionsUpdate: (cb: (sessions: SessionData[]) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, sessions: SessionData[]): void => cb(sessions)
    ipcRenderer.on('sessions-update', handler)
    return () => ipcRenderer.off('sessions-update', handler)
  }
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
