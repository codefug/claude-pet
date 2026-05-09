import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'
import type { BrowserWindow } from 'electron'

let tray: Tray | null = null

export function createTray(win: BrowserWindow): void {
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'tray-iconTemplate.png')
    : join(__dirname, '../../resources/tray-iconTemplate.png')
  const icon = nativeImage.createFromPath(iconPath)
  const trayIcon = icon.resize({ width: 16, height: 16 })
  trayIcon.setTemplateImage(true)

  tray = new Tray(trayIcon)
  tray.setToolTip('Claude Pet')

  const menu = Menu.buildFromTemplate([
    {
      label: 'Show / Hide',
      click: () => {
        if (win.isVisible()) {
          win.hide()
        } else {
          win.show()
          win.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ])

  tray.setContextMenu(menu)

  tray.on('click', () => {
    win.show()
    win.focus()
  })
}
