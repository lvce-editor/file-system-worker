import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as FileSystemFetch from '../FileSystemFetch/FileSystemFetch.ts'
import * as FileSystemHtml from '../FileSystemHtml/FileSystemHtml.ts'
import * as FileSystemMemory from '../FileSystemMemory/FileSystemMemory.ts'
import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'
import { isFetch } from '../IsFetch/IsFetch.ts'
import { isHtml } from '../IsHtml/IsHtml.ts'
import { isHttp } from '../IsHttp/IsHttp.ts'
import { isMemory } from '../IsMemory/IsMemory.ts'
import { isProviderUri } from '../IsProviderUri/IsProviderUri.ts'

export const remove = async (dirent: string): Promise<void> => {
  if (isHtml(dirent)) return FileSystemHtml.remove(dirent)
  if (isMemory(dirent)) {
    return FileSystemMemory.remove(dirent)
  }
  if (isProviderUri(dirent)) {
    return RendererWorker.invoke('FileSystem.remove', dirent)
  }
  return FileSystemProcess.remove(dirent)
}

export const readFile = async (uri: string): Promise<string> => {
  if (isHtml(uri)) return FileSystemHtml.readFile(uri)
  if (uri.startsWith('untitled:')) return ''
  if (isFetch(uri)) {
    return RendererWorker.invoke('FileSystem.readFile', uri)
  }
  if (isHttp(uri)) {
    return FileSystemFetch.readFile(uri)
  }
  if (isMemory(uri)) {
    return FileSystemMemory.readFile(uri)
  }
  if (isProviderUri(uri)) {
    return RendererWorker.invoke('FileSystem.readFile', uri)
  }
  return FileSystemProcess.readFile(uri)
}

export const getFileHash = async (uri: string): Promise<string> => {
  return FileSystemProcess.getFileHash(uri)
}

export const getFileHashes = async (uris: readonly string[]): Promise<readonly (string | null)[]> => {
  return FileSystemProcess.getFileHashes(uris)
}

export const appendFile = async (uri: string, text: string): Promise<string> => {
  return FileSystemProcess.appendFile(uri, text)
}

export const readDirWithFileTypes = async (uri: string): Promise<readonly any[]> => {
  if (isHtml(uri)) return FileSystemHtml.readDirWithFileTypes(uri)
  if (isFetch(uri)) {
    return RendererWorker.invoke('FileSystem.readDirWithFileTypes', uri)
  }
  if (isMemory(uri)) {
    return FileSystemMemory.readDirWithFileTypes(uri)
  }
  if (isProviderUri(uri)) {
    return RendererWorker.invoke('FileSystem.readDirWithFileTypes', uri)
  }
  return FileSystemProcess.readDirWithFileTypes(uri)
}

export const isReadonly = async (uri: string): Promise<boolean> => {
  if (isHtml(uri)) return FileSystemHtml.isReadonly(uri)
  return FileSystemProcess.invoke('FileSystem.isReadonly', uri)
}

export const readJson = async (uri: string): Promise<any> => {
  if (isHtml(uri)) return JSON.parse(await FileSystemHtml.readFile(uri))
  if (isHttp(uri)) {
    return FileSystemFetch.readJson(uri)
  }
  if (isMemory(uri)) {
    return FileSystemMemory.readJson(uri)
  }
  return FileSystemProcess.readJson(uri)
}

export const getRealPath = async (path: string): Promise<string> => {
  if (isMemory(path)) return FileSystemMemory.getRealPath(path)
  return FileSystemProcess.getRealPath(path)
}

export const getFileSize = async (uri: string): Promise<number> => {
  if (isHttp(uri) || isMemory(uri)) {
    throw new Error(`File size is not supported for ${uri}`)
  }
  return FileSystemProcess.invoke('FileSystem.getFileSize', uri)
}

export const readFileAsBlob = async (uri: string): Promise<Blob> => {
  if (isHtml(uri)) return FileSystemHtml.getBlob(uri)
  if (isHttp(uri)) {
    return FileSystemFetch.readFileAsBlob(uri)
  }
  if (isMemory(uri)) {
    return FileSystemMemory.readFileAsBlob(uri)
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
  if (isProviderUri(uri)) {
    return RendererWorker.invoke('FileSystem.getBlob', uri)
  }
  throw new Error('uri not supported')
}

export const getDirectoryVersion = async (uri: string): Promise<string | null> => {
  if (!uri.startsWith('file://')) {
    return null
  }
  return FileSystemProcess.invoke('FileSystem.getDirectoryVersion', uri)
}

export const stat = async (dirent: string): Promise<any> => {
  if (isMemory(dirent)) return FileSystemMemory.stat(dirent)
  return FileSystemProcess.stat(dirent)
}

export const exists = async (uri: string): Promise<any> => {
  if (isHtml(uri)) return FileSystemHtml.exists(uri)
  if (isMemory(uri)) {
    return FileSystemMemory.exists(uri)
  }
  if (isFetch(uri) || isProviderUri(uri)) {
    return RendererWorker.invoke('FileSystem.exists', uri)
  }
  if (isHttp(uri)) {
    return FileSystemFetch.exists(uri)
  }
  return FileSystemProcess.exists(uri)
}

export const createFile = async (uri: string): Promise<void> => {
  if (isMemory(uri)) {
    return FileSystemMemory.createFile(uri)
  }
  if (isHtml(uri)) return FileSystemHtml.writeFile(uri, '')
  return FileSystemProcess.writeFile(uri, '')
}

export const writeFile = async (uri: string, content: string): Promise<void> => {
  if (isHtml(uri)) return FileSystemHtml.writeFile(uri, content)
  if (isMemory(uri)) {
    return FileSystemMemory.writeFile(uri, content)
  }
  if (isProviderUri(uri)) {
    return RendererWorker.invoke('FileSystem.writeFile', uri, content)
  }
  return FileSystemProcess.writeFile(uri, content)
}

const getBytes = async (blob: Blob): Promise<Uint8Array> => {
  if (blob.bytes) {
    return blob.bytes()
  }
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  return bytes
}

export const writeBlob = async (uri: string, blob: Blob): Promise<void> => {
  if (isHtml(uri)) return FileSystemHtml.writeBlob(uri, blob)
  const bytes = await getBytes(blob)
  // @ts-ignore
  await FileSystemProcess.invoke('FileSystem.writeBuffer', uri, bytes)
}

export const mkdir = async (uri: string): Promise<void> => {
  if (isHtml(uri)) return FileSystemHtml.mkdir(uri)
  if (isMemory(uri)) {
    await FileSystemMemory.mkdir(uri)
    return
  }
  return FileSystemProcess.mkdir(uri)
}

export const rename = async (oldUri: string, newUri: string): Promise<void> => {
  if (isMemory(oldUri) || isMemory(newUri)) {
    return FileSystemMemory.rename(oldUri, newUri)
  }
  return FileSystemProcess.rename(oldUri, newUri)
}

export const copy = async (oldUri: string, newUri: string): Promise<void> => {
  if (isMemory(oldUri) && isMemory(newUri)) return FileSystemMemory.copy(oldUri, newUri)
  return FileSystemProcess.copy(oldUri, newUri)
}

export const getFolderSize = async (uri: string): Promise<void> => {
  return FileSystemProcess.getFolderSize(uri)
}

export const getPathSeparator = async (uri: string): Promise<string> => {
  if (isMemory(uri)) return FileSystemMemory.getPathSeparator(uri)
  return FileSystemProcess.invoke('FileSystem.getPathSeparator', uri)
}
