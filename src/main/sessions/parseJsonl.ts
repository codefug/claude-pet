import { readNewLines, resetOffset } from './tailReader'

interface AssistantMessage {
  stop_reason: string | null
  timestamp: string
}

export interface ParsedSession {
  sessionId: string | null
  lastAssistant: AssistantMessage | null
  lastMessageAt: string | null
  aiTitle: string | null
  lastPrompt: string | null
  cwd: string | null
  hasToolResultAfterLastAssistant: boolean
}

const EMPTY: ParsedSession = {
  sessionId: null,
  lastAssistant: null,
  lastMessageAt: null,
  aiTitle: null,
  lastPrompt: null,
  cwd: null,
  hasToolResultAfterLastAssistant: false
}

const cache = new Map<string, ParsedSession>()

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function hasToolResult(content: unknown): boolean {
  return Array.isArray(content) &&
    content.some((c) => isObject(c) && c.type === 'tool_result')
}

function applyLines(session: ParsedSession, lines: string[]): ParsedSession {
  let { sessionId, lastAssistant, aiTitle, lastPrompt, cwd } = session
  let hasToolResultAfterLastAssistant = session.hasToolResultAfterLastAssistant

  for (const line of lines) {
    let entry: Record<string, unknown>
    try { entry = JSON.parse(line) } catch { continue }

    if (!sessionId && typeof entry.sessionId === 'string') {
      sessionId = entry.sessionId
    }

    if (entry.type === 'assistant' && isObject(entry.message)) {
      const { stop_reason } = entry.message
      if (stop_reason !== undefined && typeof entry.timestamp === 'string') {
        lastAssistant = {
          stop_reason: typeof stop_reason === 'string' ? stop_reason : null,
          timestamp: entry.timestamp
        }
        hasToolResultAfterLastAssistant = false
      }
    }

    if (entry.type === 'user') {
      if (!cwd && typeof entry.cwd === 'string') cwd = entry.cwd
      const content = isObject(entry.message) ? entry.message.content : entry.content
      if (hasToolResult(content)) hasToolResultAfterLastAssistant = true
    }

    if (entry.type === 'ai-title' && typeof entry.aiTitle === 'string') {
      aiTitle = entry.aiTitle
    }

    if (entry.type === 'last-prompt' && typeof entry.lastPrompt === 'string') {
      lastPrompt = entry.lastPrompt
    }
  }

  return {
    sessionId,
    lastAssistant,
    lastMessageAt: lastAssistant?.timestamp ?? null,
    aiTitle,
    lastPrompt,
    cwd,
    hasToolResultAfterLastAssistant
  }
}

export function parseJsonl(filePath: string): ParsedSession {
  const newLines = readNewLines(filePath)
  if (newLines.length === 0) return cache.get(filePath) ?? EMPTY

  const updated = applyLines(cache.get(filePath) ?? EMPTY, newLines)
  cache.set(filePath, updated)
  return updated
}

export function invalidateCache(filePath: string): void {
  cache.delete(filePath)
  resetOffset(filePath)
}
