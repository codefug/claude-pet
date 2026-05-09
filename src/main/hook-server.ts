import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { type BrowserWindow, app } from 'electron'
import { getLiveState, setLiveState, type LiveState } from './live-status'
import { scanProjects } from './sessions/scanProjects'

export { getLiveState, type LiveState }

export function startHookServer(win: BrowserWindow): void {
  const portFile = join(homedir(), '.claude', '.pet-hook-port')

  const server = createServer((req, res) => handleRequest(req, res, win))
  server.listen(0, '127.0.0.1', () => {
    const port = (server.address() as { port: number }).port
    writeFileSync(portFile, String(port), 'utf-8')
  })

  app.on('before-quit', () => {
    try {
      unlinkSync(portFile)
    } catch {
      /* noop */
    }
    server.close()
  })
}

function handleRequest(req: IncomingMessage, res: ServerResponse, win: BrowserWindow): void {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', () => {
    res.statusCode = 204
    res.end()
    try {
      applyHook(JSON.parse(body))
      if (!win.isDestroyed()) {
        win.webContents.send('sessions-update', scanProjects())
      }
    } catch {
      /* malformed payload — ignore */
    }
  })
}

function applyHook(payload: Record<string, unknown>): void {
  const sessionId = payload.session_id as string
  const event = payload.hook_event_name as string
  if (!sessionId || !event) return

  const cwd = payload.cwd as string | undefined
  const now = Date.now()

  switch (event) {
    case 'PreToolUse':
    case 'PostToolUse':
      setLiveState(sessionId, { status: 'working', cwd, updatedAt: now })
      break

    case 'PermissionRequest': {
      const toolName = payload.tool_name as string | undefined
      const toolInput = (payload.tool_input as Record<string, unknown>) ?? {}
      setLiveState(sessionId, {
        status: 'waiting_permission',
        pendingTool: toolName ? { name: toolName, input: toolInput } : undefined,
        cwd,
        updatedAt: now
      })
      break
    }

    case 'Notification': {
      if ((payload.notification_type as string) === 'permission_prompt') {
        const existing = getLiveState(sessionId)
        setLiveState(sessionId, {
          ...(existing ?? { updatedAt: now, cwd }),
          status: 'waiting_permission',
          updatedAt: now
        })
      }
      break
    }

    case 'PermissionDenied':
    case 'Stop':
    case 'StopFailure':
    case 'SessionEnd':
      setLiveState(sessionId, { status: 'done', cwd, updatedAt: now })
      break

    case 'SessionStart':
      setLiveState(sessionId, { status: 'done', cwd, updatedAt: now })
      break
  }
}
