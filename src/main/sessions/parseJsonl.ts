import { readFileSync } from 'fs'

interface AssistantMessage {
  stop_reason: string | null
  timestamp: string
}

export interface ParsedSession {
  lastAssistant: AssistantMessage | null
  lastMessageAt: string | null
  aiTitle: string | null
  lastPrompt: string | null
}

export function parseJsonl(filePath: string): ParsedSession {
  let content: string
  try {
    content = readFileSync(filePath, 'utf-8')
  } catch {
    return { lastAssistant: null, lastMessageAt: null, aiTitle: null, lastPrompt: null }
  }

  const lines = content.split('\n').filter(Boolean)
  let lastAssistant: AssistantMessage | null = null
  let aiTitle: string | null = null
  let lastPrompt: string | null = null

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
    lastPrompt
  }
}
