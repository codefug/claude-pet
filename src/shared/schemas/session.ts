import { z } from 'zod'

export const SessionStatusSchema = z.enum(['working', 'waiting_permission', 'done', 'aborted'])

export const PendingToolSchema = z.object({
  name: z.string(),
  input: z.record(z.string(), z.unknown())
})

export const SessionDataSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  projectPath: z.string(),
  status: SessionStatusSchema,
  lastMessageAt: z.string(),
  summary: z.string().nullable(),
  pendingTool: PendingToolSchema.nullable()
})

export const SessionSchema = SessionDataSchema.extend({
  lastMessageAt: z.date()
})

export const SessionDataArraySchema = z.array(SessionDataSchema)

export type SessionStatus = z.infer<typeof SessionStatusSchema>
export type PendingTool = z.infer<typeof PendingToolSchema>
export type SessionData = z.infer<typeof SessionDataSchema>
export type Session = z.infer<typeof SessionSchema>
