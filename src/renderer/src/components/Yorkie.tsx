import type { SessionStatus } from '../types'
import workingSvg from '../assets/yorkie/working.svg'
import waitingSvg from '../assets/yorkie/waiting.svg'
import doneSvg from '../assets/yorkie/done.svg'
import abortedSvg from '../assets/yorkie/aborted.svg'

const SVG_MAP: Record<SessionStatus, string> = {
  working: workingSvg,
  waiting_permission: waitingSvg,
  done: doneSvg,
  aborted: abortedSvg
}

interface Props {
  status: SessionStatus
}

export default function Yorkie({ status }: Props): React.JSX.Element {
  return <img src={SVG_MAP[status]} width={48} height={48} style={{ display: 'block' }} />
}
