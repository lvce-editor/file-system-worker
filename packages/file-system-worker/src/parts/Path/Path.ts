import * as Assert from '../Assert/Assert.ts'
import * as GetFileExtension from '../GetFileExtension/GetFileExtension.ts'

export const fileExtension = (uri: string): string => {
  Assert.string(uri)
  return GetFileExtension.getFileExtension(uri)
}

export const join = (pathSeparator: string, ...parts: readonly string[]): string => {
  return parts.join(pathSeparator)
}

export const dirname = (pathSeparator: string, path: string): string => {
  const index = path.lastIndexOf(pathSeparator)
  if (index === -1) {
    return path
  }
  return path.slice(0, index)
}

export const getBaseName = (pathSeparator: string, path: string): string => {
  return path.slice(path.lastIndexOf(pathSeparator) + 1)
}
