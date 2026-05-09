import { join, extname } from 'path'
import { readFileSync } from 'fs'
import { app, shell, BrowserWindow, ipcMain, screen, dialog } from 'electron'

let isQuitting = false
import { scanProjects } from './sessions/scanProjects'
import { startWatcher } from './sessions/watcher'
import { createTray } from './tray'
import { loadSettings, saveSettings } from './settings'
import type { AppSettings } from './settings'
import { ignoredSessions } from './ignoredSessions'

function createWindow(): void {
  const isDev = process.env.NODE_ENV === 'development'
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const winW = 280
  const winH = 360
  const margin = 16

  const mainWindow = new BrowserWindow({
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

  mainWin = mainWindow

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

function buildSessions() {
  return scanProjects().map((s) => ({
    ...s,
    status: ignoredSessions.has(s.id) ? ('working' as const) : s.status
  }))
}

let mainWin: BrowserWindow | null = null

function pushSessions(): void {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.send('sessions-update', buildSessions())
  }
}

app.whenReady().then(() => {

  ipcMain.handle('get-sessions', () => buildSessions())

  ipcMain.handle('ignore-session', (_e, id: string) => {
    ignoredSessions.add(id)
  })

  ipcMain.handle('get-settings', () => {
    const settings = loadSettings()
    // 경로를 base64 data URL로 변환해서 반환
    const toDataUrl = (filePath: string | null): string | null => {
      if (!filePath) return null
      try {
        const ext = extname(filePath).slice(1).toLowerCase()
        const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`
        const data = readFileSync(filePath).toString('base64')
        return `data:${mime};base64,${data}`
      } catch {
        return null
      }
    }
    return {
      ...settings,
      characterImages: {
        working: toDataUrl(settings.characterImages.working),
        waiting_permission: toDataUrl(settings.characterImages.waiting_permission),
        done: toDataUrl(settings.characterImages.done),
        aborted: toDataUrl(settings.characterImages.aborted)
      }
    }
  })

  ipcMain.handle('set-character-image', async (_e, status: string) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }]
    })
    if (canceled || filePaths.length === 0) return null
    const filePath = filePaths[0]
    const settings = loadSettings()
    settings.characterImages[status as keyof AppSettings['characterImages']] = filePath
    saveSettings(settings)
    const ext = extname(filePath).slice(1).toLowerCase()
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`
    const data = readFileSync(filePath).toString('base64')
    return `data:${mime};base64,${data}`
  })

  ipcMain.handle('set-session-window', (_e, hours: number) => {
    const settings = loadSettings()
    settings.sessionWindowHours = hours
    saveSettings(settings)
    pushSessions()  // 즉시 반영
  })

  ipcMain.handle('clear-character-image', (_e, status: string) => {
    const settings = loadSettings()
    settings.characterImages[status as keyof AppSettings['characterImages']] = null
    saveSettings(settings)
  })

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
