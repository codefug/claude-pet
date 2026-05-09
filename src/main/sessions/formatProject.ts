export function decodeProjectPath(dirName: string): string {
  return dirName.replace(/-/g, '/').replace(/^\//, '')
}
