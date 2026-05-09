/// <reference types="vite/client" />

import 'react'
import type { SessionData } from '../../main/sessions/mockSource'
import type { AppSettings } from '../../main/settings'

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
      ignoreSession: (id: string) => Promise<void>
      getSettings: () => Promise<AppSettings>
      setCharacterImage: (status: string) => Promise<string | null>
      clearCharacterImage: (status: string) => Promise<void>
      setSessionWindow: (hours: number) => Promise<void>
    }
  }
}
