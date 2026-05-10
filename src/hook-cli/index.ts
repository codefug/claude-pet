import { request } from 'node:http'
import { readPortFile } from '../shared/port-file'

const HOOK_SERVER_HOST = '127.0.0.1'
const HOOK_SERVER_PATH = '/hook'
const HOOK_REQUEST_TIMEOUT_MS = 1000

async function main(): Promise<void> {
  let body = ''
  process.stdin.setEncoding('utf-8')
  for await (const chunk of process.stdin) body += chunk

  const port = readPortFile()
  if (!port) process.exit(0)

  const req = request(
    {
      host: HOOK_SERVER_HOST,
      port,
      path: HOOK_SERVER_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: HOOK_REQUEST_TIMEOUT_MS
    },
    (res) => {
      res.resume()
      res.on('end', () => process.exit(0))
    }
  )
  req.on('error', () => process.exit(0))
  req.on('timeout', () => {
    req.destroy()
    process.exit(0)
  })
  req.write(body)
  req.end()
}

main()
