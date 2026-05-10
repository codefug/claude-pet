import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNEL } from '../shared/ipc-channels'
import type { SessionData } from '../shared/schemas/session'
import type { AppSettings, IgnoredToolRule } from '../shared/schemas/settings'

const claudePet = {
  getSessions: (): Promise<SessionData[]> => ipcRenderer.invoke(IPC_CHANNEL.GET_SESSIONS),
  onSessionsUpdate: (cb: (sessions: SessionData[]) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, sessions: SessionData[]): void => cb(sessions)
    ipcRenderer.on(IPC_CHANNEL.SESSIONS_UPDATE, handler)
    return () => ipcRenderer.off(IPC_CHANNEL.SESSIONS_UPDATE, handler)
  },
  ignoreSession: (
    projectName: string,
    toolName: string,
    toolInput: Record<string, unknown>
  ): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNEL.IGNORE_SESSION, projectName, toolName, toolInput),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC_CHANNEL.GET_SETTINGS),
  setCharacterImage: (status: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNEL.SET_CHARACTER_IMAGE, status),
  clearCharacterImage: (status: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNEL.CLEAR_CHARACTER_IMAGE, status),
  setSessionWindow: (hours: number): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNEL.SET_SESSION_WINDOW, hours),
  setIgnoredToolRules: (rules: IgnoredToolRule[]): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNEL.SET_IGNORED_TOOL_RULES, rules)
}

contextBridge.exposeInMainWorld('claudePet', claudePet)
