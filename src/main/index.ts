import { join } from 'node:path'
import { BrowserWindow, app, screen, shell } from 'electron'
import ElectronStoreModule from 'electron-store'
import { installHooks } from './hook-installer'
import { startHookServer } from './hook-server'
import { registerIpcHandlers } from './ipc-handlers'
import { startWatcher } from './sessions/watcher'
import { loadSettings } from './settings'
import { createTray } from './tray'

const ElectronStore =
  (ElectronStoreModule as unknown as { default: typeof ElectronStoreModule }).default ??
  ElectronStoreModule

interface WindowBounds {
  x: number
  y: number
  width: number
  height: number
}

const boundsStore = new ElectronStore<{ bounds: WindowBounds }>({ name: 'window-bounds' })

let isQuitting = false

function createWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const defaultW = 280
  const defaultH = 360
  const margin = 16

  const saved = boundsStore.get('bounds')
  const x = saved?.x ?? width - defaultW - margin
  const y = saved?.y ?? height - defaultH - margin
  const w = saved?.width ?? defaultW
  const h = saved?.height ?? defaultH

  const settings = loadSettings()

  const win = new BrowserWindow({
    width: w,
    height: h,
    x,
    y,
    show: false,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    movable: true,
    autoHideMenuBar: true,
    transparent: true,
    backgroundColor: '#00000000',
    opacity: settings.opacity,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  const saveBounds = (): void => boundsStore.set('bounds', win.getBounds())
  win.on('moved', saveBounds)
  win.on('resized', saveBounds)

  win.on('ready-to-show', () => {
    win.show()
    createTray(win)
  })

  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  win.webContents.setWindowOpenHandler((details) => {
    if (/^https?:/.test(details.url)) shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const isDev = process.env.NODE_ENV === 'development'
  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  const win = createWindow()
  registerIpcHandlers(win)
  installHooks()
  startHookServer(win)
  startWatcher(win)

  app.on('activate', () => {
    const wins = BrowserWindow.getAllWindows()
    if (wins.length === 0) createWindow()
    else wins[0].show()
  })
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
