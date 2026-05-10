import { app, dialog, ipcMain, shell } from 'electron'
import type { BrowserWindow } from 'electron'
import { produce } from 'immer'
import { IPC_CHANNEL } from '../shared/ipc-channels'
import { SessionStatusSchema } from '../shared/schemas/session'
import type { AppSettings } from '../shared/schemas/settings'
import { scanProjects } from './sessions/scanProjects'
import { loadSettings, saveSettings } from './settings'
import { toDataUrl } from './utils/image'

function pushSessions(win: BrowserWindow): void {
  if (!win.isDestroyed()) {
    win.webContents.send(IPC_CHANNEL.SESSIONS_UPDATE, scanProjects())
  }
}

function updateSettings(updater: (draft: AppSettings) => void): AppSettings {
  const next = produce(loadSettings(), updater)
  saveSettings(next)
  return next
}

export function registerIpcHandlers(win: BrowserWindow): void {
  ipcMain.handle(IPC_CHANNEL.GET_SESSIONS, () => scanProjects())

  ipcMain.handle(IPC_CHANNEL.GET_SETTINGS, () => {
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

  ipcMain.handle(IPC_CHANNEL.SET_CHARACTER_IMAGE, async (_e, status: string) => {
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

  ipcMain.handle(IPC_CHANNEL.SET_SESSION_WINDOW, (_e, hours: number) => {
    updateSettings((draft) => {
      draft.sessionWindowHours = hours
    })
    pushSessions(win)
  })

  ipcMain.handle(IPC_CHANNEL.CLEAR_CHARACTER_IMAGE, (_e, status: string) => {
    const parsed = SessionStatusSchema.safeParse(status)
    if (!parsed.success) return
    updateSettings((draft) => {
      draft.characterImages[parsed.data] = null
    })
  })

  ipcMain.handle(IPC_CHANNEL.GET_LOGIN_ITEM, () => app.getLoginItemSettings().openAtLogin)

  ipcMain.handle(IPC_CHANNEL.SET_LOGIN_ITEM, (_e, openAtLogin: boolean) => {
    app.setLoginItemSettings({ openAtLogin })
  })

  ipcMain.handle(IPC_CHANNEL.SET_OPACITY, (_e, opacity: number) => {
    win.setOpacity(opacity)
    updateSettings((draft) => {
      draft.opacity = opacity
    })
  })

  ipcMain.handle(IPC_CHANNEL.OPEN_PATH, (_e, path: string) => {
    shell.showItemInFolder(path)
  })
}
