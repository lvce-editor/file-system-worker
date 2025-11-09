import * as ExtensionHostWorker from '../ExtensionHostWorker/ExtensionHostWorker.ts'
import * as FileWatcher from '../FileWatcher/FileWatcher.ts'

export const remove = async (dirent: string): Promise<void> => {
  await ExtensionHostWorker.invoke('FileSystemMemory.remove', dirent)
  // Trigger file watchers for memfs files
  await FileWatcher.triggerMemfsFileWatcher(dirent)
}

export const readFile = async (uri: string): Promise<string> => {
  return ExtensionHostWorker.invoke('FileSystemMemory.readFile', uri)
}

export const readFileAsBlob = async (uri: string): Promise<Blob> => {
  throw new Error('not implemented')
}

export const exists = async (uri: string): Promise<boolean> => {
  throw new Error('not implemented')
}

export const readDirWithFileTypes = async (uri: string): Promise<readonly any[]> => {
  throw new Error('not implemented')
}

export const getPathSeparator = async (root: string): Promise<string> => {
  return '/'
}

export const readJson = async (uri: string): Promise<any> => {
  throw new Error('not implemented')
}

export const getRealPath = async (path: string): Promise<string> => {
  throw new Error('not implemented')
}

export const stat = async (dirent: string): Promise<any> => {
  throw new Error('not implemented')
}

export const createFile = async (uri: string): Promise<void> => {
  await ExtensionHostWorker.invoke('FileSystemMemory.createFile', uri)
  // Trigger file watchers for memfs files
  await FileWatcher.triggerMemfsFileWatcher(uri)
}

export const writeFile = async (uri: string, content: string): Promise<void> => {
  await ExtensionHostWorker.invoke('FileSystemMemory.writeFile', uri, content)
  // Trigger file watchers for memfs files
  await FileWatcher.triggerMemfsFileWatcher(uri)
}

export const mkdir = async (uri: string): Promise<void> => {
  throw new Error('not implemented')
}

export const rename = async (oldUri: string, newUri: string): Promise<void> => {
  await ExtensionHostWorker.invoke('FileSystemMemory.rename', oldUri, newUri)
  // Trigger file watchers for both old and new URIs
  await FileWatcher.triggerMemfsFileWatcher(oldUri)
  await FileWatcher.triggerMemfsFileWatcher(newUri)
}

export const copy = async (oldUri: string, newUri: string): Promise<void> => {
  throw new Error('not implemented')
}

export const getFolderSize = async (uri: string): Promise<void> => {
  throw new Error('not implemented')
}

export const watchFile = async (id: number, uri: string): Promise<void> => {
  throw new Error('not implemented')
}
