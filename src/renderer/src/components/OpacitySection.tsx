import type { JSX } from 'react'

interface Props {
  value: number
  onChange: (opacity: number) => void
}

export default function OpacitySection({ value, onChange }: Props): JSX.Element {
  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <div className="flex-1 text-[10px] font-semibold text-white/30 tracking-[0.06em] uppercase">
          불투명도
        </div>
        <span className="text-[10px] text-white/40">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0.2}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#F5C842] cursor-pointer"
      />
    </div>
  )
}
