/// <reference types="vite/client" />

import 'react'
import type { SessionData } from '../../main/sessions/mockSource'

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
    }
  }
}
