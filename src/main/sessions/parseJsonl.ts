import { readNewLines, resetOffset } from './tailReader'

interface AssistantMessage {
  stop_reason: string | null
  timestamp: string
  lastToolName: string | null
  lastToolInput: Record<string, unknown> | null
}

export interface ParsedSession {
  lastAssistant: AssistantMessage | null
  lastMessageAt: string | null
  aiTitle: string | null
  lastPrompt: string | null
  cwd: string | null
  interrupted: boolean
  pendingToolResult: boolean
  awaitingAssistant: boolean
}

const cache = new Map<string, ParsedSession>()

function applyLines(session: ParsedSession, lines: string[]): ParsedSession {
  let {
    lastAssistant,
    aiTitle,
    lastPrompt,
    cwd,
    interrupted,
    pendingToolResult,
    awaitingAssistant
  } = session

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
        const content = msg.content as Array<Record<string, unknown>> | undefined
        const lastTool = content?.filter((b) => b.type === 'tool_use').pop()
        lastAssistant = {
          stop_reason: msg.stop_reason as string | null,
          timestamp: entry.timestamp as string,
          lastToolName: (lastTool?.name as string) ?? null,
          lastToolInput: (lastTool?.input as Record<string, unknown>) ?? null
        }
        interrupted = false
        pendingToolResult = msg.stop_reason === 'tool_use'
        awaitingAssistant = false
      }
    }

    if (entry.type === 'user') {
      if (!cwd && typeof entry.cwd === 'string') cwd = entry.cwd

      const msg = entry.message as Record<string, unknown> | undefined
      const content = msg?.content
      if (Array.isArray(content)) {
        let hasToolResult = false
        let hasInterrupt = false
        let hasNormalText = false
        for (const block of content) {
          const b = block as Record<string, unknown>
          if (b.type === 'tool_result') hasToolResult = true
          if (b.type === 'text' && typeof b.text === 'string') {
            if (b.text.startsWith('[Request interrupted')) hasInterrupt = true
            else hasNormalText = true
          }
        }
        if (hasToolResult) pendingToolResult = false
        if (hasInterrupt) interrupted = true
        else if (hasNormalText) {
          interrupted = false
          awaitingAssistant = true
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
    cwd,
    interrupted,
    pendingToolResult,
    awaitingAssistant
  }
}

const EMPTY: ParsedSession = {
  lastAssistant: null,
  lastMessageAt: null,
  aiTitle: null,
  lastPrompt: null,
  cwd: null,
  interrupted: false,
  pendingToolResult: false,
  awaitingAssistant: false
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
