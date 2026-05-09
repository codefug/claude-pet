import type { ParsedSession } from './parseJsonl'
import type { SessionStatus } from './mockSource'

const ABORTED_THRESHOLD_MS = 5 * 60 * 1000 // 5분

export function classifyStatus(parsed: ParsedSession): SessionStatus {
  const { lastAssistant, interrupted } = parsed
  if (!lastAssistant) return 'done'

  if (interrupted) return 'aborted'

  const { stop_reason, timestamp } = lastAssistant
  const elapsed = Date.now() - new Date(timestamp).getTime()

  if (stop_reason === 'tool_use' || stop_reason === 'max_tokens') {
    return elapsed > ABORTED_THRESHOLD_MS ? 'aborted' : 'working'
  }

  return 'done'
}
