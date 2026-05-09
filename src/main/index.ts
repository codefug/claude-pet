import { join } from 'node:path'
import { BrowserWindow, app, screen, shell } from 'electron'
import { installHooks } from './hook-installer'
import { startHookServer } from './hook-server'
import { registerIpcHandlers } from './ipc-handlers'
import { startWatcher } from './sessions/watcher'
import { createTray } from './tray'

let isQuitting = false

function createWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const winW = 280
  const winH = 360
  const margin = 16

  const win = new BrowserWindow({
    width: winW,
    height: winH,
    x: width - winW - margin,
    y: height - winH - margin,
    show: false,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
    autoHideMenuBar: true,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

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
