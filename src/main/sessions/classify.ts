import type { ParsedSession } from './parseJsonl'
import type { SessionStatus } from './mockSource'
import { isToolAllowed } from './permissionChecker'

const ABORTED_THRESHOLD_MS = 5 * 60 * 1000 // 5분

export function classifyStatus(parsed: ParsedSession): SessionStatus {
  const { lastAssistant, interrupted, pendingToolResult, awaitingAssistant } = parsed

  // tool_result 없이 interrupted = 권한 거절
  if (interrupted && pendingToolResult) return 'waiting_permission'
  if (interrupted) return 'aborted'
  if (awaitingAssistant) return 'working'
  if (!lastAssistant) return 'done'

  const { stop_reason, timestamp } = lastAssistant
  const elapsed = Date.now() - new Date(timestamp).getTime()

  if (stop_reason === 'tool_use' || stop_reason === 'max_tokens') {
    if (elapsed > ABORTED_THRESHOLD_MS) return 'aborted'
    if (lastAssistant.lastToolName === 'AskUserQuestion') return 'waiting_permission'

    // settings.json allow 목록에 없는 tool이 pending → permission 대기
    if (pendingToolResult && lastAssistant.lastToolName) {
      const allowed = isToolAllowed({
        name: lastAssistant.lastToolName,
        input: lastAssistant.lastToolInput ?? {}
      })
      if (!allowed) return 'waiting_permission'
    }

    return 'working'
  }

  return 'done'
}
