import { dialog, ipcMain } from 'electron'
import type { BrowserWindow } from 'electron'
import type { AppSettings, IgnoredToolRule } from './settings'
import { loadSettings, saveSettings } from './settings'
import { scanProjects } from './sessions/scanProjects'
import { toolToPattern } from './sessions/permissionChecker'
import { toDataUrl } from './utils/image'

function pushSessions(win: BrowserWindow): void {
  if (!win.isDestroyed()) {
    win.webContents.send('sessions-update', scanProjects())
  }
}

export function registerIpcHandlers(win: BrowserWindow): void {
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
        pushSessions(win)
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
    return toDataUrl(filePath)
  })

  ipcMain.handle('set-session-window', (_e, hours: number) => {
    const settings = loadSettings()
    settings.sessionWindowHours = hours
    saveSettings(settings)
    pushSessions(win)
  })

  ipcMain.handle('set-ignored-tool-rules', (_e, rules: IgnoredToolRule[]) => {
    const settings = loadSettings()
    settings.ignoredToolRules = rules
    saveSettings(settings)
    pushSessions(win)
  })

  ipcMain.handle('clear-character-image', (_e, status: string) => {
    const settings = loadSettings()
    settings.characterImages[status as keyof AppSettings['characterImages']] = null
    saveSettings(settings)
  })
}
