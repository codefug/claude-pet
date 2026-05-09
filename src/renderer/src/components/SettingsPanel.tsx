import type { CharacterImages } from '../hooks/useCharacterImages'
import { useSettings } from '../hooks/useSettings'
import CharacterImageSection from './CharacterImageSection'
import IgnoredSessionsSection from './IgnoredSessionsSection'
import SessionWindowSection from './SessionWindowSection'

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(14,14,22,0.97)',
  borderRadius: '16px',
  padding: '14px 12px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 10
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '14px'
}

const titleStyle: React.CSSProperties = {
  flex: 1,
  fontSize: '11px',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.4)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
}

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.4)',
  cursor: 'pointer',
  fontSize: '16px',
  lineHeight: 1,
  padding: '0 2px'
}

interface Props {
  onClose: () => void
  onImagesChange: (images: CharacterImages) => void
}

export default function SettingsPanel({ onClose, onImagesChange }: Props): React.JSX.Element {
  const {
    images,
    sessionWindowHours,
    ignoredToolRules,
    handleWindowChange,
    handlePick,
    handleClear,
    handleRulesChange
  } = useSettings(onImagesChange)

  return (
    <div style={overlayStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>Settings</div>
        <button type="button" onClick={onClose} style={closeBtnStyle}>
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
