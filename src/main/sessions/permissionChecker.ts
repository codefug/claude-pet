interface ToolParams {
  toolName: string
  toolInput: Record<string, unknown>
}

export function toolToPattern({ toolName, toolInput }: ToolParams): string {
  if (toolName === 'Bash') return typeof toolInput.command === 'string' ? toolInput.command : ''
  if (typeof toolInput.file_path === 'string') return toolInput.file_path
  return JSON.stringify(toolInput)
}
