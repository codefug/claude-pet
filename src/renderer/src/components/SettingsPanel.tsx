import { useState, useEffect } from 'react'
import type { SessionStatus } from '../types'
import type { IgnoredToolRule } from '../../../main/settings'
import SessionWindowSection from './SessionWindowSection'
import CharacterImageSection from './CharacterImageSection'
import type { CharacterImages } from './CharacterImageSection'
import IgnoredSessionsSection from './IgnoredSessionsSection'

interface Props {
  onClose: () => void
  onImagesChange: (images: CharacterImages) => void
}

export default function SettingsPanel({ onClose, onImagesChange }: Props): React.JSX.Element {
  const [images, setImages] = useState<CharacterImages>({
    working: null,
    waiting_permission: null,
    done: null,
    aborted: null,
    interrupted: null
  })
  const [sessionWindowHours, setSessionWindowHours] = useState(5)
  const [ignoredToolRules, setIgnoredToolRules] = useState<IgnoredToolRule[]>([])

  useEffect(() => {
    window.claudePet.getSettings().then((s) => {
      setImages(s.characterImages)
      setSessionWindowHours(s.sessionWindowHours)
      setIgnoredToolRules(s.ignoredToolRules)
    })
  }, [])

  const handleWindowChange = async (hours: number): Promise<void> => {
    setSessionWindowHours(hours)
    await window.claudePet.setSessionWindow(hours)
  }

  const handlePick = async (status: SessionStatus): Promise<void> => {
    const dataUrl = await window.claudePet.setCharacterImage(status)
    if (dataUrl) {
      const next = { ...images, [status]: dataUrl }
      setImages(next)
      onImagesChange(next)
    }
  }

  const handleClear = async (status: SessionStatus): Promise<void> => {
    await window.claudePet.clearCharacterImage(status)
    const next = { ...images, [status]: null }
    setImages(next)
    onImagesChange(next)
  }

  const handleRulesChange = async (rules: IgnoredToolRule[]): Promise<void> => {
    setIgnoredToolRules(rules)
    await window.claudePet.setIgnoredToolRules(rules)
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(14,14,22,0.97)',
        borderRadius: '16px',
        padding: '14px 12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
        <div
          style={{
            flex: 1,
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          Settings
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: 1,
            padding: '0 2px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SessionWindowSection value={sessionWindowHours} onChange={handleWindowChange} />
        <CharacterImageSection images={images} onPick={handlePick} onClear={handleClear} />
        <IgnoredSessionsSection rules={ignoredToolRules} onRulesChange={handleRulesChange} />
      </div>
    </div>
  )
}
