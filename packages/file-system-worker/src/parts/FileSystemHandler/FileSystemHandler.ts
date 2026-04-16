export interface FileSystemHandler {
  readonly createFile: (uri: string) => Promise<void>
  readonly exists: (uri: string) => Promise<boolean>
  readonly getPathSeparator: (root: string) => Promise<string>
  readonly getRealPath: (path: string) => Promise<string>
  readonly mkdir: (uri: string) => Promise<void>
  readonly readDirWithFileTypes: (uri: string) => Promise<readonly any[]>
  readonly readFile: (uri: string) => Promise<string>
  readonly readFileAsBlob: (uri: string) => Promise<Blob>
  readonly readJson: (uri: string) => Promise<any>
  readonly remove: (uri: string) => Promise<void>
  readonly rename: (oldUri: string, newUri: string) => Promise<void>
  readonly stat: (dirent: string) => Promise<any>
  readonly writeFile: (uri: string, content: string) => Promise<void>
}
