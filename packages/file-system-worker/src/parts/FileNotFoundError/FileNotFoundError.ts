export class FileNotFoundError extends Error {
  readonly code = 'ENOENT'
  constructor(path: string) {
    super(`File not found '${path}'`)
    this.name = 'FileNotFoundError'
  }
}
