import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { loadSettings } from '../settings'

interface ToolCall {
  name: string
  input: Record<string, unknown>
}

function parseAllowEntry(entry: string): { tool: string; pattern: string } | null {
  const paren = entry.indexOf('(')
  const colon = entry.indexOf(':')

  if (paren !== -1 && (colon === -1 || paren < colon)) {
    return {
      tool: entry.slice(0, paren),
      pattern: entry.slice(paren + 1, entry.endsWith(')') ? -1 : undefined)
    }
  }
  if (colon !== -1) {
    return { tool: entry.slice(0, colon), pattern: entry.slice(colon + 1) }
  }
  return { tool: entry, pattern: '*' }
}

function matchesPattern(pattern: string, value: string): boolean {
  if (pattern === '*') return true
  if (pattern.endsWith('*')) return value.startsWith(pattern.slice(0, -1))
  return value === pattern
}

function loadClaudeAllowList(): string[] {
  try {
    const settingsPath = path.join(os.homedir(), '.claude', 'settings.json')
    const raw = fs.readFileSync(settingsPath, 'utf-8')
    return JSON.parse(raw)?.permissions?.allow ?? []
  } catch {
    return []
  }
}

let cachedAllowList: Array<{ tool: string; pattern: string }> | null = null
let cacheTime = 0

function getClaudeAllowList(): Array<{ tool: string; pattern: string }> {
  if (!cachedAllowList || Date.now() - cacheTime > 60_000) {
    cachedAllowList = loadClaudeAllowList()
      .map(parseAllowEntry)
      .filter(Boolean) as Array<{ tool: string; pattern: string }>
    cacheTime = Date.now()
  }
  return cachedAllowList
}

export function invalidateAllowCache(): void {
  cachedAllowList = null
}

function matchesToolCall(entry: { tool: string; pattern: string }, tool: ToolCall): boolean {
  if (entry.tool !== tool.name) return false
  if (tool.name === 'Bash') {
    const cmd = (tool.input.command as string) ?? ''
    return matchesPattern(entry.pattern, cmd)
  }
  if (entry.pattern === '*') return true
  const filePath = (tool.input.file_path as string) ?? ''
  return matchesPattern(entry.pattern, filePath)
}

export function isToolAllowed(tool: ToolCall): boolean {
  return getClaudeAllowList().some((entry) => matchesToolCall(entry, tool))
}

export function isToolIgnoredForProject(tool: ToolCall, projectName: string): boolean {
  if (tool.name !== 'Bash') return false
  const cmd = (tool.input.command as string) ?? ''
  const { ignoredToolRules } = loadSettings()
  return ignoredToolRules
    .filter((r) => r.projectName === projectName)
    .some((r) => cmd.includes(r.pattern))
}

export function toolToPattern(_toolName: string, toolInput: Record<string, unknown>): string {
  return (toolInput.command as string) ?? ''
}
