import * as ExtensionHostWorker from '../ExtensionHostWorker/ExtensionHostWorker.ts'

export const remove = async (dirent: string): Promise<void> => {
  throw new Error('not implemented')
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
  throw new Error('not implemented')
}

export const writeFile = async (uri: string, content: string): Promise<void> => {
  return ExtensionHostWorker.invoke('FileSystemMemory.writeFile', uri, content)
}

export const mkdir = async (uri: string): Promise<void> => {
  throw new Error('not implemented')
}

export const rename = async (oldUri: string, newUri: string): Promise<void> => {
  throw new Error('not implemented')
}

export const copy = async (oldUri: string, newUri: string): Promise<void> => {
  throw new Error('not implemented')
}

export const getFolderSize = async (uri: string): Promise<void> => {
  throw new Error('not implemented')
}
