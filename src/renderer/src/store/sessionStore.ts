import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { SessionDataArraySchema } from '../../../shared/schemas/session'
import type { Session } from '../../../shared/schemas/session'
import { queryKeys } from '../lib/queryClient'
import { sortSessions } from '../utils/sortSessions'

function parseAndSort(raw: unknown): Session[] {
  const result = SessionDataArraySchema.safeParse(raw)
  if (!result.success) throw new Error(result.error.message)
  return sortSessions(result.data.map((s) => ({ ...s, lastMessageAt: new Date(s.lastMessageAt) })))
}

export function useSessions() {
  const qc = useQueryClient()

  const { data: sessions } = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: async () => {
      // 구독 후 도착한 최신 데이터가 이미 캐시에 있으면 덮어쓰지 않음
      const cached = qc.getQueryData<Session[]>(queryKeys.sessions)
      if (cached) return cached
      return window.claudePet.getSessions().then(parseAndSort)
    },
    initialData: []
  })

  useEffect(() => {
    return window.claudePet.onSessionsUpdate((data) => {
      try {
        qc.setQueryData(queryKeys.sessions, parseAndSort(data))
      } catch (err) {
        console.error('[sessions] IPC payload parse failed:', err)
      }
    })
  }, [qc])

  const ignoreSession = (session: Session) => {
    if (!session.pendingTool) return
    window.claudePet.ignoreSession(
      session.projectName,
      session.pendingTool.name,
      session.pendingTool.input
    )
    qc.setQueryData(queryKeys.sessions, (prev: Session[] = []) =>
      sortSessions(
        prev.map((s) => (s.id === session.id ? { ...s, status: 'working' as const } : s))
      )
    )
  }

  return { sessions, ignoreSession }
}
