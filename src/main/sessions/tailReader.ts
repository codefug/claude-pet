import { openSync, readSync, statSync, closeSync } from 'fs'

const offsets = new Map<string, number>()

export function readNewLines(filePath: string): string[] {
  let size: number
  try {
    size = statSync(filePath).size
  } catch {
    offsets.delete(filePath)
    return []
  }

  const lastOffset = offsets.get(filePath) ?? 0

  // rotate(파일 축소) 감지 — 처음부터 재읽기
  const start = size < lastOffset ? 0 : lastOffset

  if (size === start) return []

  const length = size - start
  const buf = Buffer.allocUnsafe(length)

  let fd: number
  try {
    fd = openSync(filePath, 'r')
  } catch {
    return []
  }

  try {
    readSync(fd, buf, 0, length, start)
  } finally {
    closeSync(fd)
  }

  offsets.set(filePath, size)
  console.log(`[tailReader] read ${length} bytes from offset ${start} — ${filePath.split('/').pop()}`)

  return buf.toString('utf-8').split('\n').filter(Boolean)
}

export function resetOffset(filePath: string): void {
  offsets.delete(filePath)
}
