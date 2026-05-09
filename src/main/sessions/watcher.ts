import { watch } from 'chokidar'
import { join } from 'path'
import { homedir } from 'os'
import type { BrowserWindow } from 'electron'
import { scanProjects } from './scanProjects'
import { invalidateCache } from './parseJsonl'

const PROJECTS_DIR = join(homedir(), '.claude', 'projects')

export function startWatcher(win: BrowserWindow): void {
  const watcher = watch(PROJECTS_DIR, {
    ignoreInitial: true,
    depth: 2
  })

  const push = (filePath: string): void => {
    console.log('[watcher] changed:', filePath)
    if (!win.isDestroyed()) {
      const sessions = scanProjects()
      console.log('[watcher] pushing', sessions.length, 'sessions')
      win.webContents.send('sessions-update', sessions)
    }
  }

  watcher.on('add', push)
  watcher.on('change', push)
  watcher.on('unlink', (filePath) => {
    invalidateCache(filePath)
    push(filePath)
  })
  watcher.on('ready', () => console.log('[watcher] ready, watching:', PROJECTS_DIR))
  watcher.on('error', (e) => console.error('[watcher] error:', e))
}
