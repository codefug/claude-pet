import { getLiveState } from '../live-status'
import type { ParsedSession } from './parseJsonl'
import type { SessionStatus } from './types'

const ABORTED_THRESHOLD_MS = 5 * 60 * 1000

export function classifyStatus(parsed: ParsedSession): SessionStatus {
  // 1. Hook live state 우선
  if (parsed.sessionId) {
    const live = getLiveState(parsed.sessionId)
    if (live) {
      const elapsed = Date.now() - live.updatedAt
      if (live.status === 'done' && elapsed > ABORTED_THRESHOLD_MS) return 'aborted'
      return live.status
    }
  }

  // 2. 앱 시작 직후 hook 미수신 세션 — JSONL 기반 fallback
  const last = parsed.lastAssistant
  if (!last) return 'done'
  const elapsed = Date.now() - new Date(last.timestamp).getTime()
  if (elapsed > ABORTED_THRESHOLD_MS) return 'aborted'
  if (last.stop_reason === 'tool_use') return 'working'
  return 'done'
}
