import { beforeEach, expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import { ExtensionHost } from '@lvce-editor/rpc-registry'
import * as FileSystemMemory from '../src/parts/FileSystemMemory/FileSystemMemory.ts'

const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()

const createMockFileSystemRpcs = (): { mockRpc: ReturnType<typeof createMockRpc> } => {
  const mockRpc = createMockRpc({
    commandMap: {
      'FileSystemMemory.createFile': async (uri: string) => mockInvoke('FileSystemMemory.createFile', uri),
      'FileSystemMemory.readFile': async (uri: string) => mockInvoke('FileSystemMemory.readFile', uri),
      'FileSystemMemory.remove': async (uri: string) => mockInvoke('FileSystemMemory.remove', uri),
      'FileSystemMemory.rename': async (oldUri: string, newUri: string) => mockInvoke('FileSystemMemory.rename', oldUri, newUri),
      'FileSystemMemory.writeFile': async (uri: string, content: string) => mockInvoke('FileSystemMemory.writeFile', uri, content),
    },
  })
  ExtensionHost.set(mockRpc)
  return { mockRpc }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockInvoke.mockRejectedValue(new Error('rpc not initialized'))
})

test('getPathSeparator should return forward slash', async () => {
  createMockFileSystemRpcs()

  const result = await FileSystemMemory.getPathSeparator('memory://')
  expect(result).toBe('/')
})

test('writeFile should not throw error for memfs URI', async () => {
  const { mockRpc } = createMockFileSystemRpcs()

  await expect(FileSystemMemory.writeFile('memfs://test.txt', 'content')).rejects.toThrow()
  expect(mockRpc.invocations).toEqual([['FileSystemMemory.writeFile', 'memfs://test.txt', 'content']])
})

test('remove should not throw error for memfs URI', async () => {
  const { mockRpc } = createMockFileSystemRpcs()

  await expect(FileSystemMemory.remove('memfs://test.txt')).rejects.toThrow()
  expect(mockRpc.invocations).toEqual([['FileSystemMemory.remove', 'memfs://test.txt']])
})

test('readFileAsBlob should read memfs svg content and convert it to a blob', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockResolvedValue('<svg xmlns="http://www.w3.org/2000/svg"></svg>')

  const result = await FileSystemMemory.readFileAsBlob('memfs:///workspace/left.svg')

  expect(mockInvoke).toHaveBeenCalledWith('FileSystemMemory.readFile', 'memfs:///workspace/left.svg')
  expect(mockRpc.invocations).toEqual([['FileSystemMemory.readFile', 'memfs:///workspace/left.svg']])
  expect(result).toBeInstanceOf(Blob)
  expect(result.type).toBe('image/svg+xml')
  await expect(result.text()).resolves.toBe('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
})

test('exists should throw not implemented', async () => {
  createMockFileSystemRpcs()
  await expect(FileSystemMemory.exists('memory://test.txt')).rejects.toThrow('not implemented')
})

test('readDirWithFileTypes should throw not implemented', async () => {
  createMockFileSystemRpcs()
  await expect(FileSystemMemory.readDirWithFileTypes('memory://')).rejects.toThrow('not implemented')
})

test('readJson should throw not implemented', async () => {
  createMockFileSystemRpcs()
  await expect(FileSystemMemory.readJson('memory://test.json')).rejects.toThrow('not implemented')
})

test('getRealPath should throw not implemented', async () => {
  createMockFileSystemRpcs()
  await expect(FileSystemMemory.getRealPath('memory://test.txt')).rejects.toThrow('not implemented')
})

test('stat should throw not implemented', async () => {
  createMockFileSystemRpcs()
  await expect(FileSystemMemory.stat('memory://test.txt')).rejects.toThrow('not implemented')
})

test('createFile should not throw error for memfs URI', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  await expect(FileSystemMemory.createFile('memfs://test.txt')).rejects.toThrow()
  expect(mockRpc.invocations).toEqual([['FileSystemMemory.createFile', 'memfs://test.txt']])
})

test('mkdir should throw not implemented', async () => {
  createMockFileSystemRpcs()
  await expect(FileSystemMemory.mkdir('memory://folder')).rejects.toThrow('not implemented')
})

test('rename should not throw error for memfs URI', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  await expect(FileSystemMemory.rename('memfs://old.txt', 'memfs://new.txt')).rejects.toThrow()
  expect(mockRpc.invocations).toEqual([['FileSystemMemory.rename', 'memfs://old.txt', 'memfs://new.txt']])
})

test('copy should throw not implemented', async () => {
  createMockFileSystemRpcs()
  await expect(FileSystemMemory.copy('memory://source.txt', 'memory://dest.txt')).rejects.toThrow('not implemented')
})

test('getFolderSize should throw not implemented', async () => {
  createMockFileSystemRpcs()
  await expect(FileSystemMemory.getFolderSize('memory://folder')).rejects.toThrow('not implemented')
})
