import { useSettingsStore } from '../store/settingsStore'

export type { CharacterImages } from '../../../shared/schemas/settings'

export function useCharacterImages() {
  const { images } = useSettingsStore()
  return { images }
}
