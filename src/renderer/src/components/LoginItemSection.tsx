import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { JSX } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { queryKeys } from '../lib/queryClient'

export default function LoginItemSection(): JSX.Element {
  const qc = useQueryClient()
  const t = useTranslation()

  const { data: openAtLogin } = useQuery({
    queryKey: queryKeys.loginItem,
    queryFn: () => window.claudePet.getLoginItem(),
    initialData: false
  })

  const { mutate } = useMutation({
    mutationFn: (value: boolean) => window.claudePet.setLoginItem(value),
    onMutate: (value) => qc.setQueryData(queryKeys.loginItem, value),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.loginItem })
  })

  return (
    <div className="mb-4">
      <div className="text-[10px] font-semibold text-white/30 tracking-[0.06em] uppercase mb-2">
        {t.settings.system}
      </div>
      <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/5">
        <span className="text-[11px] text-white/60">{t.settings.launchAtLogin}</span>
        <button
          type="button"
          onClick={() => mutate(!openAtLogin)}
          className={`w-8 h-4 rounded-full transition-colors cursor-pointer border-none relative ${
            openAtLogin ? 'bg-[#F5C842]' : 'bg-white/20'
          }`}
        >
          <span
            className={`absolute left-0 top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
              openAtLogin ? 'translate-x-4.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
