import ElectronStoreModule from 'electron-store'
const ElectronStore =
  (ElectronStoreModule as unknown as { default: typeof ElectronStoreModule }).default ??
  ElectronStoreModule
import { AppSettingsSchema } from '../shared/schemas/settings'
import type { AppSettings } from '../shared/schemas/settings'

const DEFAULTS: AppSettings = {
  sessionWindowHours: 5,
  ignoredToolRules: [],
  characterImages: { working: null, waiting_permission: null, done: null, aborted: null }
}

const store = new ElectronStore<AppSettings>({
  schema: {
    sessionWindowHours: { type: 'number', default: DEFAULTS.sessionWindowHours },
    ignoredToolRules: { type: 'array', default: DEFAULTS.ignoredToolRules },
    characterImages: {
      type: 'object',
      properties: {
        working: { type: ['string', 'null'], default: null },
        waiting_permission: { type: ['string', 'null'], default: null },
        done: { type: ['string', 'null'], default: null },
        aborted: { type: ['string', 'null'], default: null }
      },
      default: DEFAULTS.characterImages
    }
  },
  migrations: {}
})

export function loadSettings(): AppSettings {
  const raw = store.store
  const merged = {
    ...DEFAULTS,
    ...raw,
    characterImages: { ...DEFAULTS.characterImages, ...raw.characterImages }
  }
  const result = AppSettingsSchema.safeParse(merged)
  return result.success ? result.data : DEFAULTS
}

export function saveSettings(settings: AppSettings): void {
  store.set(settings)
}
