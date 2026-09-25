import * as FileWatcher from '../FileWatcher/FileWatcher.ts'
import { getFileExtension } from '../GetFileExtension/GetFileExtension.ts'

// These numeric types are the filesystem wire protocol consumed by explorer.
const directory = 3
const file = 7
interface Entry {
  readonly content: Blob
  readonly type: number
}
const files = new Map<string, Entry>()
const getPath = (uri: string): string => (uri.startsWith('memfs://') ? uri.slice('memfs://'.length) : uri).replace(/\/$/, '')
const getEntry = (uri: string): Entry | undefined => files.get(getPath(uri))
const ensureParentDirs = (path: string): void => {
  let end = path.indexOf('/')
  while (end >= 0) {
    const parent = path.slice(0, end)
    if (!files.has(parent)) files.set(parent, { content: new Blob(), type: directory })
    end = path.indexOf('/', end + 1)
  }
}
const getBlobType = (uri: string): string => {
  const types: Record<string, string> = {
    css: 'text/css',
    html: 'text/html',
    js: 'text/javascript',
    json: 'application/json',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    xml: 'application/xml',
  }
  return types[getFileExtension(uri).toLowerCase()] || ''
}
export const readFileAsBlob = async (uri: string): Promise<Blob> => {
  const entry = getEntry(uri)
  if (!entry) throw new Error(`File not found: ${uri}`)
  if (entry.type !== file) throw new Error(`File is a directory: ${uri}`)
  return entry.content
}
export const readFile = async (uri: string): Promise<string> => {
  const blob = await readFileAsBlob(uri)
  return blob.text()
}
export const writeFile = async (uri: string, content: string): Promise<void> => {
  const path = getPath(uri)
  ensureParentDirs(path)
  files.set(path, { content: new Blob([content], { type: getBlobType(uri) }), type: file })
  await FileWatcher.triggerMemfsFileWatcher(uri)
}
export const exists = async (uri: string): Promise<boolean> => !!getEntry(uri)
export const createFile = async (uri: string): Promise<void> => writeFile(uri, '')
export const mkdir = async (uri: string): Promise<void> => {
  const path = getPath(uri)
  ensureParentDirs(path)
  files.set(path, { content: new Blob(), type: directory })
  await FileWatcher.triggerMemfsFileWatcher(uri)
}
export const remove = async (uri: string): Promise<void> => {
  const path = getPath(uri)
  for (const key of files.keys()) {
    if (key === path || key.startsWith(`${path}/`)) files.delete(key)
  }
  await FileWatcher.triggerMemfsFileWatcher(uri)
}
export const readDirWithFileTypes = async (uri: string): Promise<readonly { name: string; type: number }[]> => {
  const path = `${getPath(uri)}/`
  const entries = new Map<string, number>()
  for (const [key, value] of files) {
    if (!key.startsWith(path) || key === path) continue
    const rest = key.slice(path.length)
    const slash = rest.indexOf('/')
    entries.set(slash === -1 ? rest : rest.slice(0, slash), slash === -1 ? value.type : directory)
  }
  return Array.from(entries, ([name, type]: readonly [string, number]) => ({ name, type }))
}
export const rename = async (oldUri: string, newUri: string): Promise<void> => {
  const oldPath = getPath(oldUri)
  const newPath = getPath(newUri)
  const entry = getEntry(oldUri)
  if (!entry) throw new Error(`File not found: ${oldUri}`)
  if (oldPath === newPath) return
  if (newPath.startsWith(`${oldPath}/`)) throw new Error('Cannot move a directory into itself')
  ensureParentDirs(newPath)
  // Snapshot before mutating the map so newly inserted keys are not visited.
  const entries = [...files]
  for (const [key, value] of entries) {
    if (!(key === oldPath || key.startsWith(`${oldPath}/`))) {
      continue
    }

    files.set(`${newPath}${key.slice(oldPath.length)}`, value)
    files.delete(key)
  }
  await FileWatcher.triggerMemfsFileWatcher(oldUri)
  await FileWatcher.triggerMemfsFileWatcher(newUri)
}
export const copy = async (oldUri: string, newUri: string): Promise<void> => writeFile(newUri, await readFile(oldUri))
export const stat = async (uri: string): Promise<any> => {
  const entry = getEntry(uri)
  return entry ? { exists: true, size: entry.content.size, type: entry.type } : { exists: false, size: 0 }
}
export const readJson = async (uri: string): Promise<any> => JSON.parse(await readFile(uri))
export const getPathSeparator = async (_root: string): Promise<string> => '/'
export const getRealPath = async (uri: string): Promise<string> => uri
export const getFolderSize = async (uri: string): Promise<number> => {
  const path = `${getPath(uri)}/`
  let size = 0
  for (const [key, entry] of files) if (key.startsWith(path)) size += entry.content.size
  return size
}

export const getFiles = async (): Promise<Record<string, { content: string; type: number }>> => {
  const entries = await Promise.all(
    Array.from(files, async ([path, entry]: readonly [string, Entry]) => [path, { content: await entry.content.text(), type: entry.type }]),
  )
  return Object.fromEntries(entries)
}
