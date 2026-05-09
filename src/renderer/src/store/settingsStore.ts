import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { SessionStatus } from '../../../shared/schemas/session'
import { AppSettingsSchema } from '../../../shared/schemas/settings'
import type {
  AppSettings,
  CharacterImages,
  IgnoredToolRule
} from '../../../shared/schemas/settings'
import { queryKeys } from '../lib/queryClient'

const EMPTY_SETTINGS: AppSettings = {
  sessionWindowHours: 5,
  ignoredToolRules: [],
  characterImages: { working: null, waiting_permission: null, done: null, aborted: null }
}

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

  const updateCache = (updater: (prev: AppSettings) => AppSettings) => {
    qc.setQueryData(queryKeys.settings, (prev: AppSettings = EMPTY_SETTINGS) => updater(prev))
  }

  const reconcile = () => qc.invalidateQueries({ queryKey: queryKeys.settings })

  const windowMutation = useMutation({
    mutationFn: (hours: number) => window.claudePet.setSessionWindow(hours),
    onMutate: (hours) => {
      const prev = qc.getQueryData<AppSettings>(queryKeys.settings)
      updateCache((s) => ({ ...s, sessionWindowHours: hours }))
      return { prev }
    },
    onError: (_err, _hours, ctx) => {
      if (ctx?.prev) updateCache(() => ctx.prev as AppSettings)
    },
    onSettled: reconcile
  })

  const pickMutation = useMutation({
    mutationFn: (status: SessionStatus) => window.claudePet.setCharacterImage(status),
    onSuccess: (dataUrl, status) => {
      if (dataUrl)
        updateCache((s) => ({ ...s, characterImages: { ...s.characterImages, [status]: dataUrl } }))
    },
    onSettled: reconcile
  })

  const clearMutation = useMutation({
    mutationFn: (status: SessionStatus) => window.claudePet.clearCharacterImage(status),
    onMutate: (status) => {
      const prev = qc.getQueryData<AppSettings>(queryKeys.settings)
      updateCache((s) => ({ ...s, characterImages: { ...s.characterImages, [status]: null } }))
      return { prev }
    },
    onError: (_err, _status, ctx) => {
      if (ctx?.prev) updateCache(() => ctx.prev as AppSettings)
    },
    onSettled: reconcile
  })

  const rulesMutation = useMutation({
    mutationFn: (rules: IgnoredToolRule[]) => window.claudePet.setIgnoredToolRules(rules),
    onMutate: (rules) => {
      const prev = qc.getQueryData<AppSettings>(queryKeys.settings)
      updateCache((s) => ({ ...s, ignoredToolRules: rules }))
      return { prev }
    },
    onError: (_err, _rules, ctx) => {
      if (ctx?.prev) updateCache(() => ctx.prev as AppSettings)
    },
    onSettled: reconcile
  })

  return useMemo(
    () => ({
      images: settings.characterImages as CharacterImages,
      sessionWindowHours: settings.sessionWindowHours,
      ignoredToolRules: settings.ignoredToolRules,
      handleWindowChange: (hours: number) => windowMutation.mutateAsync(hours),
      handlePick: (status: SessionStatus) => pickMutation.mutateAsync(status),
      handleClear: (status: SessionStatus) => clearMutation.mutateAsync(status),
      handleRulesChange: (rules: IgnoredToolRule[]) => rulesMutation.mutateAsync(rules)
    }),
    [settings, windowMutation, pickMutation, clearMutation, rulesMutation]
  )
}
