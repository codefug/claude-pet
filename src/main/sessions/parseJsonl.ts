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
}

const cache = new Map<string, ParsedSession>()

function applyLines(session: ParsedSession, lines: string[]): ParsedSession {
  let { sessionId, lastAssistant, aiTitle, lastPrompt, cwd } = session

  for (const line of lines) {
    let entry: Record<string, unknown>
    try {
      entry = JSON.parse(line)
    } catch {
      continue
    }

    if (!sessionId && typeof entry.sessionId === 'string') {
      sessionId = entry.sessionId
    }

    if (entry.type === 'assistant') {
      const msg = entry.message
      if (msg !== null && typeof msg === 'object' && !Array.isArray(msg)) {
        const { stop_reason } = msg as Record<string, unknown>
        if (stop_reason !== undefined && typeof entry.timestamp === 'string') {
          lastAssistant = {
            stop_reason: typeof stop_reason === 'string' ? stop_reason : null,
            timestamp: entry.timestamp
          }
        }
      }
    }

    if (entry.type === 'user') {
      if (!cwd && typeof entry.cwd === 'string') cwd = entry.cwd
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
    cwd
  }
}

const EMPTY: ParsedSession = {
  sessionId: null,
  lastAssistant: null,
  lastMessageAt: null,
  aiTitle: null,
  lastPrompt: null,
  cwd: null
}

export function parseJsonl(filePath: string): ParsedSession {
  const newLines = readNewLines(filePath)
  if (newLines.length === 0) return cache.get(filePath) ?? EMPTY

  const base = cache.get(filePath) ?? EMPTY
  const updated = applyLines(base, newLines)
  cache.set(filePath, updated)
  return updated
}

export function invalidateCache(filePath: string): void {
  cache.delete(filePath)
  resetOffset(filePath)
}
