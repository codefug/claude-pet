import type { ParsedSession } from './parseJsonl'
import type { SessionStatus } from './mockSource'

const ABORTED_THRESHOLD_MS = 5 * 60 * 1000 // 5분
const PERMISSION_THRESHOLD_MS = 30 * 1000 // 30초

export function classifyStatus(parsed: ParsedSession): SessionStatus {
  const { lastAssistant, interrupted, pendingToolResult } = parsed
  if (!lastAssistant) return 'done'

  if (interrupted) return 'aborted'

  const { stop_reason, timestamp } = lastAssistant
  const elapsed = Date.now() - new Date(timestamp).getTime()

  if (stop_reason === 'tool_use' || stop_reason === 'max_tokens') {
    if (elapsed > ABORTED_THRESHOLD_MS) return 'aborted'
    if (lastAssistant.lastToolName === 'AskUserQuestion') return 'waiting_permission'
    if (pendingToolResult && elapsed > PERMISSION_THRESHOLD_MS) return 'waiting_permission'
    return 'working'
  }

  return 'done'
}
