import type { JSX } from 'react'
import type { SessionStatus } from '../../../shared/schemas/session'
import type { CharacterImages } from '../../../shared/schemas/settings'
import { useTranslation } from '../i18n/useTranslation'

const STATUSES: SessionStatus[] = ['working', 'waiting_permission', 'done', 'aborted']

interface Props {
  images: CharacterImages
  onPick: (status: SessionStatus) => void
  onClear: (status: SessionStatus) => void
}

export default function CharacterImageSection({ images, onPick, onClear }: Props): JSX.Element {
  const t = useTranslation()

  return (
    <div className="mb-4">
      <div className="text-[10px] font-semibold text-white/30 tracking-[0.06em] uppercase mb-2">
        {t.settings.characterImage}
      </div>
      <div className="flex flex-col gap-1.5 mb-2">
        {STATUSES.map((status) => (
          <div key={status} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
            {images[status] ? (
              <img
                src={images[status] ?? ''}
                alt={status}
                width={32}
                height={32}
                className="rounded object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-white/[0.08] shrink-0 flex items-center justify-center text-base">
                🐾
              </div>
            )}
            <div className="flex-1 text-[11px] text-white/60">{t.characterStatus[status]}</div>
            <button
              type="button"
              onClick={() => onPick(status)}
              className="text-[10px] text-white/50 bg-white/[0.08] border-none rounded px-1.5 py-0.5 cursor-pointer"
            >
              {t.settings.pick}
            </button>
            {images[status] && (
              <button
                type="button"
                onClick={() => onClear(status)}
                className="text-[10px] text-[rgba(255,80,80,0.7)] bg-[rgba(255,80,80,0.1)] border-none rounded px-1.5 py-0.5 cursor-pointer"
              >
                {t.settings.reset}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="text-[9px] text-white/20 leading-relaxed">
        {t.settings.imageFormats}
        <br />
        {t.settings.imageFallback}
      </div>
    </div>
  )
}
