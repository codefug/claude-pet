import type { SessionStatus } from './mockSource'
import type { ParsedSession } from './parseJsonl'
import { isToolAllowed, isToolIgnoredForProject } from './permissionChecker'

const ABORTED_THRESHOLD_MS = 5 * 60 * 1000

export function classifyStatus(parsed: ParsedSession, projectName: string): SessionStatus {
  const { lastAssistant, interrupted, pendingToolResult, awaitingAssistant } = parsed

  if (interrupted && pendingToolResult) return 'waiting_permission'
  if (interrupted) return 'aborted'
  if (awaitingAssistant) return 'working'
  if (!lastAssistant) return 'done'

  const { stop_reason, timestamp } = lastAssistant
  const elapsed = Date.now() - new Date(timestamp).getTime()

  if (elapsed > ABORTED_THRESHOLD_MS) return 'aborted'

  if (stop_reason === 'tool_use' || stop_reason === 'max_tokens') {
    if (lastAssistant.lastToolName === 'AskUserQuestion') return 'waiting_permission'
    if (pendingToolResult && lastAssistant.lastToolName) {
      const tool = { name: lastAssistant.lastToolName, input: lastAssistant.lastToolInput ?? {} }
      if (isToolAllowed(tool) || isToolIgnoredForProject(tool, projectName)) return 'working'
      return 'waiting_permission'
    }
    return 'working'
  }

  return 'done'
}
