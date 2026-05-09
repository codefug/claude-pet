import { readdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import { loadSettings } from '../settings'
import { classifyStatus } from './classify'
import { decodeProjectPath } from './formatProject'
import type { SessionData } from './mockSource'
import { parseJsonl } from './parseJsonl'

const PROJECTS_DIR = join(homedir(), '.claude', 'projects')

export function scanProjects(): SessionData[] {
  let dirs: string[]
  try {
    dirs = readdirSync(PROJECTS_DIR)
  } catch {
    return []
  }

  const { sessionWindowHours } = loadSettings()
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

      const status = classifyStatus(parsed, projectName)

      if (status === 'aborted') {
        const lastAt = new Date(lastMessageAt).getTime()
        if (Date.now() - lastAt > 5 * 60 * 1000) continue
      }

      const pendingTool =
        status === 'waiting_permission' && parsed.lastAssistant?.lastToolName
          ? {
              name: parsed.lastAssistant.lastToolName,
              input: parsed.lastAssistant.lastToolInput ?? {}
            }
          : null

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
