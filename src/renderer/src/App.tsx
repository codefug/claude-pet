import { type JSX, lazy, useState } from 'react'
import AppHeader from './components/AppHeader'
import SessionList from './components/SessionList'

const SettingsPanel = lazy(() => import('./components/SettingsPanel'))

export default function App(): JSX.Element {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div
      style={{ WebkitAppRegion: 'no-drag' }}
      className="w-full h-screen bg-[rgba(20,20,30,0.75)] backdrop-blur-[20px] rounded-2xl flex flex-col px-3 py-3.5 box-border select-none relative"
    >
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <AppHeader onSettingsClick={() => setShowSettings(true)} />
      <div style={{ WebkitAppRegion: 'no-drag' }} className="flex-1 overflow-y-auto">
        <SessionList />
      </div>
    </div>
  )
}
