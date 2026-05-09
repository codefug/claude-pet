import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

export interface AppSettings {
  sessionWindowHours: number
  characterImages: {
    working: string | null
    waiting_permission: string | null
    done: string | null
    aborted: string | null
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  sessionWindowHours: 5,
  characterImages: {
    working: null,
    waiting_permission: null,
    done: null,
    aborted: null
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
