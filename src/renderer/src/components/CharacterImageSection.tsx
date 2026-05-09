import type { SessionStatus } from '../types'

export interface CharacterImages {
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
  images: CharacterImages
  onPick: (status: SessionStatus) => void
  onClear: (status: SessionStatus) => void
}

export default function CharacterImageSection({ images, onPick, onClear }: Props): React.JSX.Element {
  return (
    <div style={{ marginBottom: '16px' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
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
              onClick={() => onPick(status)}
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
                onClick={() => onClear(status)}
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
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', lineHeight: 1.5 }}>
        PNG, JPG, GIF, WebP, SVG 지원
        <br />
        설정한 이미지가 없으면 기본 요키 캐릭터 사용
      </div>
    </div>
  )
}
