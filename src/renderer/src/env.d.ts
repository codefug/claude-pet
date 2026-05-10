/// <reference types="vite/client" />

import 'react'
import type { SessionData } from '../../shared/schemas/session'
import type { AppSettings, Language } from '../../shared/schemas/settings'

declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag'
  }
}

declare global {
  interface Window {
    claudePet: {
      getSessions: () => Promise<SessionData[]>
      onSessionsUpdate: (cb: (sessions: SessionData[]) => void) => () => void
      getSettings: () => Promise<AppSettings>
      setCharacterImage: (status: string) => Promise<string | null>
      clearCharacterImage: (status: string) => Promise<void>
      setSessionWindow: (hours: number) => Promise<void>
      getLoginItem: () => Promise<boolean>
      setLoginItem: (openAtLogin: boolean) => Promise<void>
      setOpacity: (opacity: number) => Promise<void>
      openPath: (path: string) => Promise<void>
      setLanguage: (language: Language) => Promise<void>
    }
  }
}
