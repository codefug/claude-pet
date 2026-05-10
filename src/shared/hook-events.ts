export const HOOK_EVENT = {
  PRE_TOOL_USE: 'PreToolUse',
  POST_TOOL_USE: 'PostToolUse',
  PERMISSION_REQUEST: 'PermissionRequest',
  PERMISSION_DENIED: 'PermissionDenied',
  NOTIFICATION: 'Notification',
  STOP: 'Stop',
  STOP_FAILURE: 'StopFailure',
  SESSION_START: 'SessionStart',
  SESSION_END: 'SessionEnd'
} as const

export const NOTIFICATION_TYPE = {
  PERMISSION_PROMPT: 'permission_prompt'
} as const
