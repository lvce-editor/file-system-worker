import { FileSystemProcess } from '@lvce-editor/rpc-registry'

export const getFileHash = async (uri: string): Promise<string> => {
  return FileSystemProcess.invoke('FileSystem.getFileHash', uri)
}

export const getFileHashes = async (uris: readonly string[]): Promise<readonly (string | null)[]> => {
  return FileSystemProcess.invoke('FileSystem.getFileHashes', uris)
}

export const {
  appendFile,
  copy,
  exists,
  getFolderSize,
  getPathSeparator,
  getRealPath,
  invoke,
  mkdir,
  readDirWithFileTypes,
  readFile,
  readJson,
  remove,
  rename,
  set,
  stat,
  writeFile,
} = FileSystemProcess
