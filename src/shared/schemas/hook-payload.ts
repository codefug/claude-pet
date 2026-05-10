import { z } from 'zod'
import { HOOK_EVENT, NOTIFICATION_TYPE } from '../hook-events'

const BasePayloadSchema = z.object({
  session_id: z.string(),
  hook_event_name: z.string(),
  cwd: z.string().optional()
})

export const PrePostToolPayloadSchema = BasePayloadSchema.extend({
  hook_event_name: z.literal(HOOK_EVENT.PRE_TOOL_USE).or(z.literal(HOOK_EVENT.POST_TOOL_USE))
})

export const PermissionRequestPayloadSchema = BasePayloadSchema.extend({
  hook_event_name: z.literal(HOOK_EVENT.PERMISSION_REQUEST),
  tool_name: z.string().optional(),
  tool_input: z.record(z.string(), z.unknown()).optional()
})

export const NotificationPayloadSchema = BasePayloadSchema.extend({
  hook_event_name: z.literal(HOOK_EVENT.NOTIFICATION),
  notification_type: z.enum([NOTIFICATION_TYPE.PERMISSION_PROMPT]).optional()
})

export const TerminalPayloadSchema = BasePayloadSchema.extend({
  hook_event_name: z.enum([
    HOOK_EVENT.PERMISSION_DENIED,
    HOOK_EVENT.STOP,
    HOOK_EVENT.STOP_FAILURE,
    HOOK_EVENT.SESSION_END,
    HOOK_EVENT.SESSION_START
  ])
})

export const HookPayloadSchema = z.discriminatedUnion('hook_event_name', [
  PrePostToolPayloadSchema,
  PermissionRequestPayloadSchema,
  NotificationPayloadSchema,
  TerminalPayloadSchema
])

export type HookPayload = z.infer<typeof HookPayloadSchema>
export type PermissionRequestPayload = z.infer<typeof PermissionRequestPayloadSchema>
export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>
