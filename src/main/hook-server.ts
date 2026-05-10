import { type IncomingMessage, type ServerResponse, createServer } from 'node:http'
import { type BrowserWindow, app } from 'electron'
import { HOOK_EVENT, NOTIFICATION_TYPE } from '../shared/hook-events'
import { IPC_CHANNEL } from '../shared/ipc-channels'
import { deletePortFile, writePortFile } from '../shared/port-file'
import { HookPayloadSchema } from '../shared/schemas/hook-payload'
import { type LiveState, getLiveState, setLiveState } from './live-status'
import { scanProjects } from './sessions/scanProjects'

export { getLiveState, type LiveState }


export function startHookServer(win: BrowserWindow): void {
  const server = createServer((req, res) => handleRequest(req, res, win))
  server.listen(0, '127.0.0.1', () => {
    const addr = server.address()
    if (addr && typeof addr === 'object') writePortFile(addr.port)
  })

  app.on('before-quit', () => {
    deletePortFile()
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
        win.webContents.send(IPC_CHANNEL.SESSIONS_UPDATE, scanProjects())
      }
    } catch {
      /* malformed payload — ignore */
    }
  })
}

function applyHook(raw: unknown): void {
  const result = HookPayloadSchema.safeParse(raw)
  if (!result.success) return

  const payload = result.data
  const { session_id: sessionId, cwd, hook_event_name: event } = payload
  const now = Date.now()

  switch (event) {
    case HOOK_EVENT.PRE_TOOL_USE:
    case HOOK_EVENT.POST_TOOL_USE:
      setLiveState(sessionId, { status: 'working', cwd, updatedAt: now })
      break

    case HOOK_EVENT.PERMISSION_REQUEST: {
      const { tool_name: toolName, tool_input: toolInput = {} } = payload
      setLiveState(sessionId, {
        status: 'waiting_permission',
        pendingTool: toolName ? { name: toolName, input: toolInput } : undefined,
        cwd,
        updatedAt: now
      })
      break
    }

    case HOOK_EVENT.NOTIFICATION: {
      if (payload.notification_type === NOTIFICATION_TYPE.PERMISSION_PROMPT) {
        const existing = getLiveState(sessionId)
        setLiveState(sessionId, {
          ...(existing ?? { updatedAt: now, cwd }),
          status: 'waiting_permission',
          updatedAt: now
        })
      }
      break
    }

    case HOOK_EVENT.PERMISSION_DENIED:
    case HOOK_EVENT.STOP:
    case HOOK_EVENT.STOP_FAILURE:
    case HOOK_EVENT.SESSION_END:
    case HOOK_EVENT.SESSION_START:
      setLiveState(sessionId, { status: 'done', cwd, updatedAt: now })
      break
  }
}
