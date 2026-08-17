import { expect, jest, test } from '@jest/globals'
import { DirentType } from '@lvce-editor/constants'
import { globWithFileSystem } from '../src/parts/FileSystemGlob/FileSystemGlob.ts'

interface Entry {
  readonly name: string
  readonly type: number
}

interface MockFileSystem {
  readonly readDirWithFileTypes: jest.Mock<(uri: string) => Promise<readonly Entry[]>>
  readonly readFile: jest.Mock<(uri: string) => Promise<string>>
}

const createFileSystem = (directories: Readonly<Record<string, readonly Entry[]>>, files: Readonly<Record<string, string>> = {}): MockFileSystem => {
  return {
    readDirWithFileTypes: jest.fn(async (uri: string): Promise<readonly Entry[]> => {
      const entries = directories[uri]
      if (!entries) {
        throw new Error(`unexpected directory ${uri}`)
      }
      return entries
    }),
    readFile: jest.fn(async (uri: string): Promise<string> => {
      if (!(uri in files)) {
        throw new Error(`unexpected file ${uri}`)
      }
      return files[uri]
    }),
  }
}

test('finds matching files recursively in stable order', async () => {
  const fileSystem = createFileSystem({
    'file:///workspace': [
      { name: 'z.test.ts', type: DirentType.File },
      { name: 'src', type: DirentType.Directory },
      { name: 'README.md', type: DirentType.File },
    ],
    'file:///workspace/src': [
      { name: 'b.test.ts', type: DirentType.File },
      { name: 'a.test.ts', type: DirentType.File },
      { name: 'a.ts', type: DirentType.File },
    ],
  })

  const result = await globWithFileSystem(fileSystem, 'file:///workspace', '**/*.test.ts')

  expect(result).toEqual(['file:///workspace/src/a.test.ts', 'file:///workspace/src/b.test.ts', 'file:///workspace/z.test.ts'])
})

test('excludes gitignored files and prunes gitignored directories', async () => {
  const fileSystem = createFileSystem(
    {
      'file:///workspace': [
        { name: '.gitignore', type: DirentType.File },
        { name: 'ignored.test.ts', type: DirentType.File },
        { name: 'ignored', type: DirentType.Directory },
        { name: 'included.test.ts', type: DirentType.File },
      ],
    },
    {
      'file:///workspace/.gitignore': 'ignored.test.ts\nignored/\n',
    },
  )

  const result = await globWithFileSystem(fileSystem, 'file:///workspace', '**/*.test.ts')

  expect(result).toEqual(['file:///workspace/included.test.ts'])
  expect(fileSystem.readDirWithFileTypes).toHaveBeenCalledTimes(1)
})

test('supports nested gitignore files and negated patterns', async () => {
  const fileSystem = createFileSystem(
    {
      'file:///workspace': [{ name: 'src', type: DirentType.Directory }],
      'file:///workspace/src': [
        { name: '.gitignore', type: DirentType.File },
        { name: 'ignored.test.ts', type: DirentType.File },
        { name: 'keep.test.ts', type: DirentType.File },
      ],
    },
    {
      'file:///workspace/src/.gitignore': '*.test.ts\n!keep.test.ts\n',
    },
  )

  const result = await globWithFileSystem(fileSystem, 'file:///workspace', '**/*.test.ts')

  expect(result).toEqual(['file:///workspace/src/keep.test.ts'])
})

test('always excludes git metadata and ignores unreadable gitignore files', async () => {
  const fileSystem = createFileSystem({
    'file:///workspace': [
      { name: '.git', type: DirentType.Directory },
      { name: '.gitignore', type: DirentType.File },
      { name: 'included.test.ts', type: DirentType.File },
      { name: 'link.test.ts', type: DirentType.Symlink },
    ],
  })

  const result = await globWithFileSystem(fileSystem, 'file:///workspace', '**/*.test.ts')

  expect(result).toEqual(['file:///workspace/included.test.ts'])
  expect(fileSystem.readDirWithFileTypes).toHaveBeenCalledTimes(1)
})
