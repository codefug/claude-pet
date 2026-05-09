import { readFileSync } from 'node:fs'
import { request } from 'node:http'
import { homedir } from 'node:os'
import { join } from 'node:path'

async function main(): Promise<void> {
  let body = ''
  process.stdin.setEncoding('utf-8')
  for await (const chunk of process.stdin) body += chunk

  let port: number
  try {
    port = Number.parseInt(
      readFileSync(join(homedir(), '.claude', '.pet-hook-port'), 'utf-8').trim(),
      10
    )
    if (!port) process.exit(0)
  } catch {
    process.exit(0)
  }

  const req = request(
    {
      host: '127.0.0.1',
      port,
      path: '/hook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 1000
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
