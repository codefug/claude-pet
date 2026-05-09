import type { ElectronAPI } from '@electron-toolkit/preload'
import type { SessionData } from '../shared/schemas/session'
import type { AppSettings, IgnoredToolRule } from '../shared/schemas/settings'

declare global {
  interface Window {
    electron: ElectronAPI
    api: Record<string, never>
    claudePet: {
      getSessions: () => Promise<SessionData[]>
      onSessionsUpdate: (cb: (sessions: SessionData[]) => void) => () => void
      ignoreSession: (
        projectName: string,
        toolName: string,
        toolInput: Record<string, unknown>
      ) => Promise<void>
      getSettings: () => Promise<AppSettings>
      setCharacterImage: (status: string) => Promise<string | null>
      clearCharacterImage: (status: string) => Promise<void>
      setSessionWindow: (hours: number) => Promise<void>
      setIgnoredToolRules: (rules: IgnoredToolRule[]) => Promise<void>
    }
  }
}
