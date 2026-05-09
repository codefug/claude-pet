import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { app } from 'electron'

const HOOK_EVENTS = [
  'PreToolUse',
  'PostToolUse',
  'PermissionRequest',
  'PermissionDenied',
  'Notification',
  'Stop',
  'StopFailure',
  'SessionStart',
  'SessionEnd'
] as const

// 우리 hook 엔트리를 식별하기 위한 마커
const HOOK_TAG = 'claude-pet'

export function installHooks(): void {
  const cliCommand = resolveCliCommand()
  const settingsPath = join(homedir(), '.claude', 'settings.json')

  let settings: Record<string, unknown> = {}
  try {
    settings = JSON.parse(readFileSync(settingsPath, 'utf-8'))
  } catch {
    /* 파일 없으면 새로 생성 */
  }

  const hooks = (settings.hooks as Record<string, unknown[]>) ?? {}

  for (const event of HOOK_EVENTS) {
    const list = (hooks[event] as Array<Record<string, unknown>>) ?? []
    // 기존 claude-pet hook만 제거 후 재등록 (CLI 경로 갱신 케이스)
    const filtered = list.filter((entry) => {
      const handlers = entry.hooks as Array<Record<string, unknown>> | undefined
      return !handlers?.some((h) => (h.command as string | undefined)?.includes(HOOK_TAG))
    })
    filtered.push({
      matcher: '*',
      hooks: [{ type: 'command', command: cliCommand, async: true, timeout: 5 }]
    })
    hooks[event] = filtered
  }

  settings.hooks = hooks
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
}

function resolveCliCommand(): string {
  if (app.isPackaged) {
    // 패키지 앱: extraResources로 번들된 hook-cli 사용
    const cliPath = join(process.resourcesPath, 'hook-cli', 'index.js')
    return `node "${cliPath}"`
  }
  // 개발 모드: out/hook-cli/index.js
  const cliPath = join(app.getAppPath(), 'out', 'hook-cli', 'index.js')
  return `node "${cliPath}"`
}
