import { join, extname } from 'path'
import { readFileSync } from 'fs'
import { app, shell, BrowserWindow, ipcMain, screen, dialog } from 'electron'
import { scanProjects } from './sessions/scanProjects'
import { startWatcher } from './sessions/watcher'
import { createTray } from './tray'
import { loadSettings, saveSettings } from './settings'
import type { AppSettings, IgnoredToolRule } from './settings'
import { invalidateAllowCache, toolToPattern } from './sessions/permissionChecker'

let mainWin: BrowserWindow | null = null
let isQuitting = false

function toDataUrl(filePath: string | null): string | null {
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

function pushSessions(): void {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.send('sessions-update', scanProjects())
  }
}

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

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (/^https?:/.test(details.url)) shell.openExternal(details.url)
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

  ipcMain.handle(
    'ignore-session',
    (_e, projectName: string, toolName: string, toolInput: Record<string, unknown>) => {
      const pattern = toolToPattern(toolName, toolInput)
      const settings = loadSettings()
      const exists = settings.ignoredToolRules.some(
        (r) => r.projectName === projectName && r.pattern === pattern
      )
      if (!exists) {
        settings.ignoredToolRules = [...settings.ignoredToolRules, { projectName, pattern }]
        saveSettings(settings)
        invalidateAllowCache()
        pushSessions()
      }
    }
  )

  ipcMain.handle('get-settings', () => {
    const settings = loadSettings()
    return {
      ...settings,
      characterImages: {
        working: toDataUrl(settings.characterImages.working),
        waiting_permission: toDataUrl(settings.characterImages.waiting_permission),
        done: toDataUrl(settings.characterImages.done),
        aborted: toDataUrl(settings.characterImages.aborted),
        interrupted: toDataUrl(settings.characterImages.interrupted)
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
    return toDataUrl(filePath)
  })

  ipcMain.handle('set-session-window', (_e, hours: number) => {
    const settings = loadSettings()
    settings.sessionWindowHours = hours
    saveSettings(settings)
    pushSessions()
  })

  ipcMain.handle('set-ignored-tool-rules', (_e, rules: IgnoredToolRule[]) => {
    const settings = loadSettings()
    settings.ignoredToolRules = rules
    saveSettings(settings)
    invalidateAllowCache()
    pushSessions()
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
  isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
