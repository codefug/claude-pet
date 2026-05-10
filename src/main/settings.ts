import { Conf } from 'electron-conf/main'
import { AppSettingsSchema } from '../shared/schemas/settings'
import type { AppSettings } from '../shared/schemas/settings'

const DEFAULTS: AppSettings = {
  sessionWindowHours: 5,
  opacity: 0.75,
  characterImages: { working: null, waiting_permission: null, done: null, aborted: null }
}

const conf = new Conf<AppSettings>({ defaults: DEFAULTS })

export function loadSettings(): AppSettings {
  const raw = conf.store
  const merged = {
    ...DEFAULTS,
    ...raw,
    characterImages: { ...DEFAULTS.characterImages, ...raw.characterImages }
  }
  const result = AppSettingsSchema.safeParse(merged)
  return result.success ? result.data : DEFAULTS
}

export function saveSettings(settings: AppSettings): void {
  conf.set(settings)
}
