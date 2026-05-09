import type { SessionStatus } from '../types'
import workingSvg from '../assets/yorkie/working.svg'
import waitingSvg from '../assets/yorkie/waiting.svg'
import doneSvg from '../assets/yorkie/done.svg'
import abortedSvg from '../assets/yorkie/aborted.svg'
import interruptedSvg from '../assets/yorkie/interrupted.svg'

const DEFAULT_SVG: Record<SessionStatus, string> = {
  working: workingSvg,
  waiting_permission: waitingSvg,
  done: doneSvg,
  aborted: abortedSvg,
  interrupted: interruptedSvg
}

interface Props {
  status: SessionStatus
  customImage?: string | null
}

export default function CharacterAvatar({ status, customImage }: Props): React.JSX.Element {
  const src = customImage ?? DEFAULT_SVG[status]
  return (
    <img
      src={src}
      width={48}
      height={48}
      style={{ display: 'block', objectFit: 'contain', borderRadius: customImage ? '6px' : 0 }}
    />
  )
}
