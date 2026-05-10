import { readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { CLAUDE_PROJECTS_DIR } from '../../shared/claude-paths'
import type { SessionData } from '../../shared/schemas/session'
import { getLiveState } from '../live-status'
import { loadSettings } from '../settings'
import { ABORTED_THRESHOLD_MS, classifyStatus } from './classify'
import { decodeProjectPath } from './formatProject'
import { parseJsonl } from './parseJsonl'

function safeReadDir(path: string): string[] {
  try { return readdirSync(path) } catch { return [] }
}

function safeMtimeMs(path: string): number {
  try { return statSync(path).mtimeMs } catch { return 0 }
}

function isDir(path: string): boolean {
  try { return statSync(path).isDirectory() } catch { return false }
}

export function scanProjects(): SessionData[] {
  const { sessionWindowHours } = loadSettings()
  const cutoff = Date.now() - sessionWindowHours * 60 * 60 * 1000

  return safeReadDir(CLAUDE_PROJECTS_DIR).flatMap((dir) => {
    const dirPath = join(CLAUDE_PROJECTS_DIR, dir)
    if (!isDir(dirPath)) return []

    const projectPath = decodeProjectPath(dir)

    return safeReadDir(dirPath)
      .filter((f) => f.endsWith('.jsonl'))
      .flatMap((file) => {
        const filePath = join(dirPath, file)
        if (safeMtimeMs(filePath) < cutoff) return []

        const parsed = parseJsonl(filePath)
        const lastMessageAt = parsed.lastMessageAt ?? new Date(safeMtimeMs(filePath)).toISOString()
        if (new Date(lastMessageAt).getTime() < cutoff) return []

        const status = classifyStatus(parsed)
        if (status === 'aborted' && Date.now() - new Date(lastMessageAt).getTime() > ABORTED_THRESHOLD_MS) return []

        const live = parsed.sessionId ? getLiveState(parsed.sessionId) : undefined
        const pendingTool = status === 'waiting_permission' && live?.pendingTool ? live.pendingTool : null

        return [{
          id: `${dir}/${file}`,
          projectName: parsed.cwd ? basename(parsed.cwd) : dir,
          projectPath,
          status,
          lastMessageAt,
          summary: parsed.aiTitle ?? parsed.lastPrompt ?? null,
          pendingTool
        }]
      })
  })
}
