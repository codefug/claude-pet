function App(): React.JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        WebkitAppRegion: 'drag',
        background: 'rgba(20, 20, 30, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
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
