import { useCallback, useEffect, useState } from 'react'
import type { SessionStatus } from '../types'

export type CharacterImages = Record<SessionStatus, string | null>

const EMPTY_IMAGES: CharacterImages = {
  working: null,
  waiting_permission: null,
  done: null,
  aborted: null
}

export function useCharacterImages(): {
  images: CharacterImages
  refresh: () => void
  setImages: (images: CharacterImages) => void
} {
  const [images, setImages] = useState<CharacterImages>(EMPTY_IMAGES)

  const refresh = useCallback((): void => {
    window.claudePet.getSettings().then((s) => setImages(s.characterImages))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { images, refresh, setImages }
}
