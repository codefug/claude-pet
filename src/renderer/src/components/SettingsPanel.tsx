import { useState, useEffect } from 'react'
import type { SessionStatus } from '../types'

interface CharacterImages {
  working: string | null
  waiting_permission: string | null
  done: string | null
  aborted: string | null
}

const STATUS_LABELS: Record<SessionStatus, string> = {
  working: 'Working',
  waiting_permission: 'Permission',
  done: 'Done',
  aborted: 'Aborted'
}

const STATUSES: SessionStatus[] = ['working', 'waiting_permission', 'done', 'aborted']

interface Props {
  onClose: () => void
  onImagesChange: (images: CharacterImages) => void
}

const WINDOW_OPTIONS = [5, 12, 24, 48, 72]

export default function SettingsPanel({ onClose, onImagesChange }: Props): React.JSX.Element {
  const [images, setImages] = useState<CharacterImages>({
    working: null,
    waiting_permission: null,
    done: null,
    aborted: null
  })
  const [sessionWindowHours, setSessionWindowHours] = useState(5)

  useEffect(() => {
    window.claudePet.getSettings().then((s) => {
      setImages(s.characterImages)
      setSessionWindowHours(s.sessionWindowHours)
    })
  }, [])

  const handleWindowChange = async (hours: number): Promise<void> => {
    setSessionWindowHours(hours)
    await window.claudePet.setSessionWindow(hours)
  }

  const handlePick = async (status: SessionStatus): Promise<void> => {
    const dataUrl = await window.claudePet.setCharacterImage(status)
    if (dataUrl) {
      const next = { ...images, [status]: dataUrl }
      setImages(next)
      onImagesChange(next)
    }
  }

  const handleClear = async (status: SessionStatus): Promise<void> => {
    await window.claudePet.clearCharacterImage(status)
    const next = { ...images, [status]: null }
    setImages(next)
    onImagesChange(next)
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(14,14,22,0.97)',
        borderRadius: '16px',
        padding: '14px 12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '14px'
        }}
      >
        <div
          style={{
            flex: 1,
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          Settings
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: 1,
            padding: '0 2px'
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}
      >
        세션 표시 기간
      </div>

      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}
      >
        {WINDOW_OPTIONS.map((h) => (
          <button
            key={h}
            onClick={() => handleWindowChange(h)}
            style={{
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: sessionWindowHours === h ? 'rgba(245,200,66,0.25)' : 'rgba(255,255,255,0.08)',
              color: sessionWindowHours === h ? '#F5C842' : 'rgba(255,255,255,0.45)',
              fontWeight: sessionWindowHours === h ? 700 : 400
            }}
          >
            {h}h
          </button>
        ))}
      </div>

      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}
      >
        캐릭터 이미지
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {STATUSES.map((status) => (
          <div
            key={status}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)'
            }}
          >
            {images[status] ? (
              <img
                src={images[status]!}
                width={32}
                height={32}
                style={{ borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.08)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
              >
                🐾
              </div>
            )}
            <div style={{ flex: 1, fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
              {STATUS_LABELS[status]}
            </div>
            <button
              onClick={() => handlePick(status)}
              style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: 'pointer'
              }}
            >
              선택
            </button>
            {images[status] && (
              <button
                onClick={() => handleClear(status)}
                style={{
                  fontSize: '10px',
                  color: 'rgba(255,80,80,0.7)',
                  background: 'rgba(255,80,80,0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  cursor: 'pointer'
                }}
              >
                초기화
              </button>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '12px',
          fontSize: '9px',
          color: 'rgba(255,255,255,0.2)',
          lineHeight: 1.5
        }}
      >
        PNG, JPG, GIF, WebP, SVG 지원
        <br />
        설정한 이미지가 없으면 기본 요키 캐릭터 사용
      </div>
    </div>
  )
}
