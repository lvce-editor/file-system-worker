import { beforeEach, expect, jest, test } from '@jest/globals'
import { DirentType } from '@lvce-editor/constants'
import { FileNotFoundError } from '../src/parts/FileNotFoundError/FileNotFoundError.ts'
import * as GitIgnoreMatcher from '../src/parts/GitIgnoreMatcher/GitIgnoreMatcher.ts'
const readDirWithFileTypes = jest.fn<(...args: readonly any[]) => Promise<readonly any[]>>()
const readFile = jest.fn<(...args: readonly any[]) => Promise<string>>()
jest.unstable_mockModule('../src/parts/FileSystemHtml/FileSystemHtml.ts', () => ({ readDirWithFileTypes, readFile }))
const FileSystemHtmlSearch = await import('../src/parts/FileSystemHtmlSearch/FileSystemHtmlSearch.ts')
beforeEach(() => {
  jest.resetAllMocks()
})

test('file quickpick prunes directories ignored by the workspace root gitignore', async () => {
  readFile.mockResolvedValue('# generated cache\n\n/custom-cache/\n')
  readDirWithFileTypes.mockImplementation(async (uri) => {
    if (uri === 'html:///workspace') {
      return [
        { name: 'custom-cache', type: DirentType.Directory },
        { name: 'src', type: DirentType.Directory },
      ]
    }
    if (uri === 'html:///workspace/src') {
      return [
        { name: 'custom-cache', type: DirentType.Directory },
        { name: 'main.ts', type: DirentType.File },
      ]
    }
    if (uri === 'html:///workspace/src/custom-cache') {
      return [{ name: 'nested.ts', type: DirentType.File }]
    }
    throw new Error(`unexpected directory enumeration: ${uri}`)
  })

  await expect(FileSystemHtmlSearch.fileSearch('html:///workspace')).resolves.toEqual(['src/custom-cache/nested.ts', 'src/main.ts'])
  expect(readDirWithFileTypes).toHaveBeenCalledTimes(3)
  expect(readDirWithFileTypes).not.toHaveBeenCalledWith('html:///workspace/custom-cache')
})

test('file quickpick keeps searching when the workspace has no gitignore', async () => {
  readFile.mockRejectedValue(new FileNotFoundError('html:///workspace/.gitignore'))
  readDirWithFileTypes.mockResolvedValue([{ name: 'main.ts', type: DirentType.File }])

  await expect(FileSystemHtmlSearch.fileSearch('html:///workspace')).resolves.toEqual(['main.ts'])
  expect(readDirWithFileTypes).toHaveBeenCalledTimes(1)
})

test('file quickpick honors gitignore negations', async () => {
  readFile.mockResolvedValue('generated/*\n!generated/keep.ts\n')
  readDirWithFileTypes.mockImplementation(async (uri) => {
    if (uri === 'html:///workspace') {
      return [{ name: 'generated', type: DirentType.Directory }]
    }
    return [
      { name: 'drop.ts', type: DirentType.File },
      { name: 'keep.ts', type: DirentType.File },
    ]
  })

  await expect(FileSystemHtmlSearch.fileSearch('html:///workspace')).resolves.toEqual(['generated/keep.ts'])
  expect(readDirWithFileTypes).toHaveBeenCalledWith('html:///workspace/generated')
})

test('gitignore matcher ignores blank lines and comments', () => {
  const matcher = GitIgnoreMatcher.create('# comment\n\nignored.txt\n')
  expect(matcher.isIgnored('ignored.txt')).toBe(true)
  expect(matcher.isIgnored('visible.txt')).toBe(false)
})
