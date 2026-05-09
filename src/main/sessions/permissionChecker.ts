import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

interface ToolCall {
  name: string
  input: Record<string, unknown>
}

// "Bash(git *)" → { tool: "Bash", pattern: "git *" }
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
  // 단순 tool 이름 (패턴 없음)
  return { tool: entry, pattern: '*' }
}

// glob-lite: * = 임의 문자열, 나머지는 literal prefix 매칭
function matchesPattern(pattern: string, value: string): boolean {
  if (pattern === '*') return true
  if (pattern.endsWith('*')) {
    return value.startsWith(pattern.slice(0, -1))
  }
  return value === pattern
}

function loadAllowList(): Array<{ tool: string; pattern: string }> {
  try {
    const settingsPath = path.join(os.homedir(), '.claude', 'settings.json')
    const raw = fs.readFileSync(settingsPath, 'utf-8')
    const settings = JSON.parse(raw)
    const allows: string[] = settings?.permissions?.allow ?? []
    return allows.map(parseAllowEntry).filter(Boolean) as Array<{ tool: string; pattern: string }>
  } catch {
    return []
  }
}

// settings.json은 프로세스 수명 동안 거의 안 바뀌므로 1분 캐시
let cachedAllowList: Array<{ tool: string; pattern: string }> | null = null
let cacheTime = 0

function getAllowList() {
  if (!cachedAllowList || Date.now() - cacheTime > 60_000) {
    cachedAllowList = loadAllowList()
    cacheTime = Date.now()
  }
  return cachedAllowList
}

// Bash tool의 command 인수 추출
function getBashCommand(input: Record<string, unknown>): string {
  return (input.command as string) ?? ''
}

// tool call이 허용 목록에 있으면 true (permission 프롬프트 없이 실행)
export function isToolAllowed(tool: ToolCall): boolean {
  const allowList = getAllowList()

  for (const entry of allowList) {
    if (entry.tool !== tool.name) continue

    if (tool.name === 'Bash') {
      const cmd = getBashCommand(tool.input)
      if (matchesPattern(entry.pattern, cmd)) return true
    } else {
      // Read, Edit, Write 등: input.file_path 또는 * 패턴
      if (entry.pattern === '*') return true
      const filePath = (tool.input.file_path as string) ?? ''
      if (matchesPattern(entry.pattern, filePath)) return true
    }
  }

  return false
}
