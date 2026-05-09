import type { SessionStatus } from '../types'
import workingSvg from '../assets/yorkie/working.svg'
import waitingSvg from '../assets/yorkie/waiting.svg'
import doneSvg from '../assets/yorkie/done.svg'

const SVG_MAP: Partial<Record<SessionStatus, string>> = {
  working: workingSvg,
  waiting_permission: waitingSvg,
  done: doneSvg
}

const PLACEHOLDER_COLORS: Record<SessionStatus, string> = {
  working: '#F5C842',
  waiting_permission: '#F5813A',
  done: '#4CAF7D',
  aborted: '#888899'
}

interface Props {
  status: SessionStatus
}

export default function Yorkie({ status }: Props): React.JSX.Element {
  const svg = SVG_MAP[status]
  if (svg) {
    return <img src={svg} width={48} height={48} style={{ display: 'block' }} />
  }

  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: PLACEHOLDER_COLORS[status],
        opacity: 0.3,
        flexShrink: 0
      }}
    />
  )
}
