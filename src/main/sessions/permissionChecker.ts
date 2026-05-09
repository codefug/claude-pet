import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { loadSettings } from '../settings'

interface ToolCall {
  name: string
  input: Record<string, unknown>
}

// Commands Claude Code auto-allows regardless of user settings
const BASH_AUTO_ALLOW_EXACT = new Set([
  'pwd',
  'whoami',
  'alias',
  'claude -h',
  'claude --help',
  'node -v',
  'node --version',
  'python --version',
  'python3 --version',
  'ip addr'
])

const BASH_AUTO_ALLOW_COMMANDS = new Set([
  'cal',
  'uptime',
  'cat',
  'head',
  'tail',
  'wc',
  'stat',
  'strings',
  'hexdump',
  'od',
  'nl',
  'id',
  'uname',
  'free',
  'df',
  'du',
  'locale',
  'groups',
  'nproc',
  'basename',
  'dirname',
  'realpath',
  'cut',
  'paste',
  'tr',
  'column',
  'tac',
  'rev',
  'fold',
  'expand',
  'unexpand',
  'fmt',
  'comm',
  'cmp',
  'numfmt',
  'readlink',
  'diff',
  'true',
  'false',
  'sleep',
  'which',
  'type',
  'expr',
  'test',
  'getconf',
  'seq',
  'tsort',
  'pr',
  'echo',
  'printf',
  'ls',
  'cd',
  'find',
  // safe with flags validated by Claude Code
  'xargs',
  'file',
  'sed',
  'sort',
  'man',
  'help',
  'netstat',
  'ps',
  'base64',
  'grep',
  'egrep',
  'fgrep',
  'sha256sum',
  'sha1sum',
  'md5sum',
  'tree',
  'date',
  'hostname',
  'info',
  'lsof',
  'pgrep',
  'tput',
  'ss',
  'fd',
  'fdfind',
  'rg',
  'jq',
  'uniq',
  'history',
  'arch',
  'ifconfig',
  'pyright'
])

const GIT_AUTO_ALLOW_SUBCOMMANDS = new Set([
  'status',
  'log',
  'diff',
  'show',
  'blame',
  'branch',
  'tag',
  'remote',
  'ls-files',
  'ls-remote',
  'rev-parse',
  'describe',
  'reflog',
  'shortlog',
  'cat-file',
  'for-each-ref',
  'worktree',
  'stash'
])

const GH_AUTO_ALLOW_SUBCOMMANDS = new Set([
  'pr',
  'issue',
  'run',
  'workflow',
  'repo',
  'release',
  'auth'
])

const GH_AUTO_ALLOW_ACTIONS = new Set(['view', 'list', 'diff', 'checks', 'status'])

function isBashAutoAllowed(cmd: string): boolean {
  if (!cmd) return false

  const trimmed = cmd.trim()

  if (BASH_AUTO_ALLOW_EXACT.has(trimmed)) return true

  // Extract leading command token (skip env var prefixes like FOO=bar cmd)
  const tokens = trimmed.split(/\s+/)
  let idx = 0
  while (idx < tokens.length && tokens[idx].includes('=')) idx++
  const leadCmd = tokens[idx] ?? ''
  const sub = tokens[idx + 1] ?? ''

  if (leadCmd === 'git' && GIT_AUTO_ALLOW_SUBCOMMANDS.has(sub)) return true

  if (leadCmd === 'gh') {
    if (GH_AUTO_ALLOW_SUBCOMMANDS.has(sub) && GH_AUTO_ALLOW_ACTIONS.has(tokens[idx + 2] ?? ''))
      return true
    if (sub === 'api') return true // GET only heuristic; good enough
  }

  if (BASH_AUTO_ALLOW_COMMANDS.has(leadCmd)) return true

  return false
}

// Non-Bash tools Claude Code never prompts for
const NON_BASH_AUTO_ALLOW = new Set(['Read', 'LS', 'Glob'])

function parseAllowEntry(entry: string): { tool: string; pattern: string } | null {
  const paren = entry.indexOf('(')
  const colon = entry.indexOf(':')

  if (paren !== -1 && (colon === -1 || paren < colon)) {
    return {
      tool: entry.slice(0, paren),
      pattern: entry.slice(paren + 1, entry.endsWith(')') ? -1 : undefined)
    }
  }
  if (colon !== -1) {
    return { tool: entry.slice(0, colon), pattern: entry.slice(colon + 1) }
  }
  return { tool: entry, pattern: '*' }
}

function matchesPattern(pattern: string, value: string): boolean {
  if (pattern === '*') return true
  if (pattern.endsWith('*')) return value.startsWith(pattern.slice(0, -1))
  return value === pattern
}

function loadClaudeAllowList(): string[] {
  try {
    const settingsPath = path.join(os.homedir(), '.claude', 'settings.json')
    const raw = fs.readFileSync(settingsPath, 'utf-8')
    return JSON.parse(raw)?.permissions?.allow ?? []
  } catch {
    return []
  }
}

let cachedAllowList: Array<{ tool: string; pattern: string }> | null = null
let cacheTime = 0

function getClaudeAllowList(): Array<{ tool: string; pattern: string }> {
  if (!cachedAllowList || Date.now() - cacheTime > 60_000) {
    cachedAllowList = loadClaudeAllowList().map(parseAllowEntry).filter(Boolean) as Array<{
      tool: string
      pattern: string
    }>
    cacheTime = Date.now()
  }
  return cachedAllowList
}

export function invalidateAllowCache(): void {
  cachedAllowList = null
}

function matchesToolCall(entry: { tool: string; pattern: string }, tool: ToolCall): boolean {
  if (entry.tool !== tool.name) return false
  if (tool.name === 'Bash') {
    const cmd = (tool.input.command as string) ?? ''
    return matchesPattern(entry.pattern, cmd)
  }
  if (entry.pattern === '*') return true
  const filePath = (tool.input.file_path as string) ?? ''
  return matchesPattern(entry.pattern, filePath)
}

export function isToolAllowed(tool: ToolCall): boolean {
  if (NON_BASH_AUTO_ALLOW.has(tool.name)) return true
  if (tool.name === 'Bash') {
    const cmd = (tool.input.command as string) ?? ''
    if (isBashAutoAllowed(cmd)) return true
  }
  return getClaudeAllowList().some((entry) => matchesToolCall(entry, tool))
}

export function isToolIgnoredForProject(tool: ToolCall, projectName: string): boolean {
  const pattern = toolToPattern(tool.name, tool.input)
  if (!pattern) return false
  const { ignoredToolRules } = loadSettings()
  return ignoredToolRules
    .filter((r) => r.projectName === projectName)
    .some((r) => pattern.includes(r.pattern))
}

export function toolToPattern(toolName: string, toolInput: Record<string, unknown>): string {
  if (toolName === 'Bash') return (toolInput.command as string) ?? ''
  if (toolInput.file_path) return toolInput.file_path as string
  return JSON.stringify(toolInput)
}
