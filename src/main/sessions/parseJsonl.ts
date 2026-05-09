import { readNewLines, resetOffset } from './tailReader'

interface AssistantMessage {
  stop_reason: string | null
  timestamp: string
}

export interface ParsedSession {
  lastAssistant: AssistantMessage | null
  lastMessageAt: string | null
  aiTitle: string | null
  lastPrompt: string | null
  interrupted: boolean
}

const cache = new Map<string, ParsedSession>()

function applyLines(session: ParsedSession, lines: string[]): ParsedSession {
  let { lastAssistant, aiTitle, lastPrompt, interrupted } = session

  for (const line of lines) {
    let entry: Record<string, unknown>
    try {
      entry = JSON.parse(line)
    } catch {
      continue
    }

    if (entry.type === 'assistant') {
      const msg = entry.message as Record<string, unknown> | undefined
      if (msg?.stop_reason !== undefined) {
        lastAssistant = {
          stop_reason: msg.stop_reason as string | null,
          timestamp: entry.timestamp as string
        }
        interrupted = false
      }
    }

    if (entry.type === 'user') {
      const msg = entry.message as Record<string, unknown> | undefined
      const content = msg?.content
      if (Array.isArray(content)) {
        for (const block of content) {
          const b = block as Record<string, unknown>
          if (b.type === 'text' && typeof b.text === 'string') {
            if (b.text.startsWith('[Request interrupted')) {
              interrupted = true
            } else {
              interrupted = false
            }
          }
        }
      }
    }

    if (entry.type === 'ai-title' && typeof entry.aiTitle === 'string') {
      aiTitle = entry.aiTitle
    }

    if (entry.type === 'last-prompt' && typeof entry.lastPrompt === 'string') {
      lastPrompt = entry.lastPrompt
    }
  }

  return {
    lastAssistant,
    lastMessageAt: lastAssistant?.timestamp ?? null,
    aiTitle,
    lastPrompt,
    interrupted
  }
}

const EMPTY: ParsedSession = {
  lastAssistant: null,
  lastMessageAt: null,
  aiTitle: null,
  lastPrompt: null,
  interrupted: false
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
