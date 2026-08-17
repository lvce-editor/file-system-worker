import { DirentType } from '@lvce-editor/constants'
import ignore from 'ignore'
import picomatch from 'picomatch'
import * as FileSystemDisk from '../FileSystemDisk/FileSystemDisk.ts'

interface Dirent {
  readonly name: string
  readonly type: number
}

interface FileSystem {
  readonly readDirWithFileTypes: (uri: string) => Promise<readonly Dirent[]>
  readonly readFile: (uri: string) => Promise<string>
}

interface IgnoreLayer {
  readonly basePath: string
  readonly matches: (path: string) => IgnoreResult
}

interface IgnoreResult {
  readonly ignored: boolean
  readonly unignored: boolean
}

interface DirectoryTask {
  readonly ignoreLayers: readonly IgnoreLayer[]
  readonly relativePath: string
  readonly uri: string
}

interface ScanResult {
  readonly directories: readonly DirectoryTask[]
  readonly matches: readonly string[]
}

const batchSize = 32

const joinPath = (base: string, name: string): string => {
  return base ? `${base}/${name}` : name
}

const joinUri = (base: string, name: string): string => {
  return base.endsWith('/') ? `${base}${name}` : `${base}/${name}`
}

const getPathForLayer = (relativePath: string, layerBasePath: string): string => {
  if (!layerBasePath) {
    return relativePath
  }
  return relativePath.slice(layerBasePath.length + 1)
}

const isIgnored = (relativePath: string, isDirectory: boolean, ignoreLayers: readonly IgnoreLayer[]): boolean => {
  let ignored = false
  for (const layer of ignoreLayers) {
    if (layer.basePath && relativePath !== layer.basePath && !relativePath.startsWith(`${layer.basePath}/`)) {
      continue
    }
    const pathForLayer = getPathForLayer(relativePath, layer.basePath)
    const candidate = isDirectory ? `${pathForLayer}/` : pathForLayer
    const result = layer.matches(candidate)
    if (result.ignored) {
      ignored = true
    } else if (result.unignored) {
      ignored = false
    }
  }
  return ignored
}

const readIgnoreLayer = async (fileSystem: Readonly<FileSystem>, uri: string, relativePath: string, entries: readonly Dirent[]): Promise<IgnoreLayer | undefined> => {
  const gitIgnore = entries.find((entry) => entry.name === '.gitignore' && entry.type === DirentType.File)
  if (!gitIgnore) {
    return undefined
  }
  try {
    const contents = await fileSystem.readFile(joinUri(uri, gitIgnore.name))
    const matcher = ignore().add(contents)
    return {
      basePath: relativePath,
      matches: (path) => matcher.test(path),
    }
  } catch {
    return undefined
  }
}

const scanDirectory = async (fileSystem: Readonly<FileSystem>, task: DirectoryTask, isMatch: (path: string) => boolean): Promise<ScanResult> => {
  const entries = await fileSystem.readDirWithFileTypes(task.uri)
  const ignoreLayer = await readIgnoreLayer(fileSystem, task.uri, task.relativePath, entries)
  const ignoreLayers = ignoreLayer ? [...task.ignoreLayers, ignoreLayer] : task.ignoreLayers
  const directories: DirectoryTask[] = []
  const matches: string[] = []

  const sortedEntries = entries.toSorted((left, right) => left.name.localeCompare(right.name))
  for (const entry of sortedEntries) {
    const relativePath = joinPath(task.relativePath, entry.name)
    if (entry.type === DirentType.Directory) {
      if (entry.name !== '.git' && !isIgnored(relativePath, true, ignoreLayers)) {
        directories.push({
          ignoreLayers,
          relativePath,
          uri: joinUri(task.uri, entry.name),
        })
      }
    } else if (entry.type === DirentType.File && isMatch(relativePath) && !isIgnored(relativePath, false, ignoreLayers)) {
      matches.push(joinUri(task.uri, entry.name))
    }
  }

  return { directories, matches }
}

export const globWithFileSystem = async (fileSystem: Readonly<FileSystem>, root: string, pattern: string): Promise<readonly string[]> => {
  const isMatch = picomatch(pattern)
  const matches: string[] = []
  let pending: readonly DirectoryTask[] = [{ ignoreLayers: [], relativePath: '', uri: root }]

  while (pending.length > 0) {
    const next: DirectoryTask[] = []
    for (let index = 0; index < pending.length; index += batchSize) {
      const batch = pending.slice(index, index + batchSize)
      const results = await Promise.all(batch.map((task) => scanDirectory(fileSystem, task, isMatch)))
      for (const result of results) {
        next.push(...result.directories)
        matches.push(...result.matches)
      }
    }
    pending = next
  }

  return matches.toSorted((left, right) => left.localeCompare(right))
}

export const glob = async (root: string, pattern: string): Promise<readonly string[]> => {
  return globWithFileSystem(FileSystemDisk, root, pattern)
}
