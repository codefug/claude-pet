import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import type { SessionData } from './mockSource'
import { parseJsonl } from './parseJsonl'
import { classifyStatus } from './classify'
import { loadSettings } from '../settings'

const PROJECTS_DIR = join(homedir(), '.claude', 'projects')

function decodeProjectDir(dirName: string): string {
  return dirName.replace(/-/g, '/').replace(/^\//, '')
}

function projectName(decoded: string): string {
  const parts = decoded.split('/')
  return parts[parts.length - 1] || decoded
}

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

    const decoded = decodeProjectDir(dir)
    const name = projectName(decoded)

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
      const lastMessageAt = parsed.lastMessageAt ?? new Date(mtime).toISOString()

      // 실제 마지막 메시지 시각 기준으로 5시간 필터 재적용
      if (new Date(lastMessageAt).getTime() < cutoff) continue

      const status = classifyStatus(parsed)
      const summary = parsed.aiTitle ?? parsed.lastPrompt ?? null

      sessions.push({
        id: `${dir}/${file}`,
        projectName: name,
        projectPath: decoded,
        status,
        lastMessageAt,
        summary
      })
    }
  }

  return sessions
}
