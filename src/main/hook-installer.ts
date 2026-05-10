import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import { CLAUDE_SETTINGS_FILE } from '../shared/claude-paths'
import { HOOK_EVENT } from '../shared/hook-events'

interface HookEntry {
  matcher: string
  hooks: Array<{ type: string; command: string; async: boolean; timeout: number }>
}

interface ClaudeSettings {
  hooks?: Record<string, HookEntry[]>
  [key: string]: unknown
}

const HOOK_EVENTS = Object.values(HOOK_EVENT)
const HOOK_TAG = 'claude-pet'
const HOOK_CLI_RELATIVE_PATH = ['hook-cli', 'index.js'] as const
const HOOK_TIMEOUT_SECONDS = 5

export function installHooks(): void {
  const cliCommand = resolveCliCommand()

  let settings: ClaudeSettings = {}
  try {
    settings = JSON.parse(readFileSync(CLAUDE_SETTINGS_FILE, 'utf-8')) as ClaudeSettings
  } catch {
    /* 파일 없으면 새로 생성 */
  }

  const hooks: Record<(typeof HOOK_EVENTS)[number], HookEntry[]> = settings.hooks ?? {}

  for (const event of HOOK_EVENTS) {
    const list: HookEntry[] = hooks[event] ?? []
    const filtered = list.filter((entry) => !entry.hooks.some((h) => h.command.includes(HOOK_TAG)))
    filtered.push({
      matcher: '*',
      hooks: [{ type: 'command', command: cliCommand, async: true, timeout: HOOK_TIMEOUT_SECONDS }]
    })
    hooks[event] = filtered
  }

  settings.hooks = hooks
  writeFileSync(CLAUDE_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8')
}

function resolveCliCommand(): string {
  const base = app.isPackaged ? process.resourcesPath : join(app.getAppPath(), 'out')
  const cliPath = join(base, ...HOOK_CLI_RELATIVE_PATH)
  return `node "${cliPath}"`
}
