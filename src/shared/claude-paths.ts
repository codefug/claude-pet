import { homedir } from 'node:os'
import { join } from 'node:path'

export const CLAUDE_DIR = join(homedir(), '.claude')
export const CLAUDE_PROJECTS_DIR = join(CLAUDE_DIR, 'projects')
export const CLAUDE_SETTINGS_FILE = join(CLAUDE_DIR, 'settings.json')
export const CLAUDE_PET_PORT_FILE = join(CLAUDE_DIR, '.pet-hook-port')
