import { join } from 'path'
import { app, shell, BrowserWindow, ipcMain } from 'electron'

let isQuitting = false
import { scanProjects } from './sessions/scanProjects'
import { startWatcher } from './sessions/watcher'
import { createTray } from './tray'

function createWindow(): void {
  const isDev = process.env.NODE_ENV === 'development'

  const mainWindow = new BrowserWindow({
    width: 280,
    height: 360,
    show: false,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    createTray(mainWindow)
  })

  // 창 닫기 버튼은 hide로 처리 (트레이에서 quit)
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  startWatcher(mainWindow)
}

app.whenReady().then(() => {
  ipcMain.handle('get-sessions', () => scanProjects())
  createWindow()

  app.on('activate', () => {
    const wins = BrowserWindow.getAllWindows()
    if (wins.length === 0) createWindow()
    else wins[0].show()
  })
})

app.on('before-quit', () => {
  isQuitting = true // eslint-disable-line
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
