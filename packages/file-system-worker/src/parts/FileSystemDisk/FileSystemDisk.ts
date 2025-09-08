import * as FileSystemFetch from '../FileSystemFetch/FileSystemFetch.ts'
import * as FileSystemMemory from '../FileSystemMemory/FileSystemMemory.ts'
import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'
import { isHttp } from '../IsHttp/IsHttp.ts'
import { isMemory } from '../IsMemory/IsMemory.ts'

export const remove = async (dirent: string): Promise<void> => {
  return FileSystemProcess.remove(dirent)
}

export const readFile = async (uri: string): Promise<string> => {
  if (isHttp(uri)) {
    return FileSystemFetch.readFile(uri)
  }
  if (isMemory(uri)) {
    return FileSystemMemory.readFile(uri)
  }
  return FileSystemProcess.readFile(uri)
}

export const appendFile = async (uri: string, text: string): Promise<string> => {
  return FileSystemProcess.appendFile(uri, text)
}

export const readDirWithFileTypes = async (uri: string): Promise<readonly any[]> => {
  return FileSystemProcess.readDirWithFileTypes(uri)
}

export const getPathSeparator = async (root: string): Promise<string> => {
  return FileSystemProcess.getPathSeparator(root)
}

export const readJson = async (uri: string): Promise<any> => {
  if (isHttp(uri)) {
    return FileSystemFetch.readJson(uri)
  }
  if (isMemory(uri)) {
    return FileSystemMemory.readJson(uri)
  }
  return FileSystemProcess.readJson(uri)
}

export const getRealPath = async (path: string): Promise<string> => {
  return FileSystemProcess.getRealPath(path)
}

export const readFileAsBlob = async (uri: string): Promise<Blob> => {
  if (isHttp(uri)) {
    return FileSystemFetch.readFileAsBlob(uri)
  }
  if (uri.startsWith('file:///')) {
    const rest = uri.slice('file:///'.length)
    const remoteUrl = `/remote/${rest}`
    const response = await fetch(remoteUrl)
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const blob = await response.blob()
    return blob
  }
  throw new Error('uri not supported')
}

export const stat = async (dirent: string): Promise<any> => {
  return FileSystemProcess.stat(dirent)
}

export const exists = async (uri: string): Promise<any> => {
  if (isHttp(uri)) {
    return FileSystemFetch.exists(uri)
  }
  return FileSystemProcess.exists(uri)
}

export const createFile = async (uri: string): Promise<void> => {
  return FileSystemProcess.writeFile(uri, '')
}

export const writeFile = async (uri: string, content: string): Promise<void> => {
  if (isMemory(uri)) {
    return FileSystemMemory.writeFile(uri, content)
  }
  return FileSystemProcess.writeFile(uri, content)
}

export const mkdir = async (uri: string): Promise<void> => {
  return FileSystemProcess.mkdir(uri)
}

export const rename = async (oldUri: string, newUri: string): Promise<void> => {
  return FileSystemProcess.rename(oldUri, newUri)
}

export const copy = async (oldUri: string, newUri: string): Promise<void> => {
  return FileSystemProcess.copy(oldUri, newUri)
}

export const getFolderSize = async (uri: string): Promise<void> => {
  return FileSystemProcess.getFolderSize(uri)
}

export const watchFile = async (id: number, uri: string): Promise<void> => {
  // @ts-ignore
  await FileSystemProcess.invoke('FileSystem.watchFile', id, uri)
}
