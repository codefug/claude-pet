import { useEffect, useState } from 'react'
import type { IgnoredToolRule } from '../../../main/settings'
import type { SessionStatus } from '../types'
import type { CharacterImages } from './useCharacterImages'

const EMPTY_IMAGES: CharacterImages = {
  working: null,
  waiting_permission: null,
  done: null,
  aborted: null,
  interrupted: null
}

export function useSettings(onImagesChange: (images: CharacterImages) => void): {
  images: CharacterImages
  sessionWindowHours: number
  ignoredToolRules: IgnoredToolRule[]
  handleWindowChange: (hours: number) => Promise<void>
  handlePick: (status: SessionStatus) => Promise<void>
  handleClear: (status: SessionStatus) => Promise<void>
  handleRulesChange: (rules: IgnoredToolRule[]) => Promise<void>
} {
  const [images, setImages] = useState<CharacterImages>(EMPTY_IMAGES)
  const [sessionWindowHours, setSessionWindowHours] = useState(5)
  const [ignoredToolRules, setIgnoredToolRules] = useState<IgnoredToolRule[]>([])

  useEffect(() => {
    window.claudePet.getSettings().then((s) => {
      setImages(s.characterImages)
      setSessionWindowHours(s.sessionWindowHours)
      setIgnoredToolRules(s.ignoredToolRules)
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

  const handleRulesChange = async (rules: IgnoredToolRule[]): Promise<void> => {
    setIgnoredToolRules(rules)
    await window.claudePet.setIgnoredToolRules(rules)
  }

  return {
    images,
    sessionWindowHours,
    ignoredToolRules,
    handleWindowChange,
    handlePick,
    handleClear,
    handleRulesChange
  }
}
