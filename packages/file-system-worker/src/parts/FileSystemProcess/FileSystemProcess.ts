import { FileSystemProcess } from '@lvce-editor/rpc-registry'

// @ts-ignore
export const { set, rename, copy, mkdir, getFolderSize, writeFile, stat, readJson, getPathSeparator, getRealPath, readDirWithFileTypes, readFile, remove, exists } =
  FileSystemProcess
