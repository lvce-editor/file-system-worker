import { VError } from '@lvce-editor/verror'
import * as BrowserErrorTypes from '../BrowserErrorTypes/BrowserErrorTypes.ts'
import * as FileHandlePermissionType from '../FileHandlePermissionType/FileHandlePermissionType.ts'
import * as FileHandleTypeMap from '../FileHandleTypeMap/FileHandleTypeMap.ts'
import { FileNotFoundError } from '../FileNotFoundError/FileNotFoundError.ts'
import * as FileSystemDirectoryHandle from '../FileSystemDirectoryHandle/FileSystemDirectoryHandle.ts'
import * as FileSystemFileHandle from '../FileSystemFileHandle/FileSystemFileHandle.ts'
import * as FileSytemHandlePermission from '../FileSystemHandlePermission/FileSystemHandlePermission.ts'
import * as GetDirectoryHandle from '../GetDirectoryHandle/GetDirectoryHandle.ts'
import * as GetFileHandle from '../GetFileHandle/GetFileHandle.ts'
import * as Path from '../Path/Path.ts'
import * as PersistentFileHandle from '../PersistentFileHandle/PersistentFileHandle.ts'

interface Dirent {
  readonly name: string
  readonly type: number
}

const pathSeparator = '/'

export const exists = async (uri: string): Promise<boolean> => {
  const handle = await PersistentFileHandle.getHandle(uri)
  return Boolean(handle)
}

const getDirent = (handle: FileSystemHandle): Dirent => {
  const { kind, name } = handle
  const type = FileHandleTypeMap.getDirentType(kind)
  return {
    name,
    type,
  }
}

export const getDirents = (handles: readonly FileSystemHandle[]): Dirent[] => {
  const dirents = handles.map(getDirent)
  return dirents
}

const getChildHandlesFallbackPrompt = async (handle: FileSystemDirectoryHandle): Promise<FileSystemHandle[]> => {
  // TODO cannot prompt without user activation, else error occurs
  // maybe need to show
  const permissionTypeNow = await FileSytemHandlePermission.requestPermission(handle, {
    mode: 'readwrite',
  })
  switch (permissionTypeNow) {
    case FileHandlePermissionType.Denied:
    case FileHandlePermissionType.Prompt:
      return []
    case FileHandlePermissionType.Granted:
      return FileSystemDirectoryHandle.getChildHandles(handle)
    default:
      return []
  }
}

const getChildHandlesFallback = async (handle: FileSystemDirectoryHandle): Promise<FileSystemHandle[]> => {
  const permissionType = await FileSytemHandlePermission.queryPermission(handle, {
    mode: 'readwrite',
  })
  switch (permissionType) {
    case FileHandlePermissionType.Denied:
      return []
    case FileHandlePermissionType.Granted:
      throw new VError('invalid state')
    case FileHandlePermissionType.Prompt:
      return await getChildHandlesFallbackPrompt(handle)
    default:
      return []
  }
}

export const getChildHandles = async (handle: FileSystemDirectoryHandle): Promise<FileSystemHandle[]> => {
  try {
    return await FileSystemDirectoryHandle.getChildHandles(handle)
  } catch (error) {
    if (BrowserErrorTypes.isNotAllowedError(error)) {
      return getChildHandlesFallback(handle)
    }
    throw new VError(error, 'failed to get child handles')
  }
}

export const readDirWithFileTypes = async (uri: string): Promise<Dirent[]> => {
  try {
    const handle = await PersistentFileHandle.getHandle(uri)
    if (!handle) {
      throw new Error(`File system handle not found for ${uri}`)
    }
    const childHandles = await getChildHandles(handle as FileSystemDirectoryHandle)
    await PersistentFileHandle.addHandles(uri, childHandles as (FileSystemDirectoryHandle | FileSystemFileHandle)[])
    const dirents = getDirents(childHandles)
    return dirents
  } catch (error) {
    throw new VError(error, 'failed to read directory')
  }
}

