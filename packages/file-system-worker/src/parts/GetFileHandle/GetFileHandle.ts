import type { HtmlHandle } from '../HtmlHandle/HtmlHandle.ts'
import * as FileSystemDirectoryHandle from '../FileSystemDirectoryHandle/FileSystemDirectoryHandle.ts'
import * as GetDirectoryHandle from '../GetDirectoryHandle/GetDirectoryHandle.ts'
import * as Path from '../Path/Path.ts'
import * as PersistentFileHandle from '../PersistentFileHandle/PersistentFileHandle.ts'

const pathSeparator = '/'

export const getFileHandle = async (uri: string, options?: Readonly<FileSystemGetFileOptions>): Promise<Exclude<HtmlHandle, FileSystemDirectoryHandle> | undefined> => {
  const handle = await PersistentFileHandle.getHandle(uri)
  if (handle) {
    return handle as Exclude<HtmlHandle, FileSystemDirectoryHandle>
  }
  const dirname = Path.dirname(pathSeparator, uri)
  const parentHandle = await GetDirectoryHandle.getDirectoryHandle(dirname)
  if (!parentHandle) {
    return undefined
  }
  const baseName = Path.getBaseName(pathSeparator, uri)
  const fileHandle = await FileSystemDirectoryHandle.getFileHandle(parentHandle, baseName, options)
  return fileHandle
}
