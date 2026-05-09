import { type CSSProperties, type JSX, useState } from 'react'
import AppHeader from './components/AppHeader'
import SessionList from './components/SessionList'
import SettingsPanel from './components/SettingsPanel'

const containerStyle: CSSProperties = {
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

const scrollStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  WebkitAppRegion: 'no-drag'
}

export default function App(): JSX.Element {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div style={containerStyle}>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <AppHeader onSettingsClick={() => setShowSettings(true)} />
      <div style={scrollStyle}>
        <SessionList />
      </div>
    </div>
  )
}
