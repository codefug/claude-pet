import type { AppSettings } from '../../../shared/schemas/settings'

export const EMPTY_SETTINGS: AppSettings = {
  sessionWindowHours: 5,
  ignoredToolRules: [],
  characterImages: { working: null, waiting_permission: null, done: null, aborted: null }
}

export function makeOptimisticOptions<T>(
  getQueryData: () => AppSettings | undefined,
  setQueryData: (data: AppSettings) => void,
  updater: (prev: AppSettings, variables: T) => AppSettings,
  reconcile: () => void
) {
  return {
    onMutate: (variables: T) => {
      const prev = getQueryData()
      setQueryData(updater(prev ?? EMPTY_SETTINGS, variables))
      return { prev }
    },
    onError: (_err: Error, _variables: T, ctx: { prev: AppSettings | undefined } | undefined) => {
      setQueryData(ctx?.prev ?? EMPTY_SETTINGS)
    },
    onSettled: reconcile
  }
}
