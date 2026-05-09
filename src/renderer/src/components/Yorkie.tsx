import type { SessionStatus } from '../types'
import workingSvg from '../assets/yorkie/working.svg'

interface Props {
  status: SessionStatus
}

export default function Yorkie({ status }: Props): React.JSX.Element {
  if (status === 'working') {
    return <img src={workingSvg} width={48} height={48} style={{ display: 'block' }} />
  }

  // 나머지 상태는 색상 원으로 임시 표시 (11b~d에서 SVG 추가)
  const colors: Record<SessionStatus, string> = {
    working: '#F5C842',
    waiting_permission: '#F5813A',
    done: '#4CAF7D',
    aborted: '#888899'
  }

  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: colors[status],
        opacity: 0.3,
        flexShrink: 0
      }}
    />
  )
}