export const readFile = async (uri: string): Promise<string> => {
  try {
    const handle = await GetFileHandle.getFileHandle(uri)
    if (!handle) {
      throw new VError(`File not found ${uri}`)
    }
    const file = await FileSystemFileHandle.getFile(handle)
    const text = await file.text()
    return text
  } catch (error) {
    if (BrowserErrorTypes.isNotFoundError(error)) {
      throw new FileNotFoundError(uri)
    }
    throw new VError(error, 'Failed to read file')
  }
}

export const writeFile = async (uri: string, content: string): Promise<void> => {
  try {
    const handle = await GetFileHandle.getFileHandle(uri, {
      create: true,
    })
    if (!handle) {
      throw new VError(`File not found ${uri}`)
    }
    await FileSystemFileHandle.write(handle, content)
  } catch (error) {
    throw new VError(error, 'Failed to save file')
  }
}

export const writeBlob = async (uri: string, blob: Blob): Promise<void> => {
  try {
    const handle = await GetFileHandle.getFileHandle(uri, {
      create: true,
    })
    if (!handle) {
      throw new VError(`File not found ${uri}`)
    }
    await FileSystemFileHandle.write(handle, blob)
  } catch (error) {
    throw new VError(error, 'Failed to save file')
  }
}

export const remove = async (uri: string): Promise<void> => {
  try {
    const dirname = Path.dirname(pathSeparator, uri)
    const parentHandle = await GetDirectoryHandle.getDirectoryHandle(dirname)
    if (!parentHandle) {
      throw new FileNotFoundError(uri)
    }
    const existingHandle = await PersistentFileHandle.getHandle(uri)
    const baseName = Path.getBaseName(pathSeparator, uri)
    if (existingHandle?.kind === 'directory') {
      await parentHandle.removeEntry(baseName, {
        recursive: true,
      })
    } else {
      await parentHandle.removeEntry(baseName)
    }
    PersistentFileHandle.removeHandle(uri)
  } catch (error) {
    if (error instanceof FileNotFoundError || BrowserErrorTypes.isNotFoundError(error)) {
      throw new FileNotFoundError(uri)
    }
    throw new VError(error, 'Failed to remove')
  }
}

const ensureDirectoryHandle = async (uri: string): Promise<FileSystemDirectoryHandle> => {
  const existingHandle = await PersistentFileHandle.getHandle(uri)
  if (existingHandle) {
    if (existingHandle.kind !== 'directory') {
      throw new VError(`Expected directory at ${uri}`)
    }
    return existingHandle
  }
  const dirname = Path.dirname(pathSeparator, uri)
  if (uri === dirname) {
    throw new VError(`Directory handle not found for ${uri}`)
  }
  let parentHandle = await GetDirectoryHandle.getDirectoryHandle(dirname)
  if (!parentHandle) {
    parentHandle = await ensureDirectoryHandle(dirname)
  }
  const baseName = Path.getBaseName(pathSeparator, uri)
  const directoryHandle = await parentHandle.getDirectoryHandle(baseName, {
    create: true,
  })
  await PersistentFileHandle.addHandle(uri, directoryHandle)
  return directoryHandle
}

export const mkdir = async (uri: string): Promise<void> => {
  try {
    await ensureDirectoryHandle(uri)
  } catch (error) {
    throw new VError(error, 'Failed to create directory')
  }
}

export const isReadonly = async (uri: string): Promise<boolean> => {
  const handle = await PersistentFileHandle.getHandle(uri)
  return Boolean(handle && 'readonly' in handle && handle.readonly)
}

export const getBlobSrc = async (uri: string): Promise<string> => {
  const handle = await GetFileHandle.getFileHandle(uri)
  if (!handle) {
    throw new Error(`file not found`)
  }
  const file = await FileSystemFileHandle.getFile(handle)
  const blobUrl = URL.createObjectURL(file)
  return blobUrl
}

export const getBlob = async (uri: string): Promise<File> => {
  const handle = await GetFileHandle.getFileHandle(uri)
  if (!handle) {
    throw new Error(`file not found`)
  }
  const file = await FileSystemFileHandle.getFile(handle)
  // TODO convert handle to blob mime type?
  return file
}
