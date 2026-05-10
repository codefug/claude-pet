import { z } from 'zod'

export const LanguageSchema = z.enum(['en', 'ko'])

export const CharacterImagesSchema = z.object({
  working: z.string().nullable(),
  waiting_permission: z.string().nullable(),
  done: z.string().nullable(),
  aborted: z.string().nullable()
})

export const AppSettingsSchema = z.object({
  sessionWindowHours: z.number().refine((v) => v > 0 && Number.isFinite(v)),
  opacity: z.number().min(0.2).max(1).default(0.75),
  characterImages: CharacterImagesSchema,
  language: LanguageSchema.default('en')
})

export type Language = z.infer<typeof LanguageSchema>
export type CharacterImages = z.infer<typeof CharacterImagesSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>
