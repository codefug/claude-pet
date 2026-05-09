import { useSessions as useSessionStore } from '../store/sessionStore'

export function useSessions() {
  const { sessions, ignoreSession } = useSessionStore()
  return { sessions, handleIgnore: ignoreSession }
}
