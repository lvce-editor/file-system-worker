export const remove = async (dirent: string): Promise<void> => {
  throw new Error('not implemented')
}

export const readFile = async (uri: string): Promise<string> => {
  const response = await fetch(uri)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const result = await response.text()
  return result
}
export const readFileAsBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const result = await response.blob()
  return result
}

export const exists = async (uri: string): Promise<boolean> => {
  const response = await fetch(uri)
  if (response.ok) {
    return true
  }
  return false
}

export const readDirWithFileTypes = async (uri: string): Promise<readonly any[]> => {
  throw new Error('not implemented')
}

export const getPathSeparator = async (root: string): Promise<string> => {
  return '/'
}

export const readJson = async (uri: string): Promise<any> => {
  const response = await fetch(uri)
  if (response.ok) {
    return true
  }
  const json = await response.json()
  return json
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
  throw new Error('not implemented')
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
