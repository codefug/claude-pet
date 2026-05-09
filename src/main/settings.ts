import * as fs from 'node:fs'
import * as path from 'node:path'
import { app } from 'electron'

export interface IgnoredToolRule {
  projectName: string
  pattern: string
}

export interface AppSettings {
  sessionWindowHours: number
  ignoredToolRules: IgnoredToolRule[]
  characterImages: {
    working: string | null
    waiting_permission: string | null
    done: string | null
    aborted: string | null
    interrupted: string | null
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  sessionWindowHours: 5,
  ignoredToolRules: [],
  characterImages: {
    working: null,
    waiting_permission: null,
    done: null,
    aborted: null,
    interrupted: null
  }
}

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

export function loadSettings(): AppSettings {
  try {
    const raw = fs.readFileSync(getSettingsPath(), 'utf-8')
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8')
}
