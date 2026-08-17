import { DirentType } from '@lvce-editor/constants'
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
  readonly rules: readonly IgnoreRule[]
}

interface IgnoreRule {
  readonly directoryOnly: boolean
  readonly ignored: boolean
  readonly regex: RegExp
}

interface GlobToken {
  readonly endIndex: number
  readonly source: string
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

type GlobImplementation = (fileSystem: Readonly<FileSystem>, root: string, pattern: string) => Promise<readonly string[]>

const createGlobImplementation = (): GlobImplementation => {
  const batchSize = 32
  /* eslint-disable unicorn/consistent-function-scoping -- Keep implementation helpers lazy to stay within the worker memory budget. */

  const joinPath = (base: string, name: string): string => {
    return base ? `${base}/${name}` : name
  }

  const joinUri = (base: string, name: string): string => {
    return base.endsWith('/') ? `${base}${name}` : `${base}/${name}`
  }

  const escapeRegexCharacter = (character: string): string => {
    return /[\\^$.*+?()[\]|{}]/.test(character) ? `\\${character}` : character
  }

  const getCharacterClass = (pattern: string, index: number): GlobToken | undefined => {
    const endIndex = pattern.indexOf(']', index + 1)
    if (endIndex === -1) {
      return undefined
    }
    let contents = pattern.slice(index + 1, endIndex).replaceAll('\\', '\\\\')
    if (contents.startsWith('!')) {
      contents = `^${contents.slice(1)}`
    }
    return { endIndex, source: `[${contents}]` }
  }

  const getAsteriskToken = (pattern: string, index: number): GlobToken => {
    if (pattern[index + 1] !== '*') {
      return { endIndex: index, source: '[^/]*' }
    }
    if (pattern[index + 2] === '/') {
      return { endIndex: index + 2, source: '(?:.*/)?' }
    }
    return { endIndex: index + 1, source: '.*' }
  }

  const getCharacterClassToken = (pattern: string, index: number): GlobToken => {
    return getCharacterClass(pattern, index) || { endIndex: index, source: '\\[' }
  }

  const getEscapeToken = (pattern: string, index: number): GlobToken => {
    const nextCharacter = pattern[index + 1]
    if (!nextCharacter) {
      return { endIndex: index, source: '\\\\' }
    }
    return { endIndex: index + 1, source: escapeRegexCharacter(nextCharacter) }
  }

  const getGlobToken = (pattern: string, index: number): GlobToken => {
    const character = pattern[index]
    switch (character) {
      case '?':
        return { endIndex: index, source: '[^/]' }
      case '[':
        return getCharacterClassToken(pattern, index)
      case '*':
        return getAsteriskToken(pattern, index)
      case '\\':
        return getEscapeToken(pattern, index)
      default:
        return { endIndex: index, source: escapeRegexCharacter(character) }
    }
  }

  const globToRegexSource = (pattern: string): string => {
    let source = ''
    let index = 0
    while (index < pattern.length) {
      const token = getGlobToken(pattern, index)
      source += token.source
      index = token.endIndex + 1
    }
    return source
  }

  const compileGlob = (pattern: string): ((path: string) => boolean) => {
    const regex = new RegExp(`^${globToRegexSource(pattern)}$`)
    return (path) => regex.test(path)
  }

  const compileIgnoreRule = (line: string): IgnoreRule | undefined => {
    let pattern = line.trimEnd()
    if (!pattern || pattern.startsWith('#')) {
      return undefined
    }

    let ignored = true
    if (pattern.startsWith('!')) {
      ignored = false
      pattern = pattern.slice(1)
    } else if (pattern.startsWith('\\!') || pattern.startsWith('\\#')) {
      pattern = pattern.slice(1)
    }

    const directoryOnly = pattern.endsWith('/')
    if (directoryOnly) {
      pattern = pattern.slice(0, -1)
    }
    const anchored = pattern.startsWith('/')
    if (anchored) {
      pattern = pattern.slice(1)
    }
    if (!pattern) {
      return undefined
    }

    const prefix = anchored || pattern.includes('/') ? '^' : '(?:^|/)'
    return {
      directoryOnly,
      ignored,
      regex: new RegExp(`${prefix}${globToRegexSource(pattern)}$`),
    }
  }

  const parseGitIgnore = (contents: string): readonly IgnoreRule[] => {
    const rules: IgnoreRule[] = []
    for (const line of contents.split(/\r?\n/)) {
      const rule = compileIgnoreRule(line)
      if (rule) {
        rules.push(rule)
      }
    }
    return rules
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
      for (const rule of layer.rules) {
        const { directoryOnly, ignored: ruleIgnored, regex } = rule
        if ((!directoryOnly || isDirectory) && regex.test(pathForLayer)) {
          ignored = ruleIgnored
        }
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
      return {
        basePath: relativePath,
        rules: parseGitIgnore(contents),
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

  const globWithFileSystemImplementation: GlobImplementation = async (fileSystem, root, pattern) => {
    const isMatch = compileGlob(pattern)
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

  /* eslint-enable unicorn/consistent-function-scoping */
  return globWithFileSystemImplementation
}

const createLazyGlobImplementation = (): GlobImplementation => {
  let implementation: GlobImplementation | undefined
  return async (fileSystem, root, pattern) => {
    implementation ||= createGlobImplementation()
    return implementation(fileSystem, root, pattern)
  }
}

export const globWithFileSystem = createLazyGlobImplementation()

export const glob = async (root: string, pattern: string): Promise<readonly string[]> => {
  return globWithFileSystem(FileSystemDisk, root, pattern)
}
