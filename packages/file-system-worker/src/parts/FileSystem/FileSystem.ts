import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'

export const remove = async (dirent: string): Promise<void> => {
  return FileSystemProcess.invoke('FileSystem.remove', dirent)
}

export const readDirWithFileTypes = async (uri: string): Promise<readonly any[]> => {
  return FileSystemProcess.invoke('FileSystem.readDirWithFileTypes', uri)
}

export const getPathSeparator = async (root: string): Promise<string> => {
  // @ts-ignore
  return FileSystemProcess.invoke('FileSystem.getPathSeparator', root)
}

export const readJson = async (uri: string): Promise<any> => {
  // @ts-ignore
  return FileSystemProcess.invoke('FileSystem.readJson', uri)
}

export const getRealPath = async (path: string): Promise<string> => {
  return FileSystemProcess.invoke('FileSystem.getRealPath', path)
}

export const stat = async (dirent: string): Promise<any> => {
  return FileSystemProcess.invoke('FileSystem.stat', dirent)
}

export const createFile = async (uri: string): Promise<void> => {
  return FileSystemProcess.invoke('FileSystem.writeFile', uri, '')
}

export const writeFile = async (uri: string, content: string): Promise<void> => {
  return FileSystemProcess.invoke('FileSystem.writeFile', uri, content)
}

export const mkdir = async (uri: string): Promise<void> => {
  return FileSystemProcess.invoke('FileSystem.mkdir', uri)
}

export const rename = async (oldUri: string, newUri: string): Promise<void> => {
  return FileSystemProcess.invoke('FileSystem.rename', oldUri, newUri)
}

export const copy = async (oldUri: string, newUri: string): Promise<void> => {
  return FileSystemProcess.invoke('FileSystem.copy', oldUri, newUri)
}
