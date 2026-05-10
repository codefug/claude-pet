import type { JSX } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { useSessions } from '../store/sessionStore'
import { useSettingsStore } from '../store/settingsStore'
import SessionCard from './SessionCard'

export default function SessionList(): JSX.Element {
  const { images } = useSettingsStore()
  const { sessions } = useSessions()
  const t = useTranslation()

  if (sessions.length === 0) {
    return (
      <div className="text-white/25 text-xs text-center mt-10">{t.sessions.empty}</div>
    )
  }

  return (
    <>
      {sessions.map((s) => (
        <SessionCard key={s.id} session={s} customImage={images[s.status]} />
      ))}
    </>
  )
}
