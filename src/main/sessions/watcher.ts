import { watch } from 'chokidar'
import type { BrowserWindow } from 'electron'
import { CLAUDE_PROJECTS_DIR } from '../../shared/claude-paths'
import { IPC_CHANNEL } from '../../shared/ipc-channels'
import { invalidateCache } from './parseJsonl'
import { scanProjects } from './scanProjects'

const PROJECTS_DIR = CLAUDE_PROJECTS_DIR

export function startWatcher(win: BrowserWindow): void {
  const watcher = watch(PROJECTS_DIR, {
    ignoreInitial: true,
    depth: 2
  })

  const push = (): void => {
    if (win.isDestroyed()) return
    win.webContents.send(IPC_CHANNEL.SESSIONS_UPDATE, scanProjects())
  }

  watcher.on('add', push)
  watcher.on('change', push)
  watcher.on('unlink', (filePath) => {
    invalidateCache(filePath)
    push()
  })
}
