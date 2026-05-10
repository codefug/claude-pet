import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SessionStatus } from '../../../shared/schemas/session'
import { AppSettingsSchema } from '../../../shared/schemas/settings'
import type { AppSettings, IgnoredToolRule } from '../../../shared/schemas/settings'
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

  const rulesMutation = useMutation({
    mutationFn: (rules: IgnoredToolRule[]) => window.claudePet.setIgnoredToolRules(rules),
    ...makeOptimisticOptions({
      getQueryData: getSettings,
      setQueryData: setSettings,
      updater: (s, rules) => ({ ...s, ignoredToolRules: rules }),
      reconcile
    })
  })

  return {
    images: settings.characterImages,
    sessionWindowHours: settings.sessionWindowHours,
    ignoredToolRules: settings.ignoredToolRules,
    handleWindowChange: (hours: number) => windowMutation.mutateAsync(hours),
    handlePick: (status: SessionStatus) => pickMutation.mutateAsync(status),
    handleClear: (status: SessionStatus) => clearMutation.mutateAsync(status),
    handleRulesChange: (rules: IgnoredToolRule[]) => rulesMutation.mutateAsync(rules)
  }
}
