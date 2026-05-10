import type { SessionStatus } from '../../shared/schemas/session'
import { getLiveState } from '../live-status'
import type { ParsedSession } from './parseJsonl'

export const ABORTED_THRESHOLD_MS = 5 * 60 * 1000

export function classifyStatus(parsed: ParsedSession): SessionStatus {
  if (parsed.sessionId) {
    const live = getLiveState(parsed.sessionId)
    if (live) {
      if (live.status === 'done' && Date.now() - live.updatedAt > ABORTED_THRESHOLD_MS) return 'aborted'
      // PermissionDenied hook이 항상 오지 않아 tool_result로 fallback
      if (live.status === 'waiting_permission' && parsed.hasToolResultAfterLastAssistant) return 'done'
      return live.status
    }
  }

  // hook 미수신 세션 — JSONL 기반 fallback
  const last = parsed.lastAssistant
  if (!last) return 'done'
  if (Date.now() - new Date(last.timestamp).getTime() > ABORTED_THRESHOLD_MS) return 'aborted'
  if (last.stop_reason === 'tool_use' && !parsed.hasToolResultAfterLastAssistant) return 'working'
  return 'done'
}
