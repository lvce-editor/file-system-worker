import * as BrowserErrorTypes from '../BrowserErrorTypes/BrowserErrorTypes.ts'
import * as FileSystemDirectoryHandle from '../FileSystemDirectoryHandle/FileSystemDirectoryHandle.ts'
import * as Path from '../Path/Path.ts'
import * as PersistentFileHandle from '../PersistentFileHandle/PersistentFileHandle.ts'

interface Dependencies<T> {
  readonly addHandle: (uri: string, handle: T) => Promise<void>
  readonly getDirectoryHandle: (handle: T, name: string) => Promise<T>
  readonly getHandle: (uri: string) => Promise<T | undefined>
}

const pathSeparator = '/'

export const getDirectoryHandleWithDependencies = async <T>(uri: string, dependencies: Dependencies<T>): Promise<T | undefined> => {
  const handle = await dependencies.getHandle(uri)
  if (handle) {
    return handle
  }
  const dirname = Path.dirname(pathSeparator, uri)
  if (uri === dirname) {
    return undefined
  }
  const parentHandle = await getDirectoryHandleWithDependencies(dirname, dependencies)
  if (!parentHandle) {
    return undefined
  }
  const baseName = Path.getBaseName(pathSeparator, uri)
  try {
    const directoryHandle = await dependencies.getDirectoryHandle(parentHandle, baseName)
    await dependencies.addHandle(uri, directoryHandle)
    return directoryHandle
  } catch (error) {
    if (BrowserErrorTypes.isNotFoundError(error)) return undefined
    throw error
  }
}

export const getDirectoryHandle = async (uri: string): Promise<FileSystemDirectoryHandle | undefined> => {
  return getDirectoryHandleWithDependencies(uri, {
    addHandle: PersistentFileHandle.addHandle,
    getDirectoryHandle: FileSystemDirectoryHandle.getDirectoryHandle,
    getHandle: async (path) => {
      const handle = await PersistentFileHandle.getHandle(path)
      return handle as FileSystemDirectoryHandle | undefined
    },
  })
}
