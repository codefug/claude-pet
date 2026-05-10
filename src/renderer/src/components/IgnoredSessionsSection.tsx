import { type JSX, type KeyboardEvent, useRef, useState } from 'react'
import type { IgnoredToolRule } from '../../../shared/schemas/settings'

interface Props {
  rules: IgnoredToolRule[]
  onRulesChange: (rules: IgnoredToolRule[]) => void
}

function parseLine(line: string): IgnoredToolRule | null {
  const space = line.indexOf(' ')
  if (space === -1) return null
  const projectName = line.slice(0, space).trim()
  const pattern = line.slice(space + 1).trim()
  if (!projectName || !pattern) return null
  return { projectName, pattern }
}

export default function IgnoredSessionsSection({ rules, onRulesChange }: Props): JSX.Element {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = (): void => {
    const rule = parseLine(input)
    if (!rule) return
    const exists = rules.some(
      (r) => r.projectName === rule.projectName && r.pattern === rule.pattern
    )
    if (exists) return
    onRulesChange([...rules, rule])
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleAdd()
  }

  const handleRemove = (index: number): void => {
    onRulesChange(rules.filter((_, i) => i !== index))
  }

  return (
    <div className="mb-3">
      <div className="text-[10px] font-semibold text-white/30 tracking-[0.06em] uppercase mb-2">
        무시할 명령어
      </div>

      <div className="flex gap-1 mb-1">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="<프로젝트명> <명령어>"
          className="flex-1 text-[10px] px-2 py-1 rounded-md border border-white/12 bg-white/6 text-white/70 outline-none min-w-0 font-mono"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] px-2 py-1 rounded-md border-none bg-[rgba(245,200,66,0.2)] text-[#F5C842] cursor-pointer shrink-0"
        >
          추가
        </button>
      </div>

      <div className="text-[9px] text-white/20 mb-2 font-mono">예: claude-pet pnpm run build</div>

      {rules.length === 0 ? (
        <div className="text-[10px] text-white/20 px-2 py-0.5">없음</div>
      ) : (
        <div className="flex flex-col gap-1">
          {rules.map((rule, i) => (
            <div
              key={`${rule.projectName}-${rule.pattern}`}
              className="flex items-start gap-2 px-2 py-1.25 rounded-lg bg-[rgba(245,200,66,0.07)]"
            >
              <div className="flex-1 text-[11px] text-[rgba(245,200,66,0.7)] font-mono break-all">
                {rule.projectName} {rule.pattern}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="text-[10px] text-[rgba(255,80,80,0.7)] bg-[rgba(255,80,80,0.1)] border-none rounded px-1.5 py-0.5 cursor-pointer shrink-0"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 text-[9px] text-white/18 leading-relaxed">
        프로젝트명 커맨드 형식 · 커맨드가 포함되면 working으로 처리
      </div>
    </div>
  )
}
