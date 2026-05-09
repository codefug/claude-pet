import { readFileSync } from 'node:fs'
import { extname } from 'node:path'

export function toDataUrl(filePath: string | null): string | null {
  if (!filePath) return null
  try {
    const ext = extname(filePath).slice(1).toLowerCase()
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`
    const data = readFileSync(filePath).toString('base64')
    return `data:${mime};base64,${data}`
  } catch {
    return null
  }
}
