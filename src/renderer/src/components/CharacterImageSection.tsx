import type { JSX } from 'react'
import type { SessionStatus } from '../../../shared/schemas/session'
import type { CharacterImages } from '../../../shared/schemas/settings'

export type { CharacterImages }

const STATUS_LABELS: Record<SessionStatus, string> = {
  working: 'Working',
  waiting_permission: 'Permission',
  done: 'Done',
  aborted: 'Aborted'
}

const STATUSES: SessionStatus[] = ['working', 'waiting_permission', 'done', 'aborted']

interface Props {
  images: CharacterImages
  onPick: (status: SessionStatus) => void
  onClear: (status: SessionStatus) => void
}

export default function CharacterImageSection({ images, onPick, onClear }: Props): JSX.Element {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-semibold text-white/30 tracking-[0.06em] uppercase mb-2">
        캐릭터 이미지
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
            <div className="flex-1 text-[11px] text-white/60">{STATUS_LABELS[status]}</div>
            <button
              type="button"
              onClick={() => onPick(status)}
              className="text-[10px] text-white/50 bg-white/[0.08] border-none rounded px-1.5 py-0.5 cursor-pointer"
            >
              선택
            </button>
            {images[status] && (
              <button
                type="button"
                onClick={() => onClear(status)}
                className="text-[10px] text-[rgba(255,80,80,0.7)] bg-[rgba(255,80,80,0.1)] border-none rounded px-1.5 py-0.5 cursor-pointer"
              >
                초기화
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="text-[9px] text-white/20 leading-relaxed">
        PNG, JPG, GIF, WebP, SVG 지원
        <br />
        설정한 이미지가 없으면 기본 요키 캐릭터 사용
      </div>
    </div>
  )
}
