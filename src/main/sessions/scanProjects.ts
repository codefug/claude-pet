import { readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { CLAUDE_PROJECTS_DIR } from '../../shared/claude-paths'
import { getLiveState } from '../live-status'
import { loadSettings } from '../settings'
import { ABORTED_THRESHOLD_MS, classifyStatus } from './classify'
import { decodeProjectPath } from './formatProject'
import { parseJsonl } from './parseJsonl'
import { toolToPattern } from './permissionChecker'
import type { SessionData } from './types'

const PROJECTS_DIR = CLAUDE_PROJECTS_DIR

export function scanProjects(): SessionData[] {
  let dirs: string[]
  try {
    dirs = readdirSync(PROJECTS_DIR)
  } catch {
    return []
  }

  const { sessionWindowHours, ignoredToolRules } = loadSettings()
  const cutoff = Date.now() - sessionWindowHours * 60 * 60 * 1000
  const sessions: SessionData[] = []

  for (const dir of dirs) {
    const dirPath = join(PROJECTS_DIR, dir)
    try {
      if (!statSync(dirPath).isDirectory()) continue
    } catch {
      continue
    }

    let files: string[]
    try {
      files = readdirSync(dirPath).filter((f) => f.endsWith('.jsonl'))
    } catch {
      continue
    }

    const projectPath = decodeProjectPath(dir)

    for (const file of files) {
      const filePath = join(dirPath, file)
      let mtime: number
      try {
        mtime = statSync(filePath).mtimeMs
      } catch {
        continue
      }

      if (mtime < cutoff) continue

      const parsed = parseJsonl(filePath)
      const projectName = parsed.cwd ? basename(parsed.cwd) : dir
      const lastMessageAt = parsed.lastMessageAt ?? new Date(mtime).toISOString()

      if (new Date(lastMessageAt).getTime() < cutoff) continue

      let status = classifyStatus(parsed)

      if (status === 'aborted') {
        const lastAt = new Date(lastMessageAt).getTime()
        if (Date.now() - lastAt > ABORTED_THRESHOLD_MS) continue
      }

      // ignoredToolRules 매칭 시 waiting_permission → working으로 override
      const live = parsed.sessionId ? getLiveState(parsed.sessionId) : undefined
      if (status === 'waiting_permission' && live?.pendingTool) {
        const pattern = toolToPattern(live.pendingTool.name, live.pendingTool.input)
        const ignored = ignoredToolRules.some(
          (r) => r.projectName === projectName && pattern.includes(r.pattern)
        )
        if (ignored) status = 'working'
      }

      const pendingTool =
        status === 'waiting_permission' && live?.pendingTool ? live.pendingTool : null

      sessions.push({
        id: `${dir}/${file}`,
        projectName,
        projectPath,
        status,
        lastMessageAt,
        summary: parsed.aiTitle ?? parsed.lastPrompt ?? null,
        pendingTool
      })
    }
  }

  return sessions
}
