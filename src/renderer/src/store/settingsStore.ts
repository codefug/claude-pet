import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SessionStatus } from '../../../shared/schemas/session'
import { AppSettingsSchema } from '../../../shared/schemas/settings'
import type { AppSettings, Language } from '../../../shared/schemas/settings'
import { EMPTY_SETTINGS, makeOptimisticOptions } from '../lib/optimisticOptions'
import { queryKeys } from '../lib/queryClient'

export function useSettingsStore() {
  const qc = useQueryClient()

  const { data: settings = EMPTY_SETTINGS } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () =>
      window.claudePet.getSettings().then((raw) => {
        const result = AppSettingsSchema.safeParse(raw)
        if (!result.success) throw new Error(result.error.message)
        return result.data
      })
  })

  const getSettings = () => qc.getQueryData<AppSettings>(queryKeys.settings)
  const setSettings = (data: AppSettings) => qc.setQueryData(queryKeys.settings, data)
  const reconcile = () => qc.invalidateQueries({ queryKey: queryKeys.settings })

  const windowMutation = useMutation({
    mutationFn: (hours: number) => window.claudePet.setSessionWindow(hours),
    ...makeOptimisticOptions({
      getQueryData: getSettings,
      setQueryData: setSettings,
      updater: (s, hours) => ({ ...s, sessionWindowHours: hours }),
      reconcile
    })
  })

  const opacityMutation = useMutation({
    mutationFn: (opacity: number) => window.claudePet.setOpacity(opacity),
    ...makeOptimisticOptions({
      getQueryData: getSettings,
      setQueryData: setSettings,
      updater: (s, opacity) => ({ ...s, opacity }),
      reconcile
    })
  })

  const pickMutation = useMutation({
    mutationFn: (status: SessionStatus) => window.claudePet.setCharacterImage(status),
    onSuccess: (dataUrl, status) => {
      if (dataUrl)
        setSettings({
          ...settings,
          characterImages: { ...settings.characterImages, [status]: dataUrl }
        })
    },
    onSettled: reconcile
  })

  const clearMutation = useMutation({
    mutationFn: (status: SessionStatus) => window.claudePet.clearCharacterImage(status),
    ...makeOptimisticOptions({
      getQueryData: getSettings,
      setQueryData: setSettings,
      updater: (s, status) => ({ ...s, characterImages: { ...s.characterImages, [status]: null } }),
      reconcile
    })
  })

  const languageMutation = useMutation({
    mutationFn: (language: Language) => window.claudePet.setLanguage(language),
    ...makeOptimisticOptions({
      getQueryData: getSettings,
      setQueryData: setSettings,
      updater: (s, language) => ({ ...s, language }),
      reconcile
    })
  })

  return {
    images: settings.characterImages,
    sessionWindowHours: settings.sessionWindowHours,
    opacity: settings.opacity,
    language: settings.language,
    handleWindowChange: (hours: number) => windowMutation.mutateAsync(hours),
    handleOpacityChange: (opacity: number) => opacityMutation.mutate(opacity),
    handlePick: (status: SessionStatus) => pickMutation.mutateAsync(status),
    handleClear: (status: SessionStatus) => clearMutation.mutateAsync(status),
    handleLanguageChange: (language: Language) => languageMutation.mutate(language)
  }
}

export function useSettingsLanguage(): Language {
  const { data: settings = EMPTY_SETTINGS } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () =>
      window.claudePet.getSettings().then((raw) => {
        const result = AppSettingsSchema.safeParse(raw)
        if (!result.success) throw new Error(result.error.message)
        return result.data
      })
  })
  return settings.language
}
