import { z } from 'zod'

export const IgnoredToolRuleSchema = z.object({
  projectName: z.string(),
  pattern: z.string()
})

export const CharacterImagesSchema = z.object({
  working: z.string().nullable(),
  waiting_permission: z.string().nullable(),
  done: z.string().nullable(),
  aborted: z.string().nullable()
})

export const AppSettingsSchema = z.object({
  sessionWindowHours: z.number().refine((v) => v > 0 && Number.isFinite(v)),
  ignoredToolRules: z.array(IgnoredToolRuleSchema),
  characterImages: CharacterImagesSchema
})

export type IgnoredToolRule = z.infer<typeof IgnoredToolRuleSchema>
export type CharacterImages = z.infer<typeof CharacterImagesSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>
