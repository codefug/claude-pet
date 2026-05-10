import type { JSX } from 'react'
import type { Language } from '../../../shared/schemas/settings'
import { useTranslation } from '../i18n/useTranslation'

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' }
]

interface Props {
  value: Language
  onChange: (language: Language) => void
}

export default function LanguageSection({ value, onChange }: Props): JSX.Element {
  const t = useTranslation()

  return (
    <div className="mb-4">
      <div className="text-[10px] font-semibold text-white/30 tracking-[0.06em] uppercase mb-2">
        {t.settings.language}
      </div>
      <div className="flex gap-1">
        {LANGUAGE_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`text-[10px] px-2 py-0.75 rounded-md border-none cursor-pointer ${
              value === opt.value
                ? 'bg-[rgba(245,200,66,0.25)] text-[#F5C842] font-bold'
                : 'bg-white/8 text-white/45 font-normal'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
