import { z } from 'zod'

export const CharacterImagesSchema = z.object({
  working: z.string().nullable(),
  waiting_permission: z.string().nullable(),
  done: z.string().nullable(),
  aborted: z.string().nullable()
})

export const AppSettingsSchema = z.object({
  sessionWindowHours: z.number().refine((v) => v > 0 && Number.isFinite(v)),
  characterImages: CharacterImagesSchema
})

export type CharacterImages = z.infer<typeof CharacterImagesSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>
