import { useState } from 'react'
import AppHeader from './components/AppHeader'
import SessionList from './components/SessionList'
import SettingsPanel from './components/SettingsPanel'
import { useCharacterImages } from './hooks/useCharacterImages'
import { useSessions } from './hooks/useSessions'

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100vh',
  WebkitAppRegion: 'no-drag',
  background: 'rgba(20, 20, 30, 0.75)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  padding: '14px 12px',
  boxSizing: 'border-box',
  userSelect: 'none',
  position: 'relative'
}

const scrollStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  WebkitAppRegion: 'no-drag'
}

export default function App(): React.JSX.Element {
  const { sessions, handleIgnore } = useSessions()
  const { images, setImages } = useCharacterImages()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div style={containerStyle}>
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} onImagesChange={setImages} />
      )}
      <AppHeader onSettingsClick={() => setShowSettings(true)} />
      <div style={scrollStyle}>
        <SessionList sessions={sessions} characterImages={images} onIgnore={handleIgnore} />
      </div>
    </div>
  )
}
