import { readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { CLAUDE_PET_PORT_FILE } from './claude-paths'

const PORT_FILE = CLAUDE_PET_PORT_FILE

export function writePortFile(port: number): void {
  writeFileSync(PORT_FILE, String(port), 'utf-8')
}

export function readPortFile(): number | null {
  try {
    const port = Number.parseInt(readFileSync(PORT_FILE, 'utf-8').trim(), 10)
    return port || null
  } catch {
    return null
  }
}

export function deletePortFile(): void {
  try {
    unlinkSync(PORT_FILE)
  } catch {
    /* noop */
  }
}
