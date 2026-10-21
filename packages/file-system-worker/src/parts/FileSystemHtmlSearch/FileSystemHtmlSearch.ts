import { DirentType } from '@lvce-editor/constants'
import * as FileSystemHtml from '../FileSystemHtml/FileSystemHtml.ts'

interface SearchResult {
  readonly end: number
  readonly lineNumber: number
  readonly start: number
  readonly text: string
  readonly type: number
}

const FILE_RESULT = 1
const MATCH_RESULT = 2
const USE_REGULAR_EXPRESSION = 1 << 1
const MATCH_WHOLE_WORD = 1 << 3
const MATCH_CASE = 1 << 4

const getLineMatch = (line: string, lineNumber: number, query: string, flags: number): SearchResult[] => {
  if (flags & USE_REGULAR_EXPRESSION) {
    const regex = new RegExp(query, flags & MATCH_CASE ? '' : 'i')
    const match = line.match(regex)
    return match && typeof match.index === 'number' ? [{ end: match.index + match[0].length, lineNumber, start: match.index, text: line, type: MATCH_RESULT }] : []
  }
  const source = flags & MATCH_CASE ? line : line.toLowerCase()
  const needle = flags & MATCH_CASE ? query : query.toLowerCase()
  const index = source.indexOf(needle)
  if (index === -1) {
    return []
  }
  if (flags & MATCH_WHOLE_WORD) {
    const before = line[index - 1]
    const after = line[index + query.length]
    if ((before && /[\p{L}\p{N}_]/u.test(before)) || (after && /[\p{L}\p{N}_]/u.test(after))) {
      return []
    }
  }
  return [{ end: index + query.length, lineNumber, start: index, text: line, type: MATCH_RESULT }]
}

const searchText = (file: string, content: string, query: string, flags = 0): SearchResult[] => {
  const matches = content.split(/\r?\n/).flatMap((line, index) => getLineMatch(line, index, query, flags))
  return matches.length === 0 ? [] : [{ end: 0, lineNumber: 0, start: 0, text: file, type: FILE_RESULT }, ...matches]
}

const searchHtmlDirectory = async (uri: string, relativePath: string, query: string, flags: number): Promise<SearchResult[]> => {
  const entries = await FileSystemHtml.readDirWithFileTypes(uri)
  const results: SearchResult[] = []
  for (const entry of entries) {
    const childUri = `${uri}/${entry.name}`
    const childRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name
    if (entry.type === DirentType.Directory) {
      results.push(...(await searchHtmlDirectory(childUri, childRelativePath, query, flags)))
    } else {
      const content = await FileSystemHtml.readFile(childUri)
      results.push(...searchText(childRelativePath, content, query, flags))
    }
  }
  return results
}

export const textSearch = async (root: string, query: string, options: Readonly<{ flags?: number }> = {}): Promise<SearchResult[]> => {
  return searchHtmlDirectory(root, '', query, options.flags || 0)
}

const searchDirectory = async (uri: string, prefix = ''): Promise<string[]> => {
  const entries = await FileSystemHtml.readDirWithFileTypes(uri)
  const results: string[] = []
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.type === DirentType.Directory) {
      results.push(...(await searchDirectory(`${uri}/${entry.name}`, relativePath)))
    } else {
      results.push(relativePath)
    }
  }
  return results
}

export const fileSearch = (uri: string): Promise<string[]> => searchDirectory(uri)
