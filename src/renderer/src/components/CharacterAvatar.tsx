import type { JSX } from 'react'
import abortedSvg from '../assets/yorkie/aborted.svg'
import doneSvg from '../assets/yorkie/done.svg'
import waitingSvg from '../assets/yorkie/waiting.svg'
import workingSvg from '../assets/yorkie/working.svg'
import type { SessionStatus } from '../types'

const DEFAULT_SVG: Record<SessionStatus, string> = {
  working: workingSvg,
  waiting_permission: waitingSvg,
  done: doneSvg,
  aborted: abortedSvg
}

interface Props {
  status: SessionStatus
  customImage?: string | null
}

export default function CharacterAvatar({ status, customImage }: Props): JSX.Element {
  const src = customImage ?? DEFAULT_SVG[status]
  return (
    <img
      src={src}
      alt={status}
      width={48}
      height={48}
      className={`block object-contain ${customImage ? 'rounded-[6px]' : 'rounded-none'}`}
    />
  )
}
