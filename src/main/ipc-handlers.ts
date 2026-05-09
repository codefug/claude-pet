import { dialog, ipcMain } from 'electron'
import type { BrowserWindow } from 'electron'
import { produce } from 'immer'
import { SessionStatusSchema } from '../shared/schemas/session'
import { toolToPattern } from './sessions/permissionChecker'
import { scanProjects } from './sessions/scanProjects'
import type { AppSettings, IgnoredToolRule } from './settings'
import { loadSettings, saveSettings } from './settings'
import { toDataUrl } from './utils/image'

function pushSessions(win: BrowserWindow): void {
  if (!win.isDestroyed()) {
    win.webContents.send('sessions-update', scanProjects())
  }
}

function updateSettings(updater: (draft: AppSettings) => void): AppSettings {
  const next = produce(loadSettings(), updater)
  saveSettings(next)
  return next
}

export function registerIpcHandlers(win: BrowserWindow): void {
  ipcMain.handle('get-sessions', () => scanProjects())

  ipcMain.handle(
    'ignore-session',
    (_e, projectName: string, toolName: string, toolInput: Record<string, unknown>) => {
      const pattern = toolToPattern(toolName, toolInput)
      updateSettings((draft) => {
        const exists = draft.ignoredToolRules.some(
          (r) => r.projectName === projectName && r.pattern === pattern
        )
        if (!exists) draft.ignoredToolRules.push({ projectName, pattern })
      })
      pushSessions(win)
    }
  )

  ipcMain.handle('get-settings', () => {
    const settings = loadSettings()
    return produce(settings, (draft) => {
      draft.characterImages.working = toDataUrl(settings.characterImages.working)
      draft.characterImages.waiting_permission = toDataUrl(
        settings.characterImages.waiting_permission
      )
      draft.characterImages.done = toDataUrl(settings.characterImages.done)
      draft.characterImages.aborted = toDataUrl(settings.characterImages.aborted)
    })
  })

  ipcMain.handle('set-character-image', async (_e, status: string) => {
    const parsed = SessionStatusSchema.safeParse(status)
    if (!parsed.success) return null
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }]
    })
    if (canceled || filePaths.length === 0) return null
    const filePath = filePaths[0]
    updateSettings((draft) => {
      draft.characterImages[parsed.data] = filePath
    })
    return toDataUrl(filePath)
  })

  ipcMain.handle('set-session-window', (_e, hours: number) => {
    updateSettings((draft) => {
      draft.sessionWindowHours = hours
    })
    pushSessions(win)
  })

  ipcMain.handle('set-ignored-tool-rules', (_e, rules: IgnoredToolRule[]) => {
    updateSettings((draft) => {
      draft.ignoredToolRules = rules
    })
    pushSessions(win)
  })

  ipcMain.handle('clear-character-image', (_e, status: string) => {
    const parsed = SessionStatusSchema.safeParse(status)
    if (!parsed.success) return
    updateSettings((draft) => {
      draft.characterImages[parsed.data] = null
    })
  })
}
