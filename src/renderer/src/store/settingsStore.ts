import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { SessionStatus } from '../../../shared/schemas/session'
import { AppSettingsSchema } from '../../../shared/schemas/settings'
import type { AppSettings, IgnoredToolRule } from '../../../shared/schemas/settings'
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

  const rollbackCache = (prev: AppSettings | undefined) => {
    qc.setQueryData(queryKeys.settings, prev ?? EMPTY_SETTINGS)
  }

  const reconcile = () => qc.invalidateQueries({ queryKey: queryKeys.settings })

  const windowMutation = useMutation<void, Error, number, { prev: AppSettings | undefined }>({
    mutationFn: (hours) => window.claudePet.setSessionWindow(hours),
    onMutate: (hours) => {
      const prev = qc.getQueryData<AppSettings>(queryKeys.settings)
      updateCache((s) => ({ ...s, sessionWindowHours: hours }))
      return { prev }
    },
    onError: (_err, _hours, ctx) => rollbackCache(ctx?.prev),
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

  const clearMutation = useMutation<void, Error, SessionStatus, { prev: AppSettings | undefined }>({
    mutationFn: (status) => window.claudePet.clearCharacterImage(status),
    onMutate: (status) => {
      const prev = qc.getQueryData<AppSettings>(queryKeys.settings)
      updateCache((s) => ({ ...s, characterImages: { ...s.characterImages, [status]: null } }))
      return { prev }
    },
    onError: (_err, _status, ctx) => rollbackCache(ctx?.prev),
    onSettled: reconcile
  })

  const rulesMutation = useMutation<void, Error, IgnoredToolRule[], { prev: AppSettings | undefined }>({
    mutationFn: (rules) => window.claudePet.setIgnoredToolRules(rules),
    onMutate: (rules) => {
      const prev = qc.getQueryData<AppSettings>(queryKeys.settings)
      updateCache((s) => ({ ...s, ignoredToolRules: rules }))
      return { prev }
    },
    onError: (_err, _rules, ctx) => rollbackCache(ctx?.prev),
    onSettled: reconcile
  })

  return useMemo(
    () => ({
      images: settings.characterImages,
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
