import type { JSX } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import CharacterImageSection from './CharacterImageSection'
import LoginItemSection from './LoginItemSection'
import OpacitySection from './OpacitySection'
import SessionWindowSection from './SessionWindowSection'

interface Props {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: Props): JSX.Element {
  const {
    images,
    sessionWindowHours,
    opacity,
    handleWindowChange,
    handleOpacityChange,
    handlePick,
    handleClear
  } = useSettingsStore()

  return (
    <div className="absolute inset-0 bg-[rgba(14,14,22,0.97)] rounded-2xl p-[14px_12px] box-border flex flex-col z-10">
      <div className="flex items-center mb-3.5">
        <div className="flex-1 text-[11px] font-bold text-white/40 tracking-[0.08em] uppercase">
          Settings
        </div>
        <button
          type="button"
          onClick={onClose}
          className="bg-transparent border-none text-white/40 cursor-pointer text-base leading-none px-0.5"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <LoginItemSection />
        <OpacitySection value={opacity} onChange={handleOpacityChange} />
        <SessionWindowSection value={sessionWindowHours} onChange={handleWindowChange} />
        <CharacterImageSection images={images} onPick={handlePick} onClear={handleClear} />
      </div>
    </div>
  )
}
