import { FileSystemProcess } from '@lvce-editor/rpc-registry'

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
