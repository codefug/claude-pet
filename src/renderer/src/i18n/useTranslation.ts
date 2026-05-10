import { useSettingsLanguage } from '../store/settingsStore'
import { translations } from './translations'

export function useTranslation() {
  const language = useSettingsLanguage()
  return translations[language]
}
