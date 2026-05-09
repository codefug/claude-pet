import { homedir } from 'node:os'
import { join } from 'node:path'
import { watch } from 'chokidar'
import type { BrowserWindow } from 'electron'
import { invalidateCache } from './parseJsonl'
import { scanProjects } from './scanProjects'

const PROJECTS_DIR = join(homedir(), '.claude', 'projects')

export function startWatcher(win: BrowserWindow): void {
  const watcher = watch(PROJECTS_DIR, {
    ignoreInitial: true,
    depth: 2
  })

  const push = (): void => {
    if (win.isDestroyed()) return
    win.webContents.send('sessions-update', scanProjects())
  }

  watcher.on('add', push)
  watcher.on('change', push)
  watcher.on('unlink', (filePath) => {
    invalidateCache(filePath)
    push()
  })
}
