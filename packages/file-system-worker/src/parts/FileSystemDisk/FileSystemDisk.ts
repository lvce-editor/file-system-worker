import * as FileSystemFetch from '../FileSystemFetch/FileSystemFetch.ts'
import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'
import * as Protocol from '../Protocol/Protocol.ts'

export const remove = async (dirent: string): Promise<void> => {
  return FileSystemProcess.remove(dirent)
}

const isHttp = (uri: string): boolean => {
  return uri.startsWith(Protocol.Http) || uri.startsWith(Protocol.Https)
}

export const readFile = async (uri: string): Promise<string> => {
  if (isHttp(uri)) {
    return FileSystemFetch.readFile(uri)
  }
  return FileSystemProcess.readFile(uri)
}

export const readDirWithFileTypes = async (uri: string): Promise<readonly any[]> => {
  return FileSystemProcess.readDirWithFileTypes(uri)
}

export const getPathSeparator = async (root: string): Promise<string> => {
  return FileSystemProcess.getPathSeparator(root)
}

export const readJson = async (uri: string): Promise<any> => {
  return FileSystemProcess.readJson(uri)
}

export const getRealPath = async (path: string): Promise<string> => {
  return FileSystemProcess.getRealPath(path)
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
