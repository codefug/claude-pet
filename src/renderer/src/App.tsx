function App(): React.JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        WebkitAppRegion: 'drag',
        background: 'rgba(30, 30, 40, 0.85)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px',
        userSelect: 'none'
      }}
    >
      Claude Pet
    </div>
  )
}

export default App
