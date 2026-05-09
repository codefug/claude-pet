export function toolToPattern(toolName: string, toolInput: Record<string, unknown>): string {
  if (toolName === 'Bash') return (toolInput.command as string) ?? ''
  if (toolInput.file_path) return toolInput.file_path as string
  return JSON.stringify(toolInput)
}
