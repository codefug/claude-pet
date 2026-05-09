export function formatProjectName(raw: string): string {
  const parts = raw.split('/')
  return parts[parts.length - 1] || raw
}

export function decodeProjectPath(dirName: string): string {
  return dirName.replace(/-/g, '/').replace(/^\//, '')
}
