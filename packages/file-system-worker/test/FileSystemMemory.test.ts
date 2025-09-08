import { test, expect, jest } from '@jest/globals'
import * as FileSystemMemory from '../src/parts/FileSystemMemory/FileSystemMemory.ts'
import * as ExtensionHostWorker from '../src/parts/ExtensionHostWorker/ExtensionHostWorker.ts'

const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockRpc = {
  invoke: mockInvoke,
  send: jest.fn(),
  invokeAndTransfer: jest.fn(),
  dispose: jest.fn()
} as any
ExtensionHostWorker.set(mockRpc)

test('readFile should invoke ExtensionHostWorker', async () => {
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystemMemory.readFile') {
      return 'file content'
    }
    throw new Error(`unexpected method ${method}`)
  })

  const result = await FileSystemMemory.readFile('memory://test.txt')
  expect(result).toBe('file content')
})

test('writeFile should invoke ExtensionHostWorker', async () => {
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystemMemory.writeFile') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })

  await expect(FileSystemMemory.writeFile('memory://test.txt', 'content')).resolves.not.toThrow()
})

test('getPathSeparator should return forward slash', async () => {
  const result = await FileSystemMemory.getPathSeparator('memory://')
  expect(result).toBe('/')
})

test('remove should throw not implemented', async () => {
  await expect(FileSystemMemory.remove('memory://test.txt')).rejects.toThrow('not implemented')
})

test('readFileAsBlob should throw not implemented', async () => {
  await expect(FileSystemMemory.readFileAsBlob('memory://test.txt')).rejects.toThrow('not implemented')
})

test('exists should throw not implemented', async () => {
  await expect(FileSystemMemory.exists('memory://test.txt')).rejects.toThrow('not implemented')
})

test('readDirWithFileTypes should throw not implemented', async () => {
  await expect(FileSystemMemory.readDirWithFileTypes('memory://')).rejects.toThrow('not implemented')
})

test('readJson should throw not implemented', async () => {
  await expect(FileSystemMemory.readJson('memory://test.json')).rejects.toThrow('not implemented')
})

test('getRealPath should throw not implemented', async () => {
  await expect(FileSystemMemory.getRealPath('memory://test.txt')).rejects.toThrow('not implemented')
})

test('stat should throw not implemented', async () => {
  await expect(FileSystemMemory.stat('memory://test.txt')).rejects.toThrow('not implemented')
})

test('createFile should throw not implemented', async () => {
  await expect(FileSystemMemory.createFile('memory://test.txt')).rejects.toThrow('not implemented')
})

test('mkdir should throw not implemented', async () => {
  await expect(FileSystemMemory.mkdir('memory://folder')).rejects.toThrow('not implemented')
})

test('rename should throw not implemented', async () => {
  await expect(FileSystemMemory.rename('memory://old.txt', 'memory://new.txt')).rejects.toThrow('not implemented')
})

test('copy should throw not implemented', async () => {
  await expect(FileSystemMemory.copy('memory://source.txt', 'memory://dest.txt')).rejects.toThrow('not implemented')
})

test('getFolderSize should throw not implemented', async () => {
  await expect(FileSystemMemory.getFolderSize('memory://folder')).rejects.toThrow('not implemented')
})
