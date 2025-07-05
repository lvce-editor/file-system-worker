import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'

export const remove = async (dirent: string): Promise<void> => {
  return FileSystemProcess.remove(dirent)
}

export const readFile = async (uri: string): Promise<string> => {
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
  return FileSystemProcess.getPathSeparator(path)
}

export const stat = async (dirent: string): Promise<any> => {
  return FileSystemProcess.stat(dirent)
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
