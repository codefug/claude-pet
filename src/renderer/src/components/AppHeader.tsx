const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px',
  paddingTop: '4px',
  paddingBottom: '8px',
  WebkitAppRegion: 'drag',
  cursor: 'grab'
}

const titleStyle: React.CSSProperties = {
  flex: 1,
  fontSize: '11px',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.4)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  paddingLeft: '2px'
}

const settingsBtnStyle: React.CSSProperties = {
  WebkitAppRegion: 'no-drag',
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.3)',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '0 2px',
  lineHeight: 1
}

interface Props {
  onSettingsClick: () => void
}

export default function AppHeader({ onSettingsClick }: Props): React.JSX.Element {
  return (
    <div style={headerStyle}>
      <div style={titleStyle}>Claude Sessions</div>
      <button type="button" onClick={onSettingsClick} style={settingsBtnStyle} title="설정">
        ⚙️
      </button>
    </div>
  )
}
