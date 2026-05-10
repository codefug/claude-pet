import type { JSX } from 'react'

interface Props {
  onSettingsClick: () => void
}

export default function AppHeader({ onSettingsClick }: Props): JSX.Element {
  return (
    <div
      style={{ WebkitAppRegion: 'drag' }}
      className="flex items-center mb-2.5 pt-1 pb-2 cursor-grab"
    >
      <div className="flex-1 text-[11px] font-bold text-white/40 tracking-[0.08em] uppercase pl-0.5">
        Claude Sessions
      </div>
      <button
        type="button"
        onClick={onSettingsClick}
        style={{ WebkitAppRegion: 'no-drag' }}
        className="bg-none border-none text-white/30 cursor-pointer text-[14px] px-0.5 leading-none"
        title="설정"
      >
        ⚙️
      </button>
    </div>
  )
}
