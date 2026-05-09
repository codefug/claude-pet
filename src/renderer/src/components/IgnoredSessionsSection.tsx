import { useRef, useState } from 'react'
import type { IgnoredToolRule } from '../../../main/settings'

interface Props {
  rules: IgnoredToolRule[]
  onRulesChange: (rules: IgnoredToolRule[]) => void
}

const sectionLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.3)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '8px'
}

function parseLine(line: string): IgnoredToolRule | null {
  const space = line.indexOf(' ')
  if (space === -1) return null
  const projectName = line.slice(0, space).trim()
  const pattern = line.slice(space + 1).trim()
  if (!projectName || !pattern) return null
  return { projectName, pattern }
}

export default function IgnoredSessionsSection({ rules, onRulesChange }: Props): React.JSX.Element {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleAdd()
  }

  const handleRemove = (index: number): void => {
    onRulesChange(rules.filter((_, i) => i !== index))
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={sectionLabel}>무시할 명령어</div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="<프로젝트명> <명령어>"
          style={{
            flex: 1,
            fontSize: '10px',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.7)',
            outline: 'none',
            minWidth: 0,
            fontFamily: 'monospace'
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          style={{
            fontSize: '10px',
            padding: '4px 8px',
            borderRadius: '6px',
            border: 'none',
            background: 'rgba(245,200,66,0.2)',
            color: '#F5C842',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          추가
        </button>
      </div>

      <div
        style={{
          fontSize: '9px',
          color: 'rgba(255,255,255,0.2)',
          marginBottom: '8px',
          fontFamily: 'monospace'
        }}
      >
        예: claude-pet pnpm run build
      </div>

      {rules.length === 0 ? (
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', padding: '2px 8px' }}>
          없음
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {rules.map((rule, i) => (
            <div
              key={`${rule.projectName}-${rule.pattern}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '5px 8px',
                borderRadius: '8px',
                background: 'rgba(245,200,66,0.07)'
              }}
            >
              <div
                style={{
                  flex: 1,
                  fontSize: '11px',
                  color: 'rgba(245,200,66,0.7)',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}
              >
                {rule.projectName} {rule.pattern}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                style={{
                  fontSize: '10px',
                  color: 'rgba(255,80,80,0.7)',
                  background: 'rgba(255,80,80,0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: '8px',
          fontSize: '9px',
          color: 'rgba(255,255,255,0.18)',
          lineHeight: 1.5
        }}
      >
        프로젝트명 커맨드 형식 · 커맨드가 포함되면 working으로 처리
      </div>
    </div>
  )
}
