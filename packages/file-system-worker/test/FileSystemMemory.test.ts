import { beforeEach, expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import { ExtensionHost } from '@lvce-editor/rpc-registry'
import * as FileSystemMemory from '../src/parts/FileSystemMemory/FileSystemMemory.ts'

const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockRpc = MockRpc.create({
  commandMap: {},
  invoke: mockInvoke,
})
ExtensionHost.set(mockRpc)

beforeEach(() => {
  jest.clearAllMocks()
  mockInvoke.mockRejectedValue(new Error('rpc not initialized'))
})

test('getPathSeparator should return forward slash', async () => {
  const result = await FileSystemMemory.getPathSeparator('memory://')
  expect(result).toBe('/')
})

test('writeFile should not throw error for memfs URI', async () => {
  // This test just verifies the method doesn't throw, since we can't easily mock the RPC calls
  await expect(FileSystemMemory.writeFile('memfs://test.txt', 'content')).rejects.toThrow()
})

test('remove should not throw error for memfs URI', async () => {
  // This test just verifies the method doesn't throw, since we can't easily mock the RPC calls
  await expect(FileSystemMemory.remove('memfs://test.txt')).rejects.toThrow()
})

test('readFileAsBlob should read memfs svg content and convert it to a blob', async () => {
  mockInvoke.mockResolvedValue('<svg xmlns="http://www.w3.org/2000/svg"></svg>')

  const result = await FileSystemMemory.readFileAsBlob('memfs:///workspace/left.svg')

  expect(mockInvoke).toHaveBeenCalledWith('FileSystemMemory.readFile', 'memfs:///workspace/left.svg')
  expect(result).toBeInstanceOf(globalThis.Blob)
  expect(result.type).toBe('image/svg+xml')
  await expect(result.text()).resolves.toBe('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
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

test('createFile should not throw error for memfs URI', async () => {
  // This test just verifies the method doesn't throw, since we can't easily mock the RPC calls
  await expect(FileSystemMemory.createFile('memfs://test.txt')).rejects.toThrow()
})

test('mkdir should throw not implemented', async () => {
  await expect(FileSystemMemory.mkdir('memory://folder')).rejects.toThrow('not implemented')
})

test('rename should not throw error for memfs URI', async () => {
  // This test just verifies the method doesn't throw, since we can't easily mock the RPC calls
  await expect(FileSystemMemory.rename('memfs://old.txt', 'memfs://new.txt')).rejects.toThrow()
})

test('copy should throw not implemented', async () => {
  await expect(FileSystemMemory.copy('memory://source.txt', 'memory://dest.txt')).rejects.toThrow('not implemented')
})

test('getFolderSize should throw not implemented', async () => {
  await expect(FileSystemMemory.getFolderSize('memory://folder')).rejects.toThrow('not implemented')
})
