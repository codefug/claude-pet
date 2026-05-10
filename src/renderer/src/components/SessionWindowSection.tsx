import type { JSX } from 'react'

const WINDOW_OPTIONS = [5, 12, 24, 48, 72]

interface Props {
  value: number
  onChange: (hours: number) => void
}

export default function SessionWindowSection({ value, onChange }: Props): JSX.Element {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-semibold text-white/30 tracking-[0.06em] uppercase mb-2">
        세션 표시 기간
      </div>
      <div className="flex gap-1 flex-wrap">
        {WINDOW_OPTIONS.map((h) => (
          <button
            type="button"
            key={h}
            onClick={() => onChange(h)}
            className={`text-[10px] px-2 py-0.75 rounded-md border-none cursor-pointer ${
              value === h
                ? 'bg-[rgba(245,200,66,0.25)] text-[#F5C842] font-bold'
                : 'bg-white/8 text-white/45 font-normal'
            }`}
          >
            {h}h
          </button>
        ))}
      </div>
    </div>
  )
}
