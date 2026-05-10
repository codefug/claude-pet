import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNEL } from '../shared/ipc-channels'
import type { SessionData } from '../shared/schemas/session'
import type { AppSettings } from '../shared/schemas/settings'

const claudePet = {
  getSessions: (): Promise<SessionData[]> => ipcRenderer.invoke(IPC_CHANNEL.GET_SESSIONS),
  onSessionsUpdate: (cb: (sessions: SessionData[]) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, sessions: SessionData[]): void => cb(sessions)
    ipcRenderer.on(IPC_CHANNEL.SESSIONS_UPDATE, handler)
    return () => ipcRenderer.off(IPC_CHANNEL.SESSIONS_UPDATE, handler)
  },
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC_CHANNEL.GET_SETTINGS),
  setCharacterImage: (status: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNEL.SET_CHARACTER_IMAGE, status),
  clearCharacterImage: (status: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNEL.CLEAR_CHARACTER_IMAGE, status),
  setSessionWindow: (hours: number): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNEL.SET_SESSION_WINDOW, hours),
  getLoginItem: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNEL.GET_LOGIN_ITEM),
  setLoginItem: (openAtLogin: boolean): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNEL.SET_LOGIN_ITEM, openAtLogin),
  setOpacity: (opacity: number): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNEL.SET_OPACITY, opacity),
  openPath: (path: string): Promise<void> => ipcRenderer.invoke(IPC_CHANNEL.OPEN_PATH, path)
}

contextBridge.exposeInMainWorld('claudePet', claudePet)
