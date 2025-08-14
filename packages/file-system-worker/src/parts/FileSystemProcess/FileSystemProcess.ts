import { FileSystemProcess } from '@lvce-editor/rpc-registry'

export const {
  set,
  rename,
  copy,
  mkdir,
  invoke,
  getFolderSize,
  writeFile,
  stat,
  readJson,
  getPathSeparator,
  getRealPath,
  readDirWithFileTypes,
  readFile,
  remove,
  exists,
  appendFile,
} = FileSystemProcess
