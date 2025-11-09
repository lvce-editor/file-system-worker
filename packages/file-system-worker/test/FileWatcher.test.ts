import { test, expect, jest, beforeEach } from '@jest/globals'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import * as FileWatcher from '../src/parts/FileWatcher/FileWatcher.ts'
import * as WatchCallbacks from '../src/parts/WatchCallbacks/WatchCallbacks.ts'

const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockRpc = {
  invoke: mockInvoke,
  send: jest.fn(),
  invokeAndTransfer: jest.fn(),
  dispose: jest.fn(),
} as any

// Mock the RpcRegistry module
const mockRpcRegistry = {
  invoke: jest.fn(),
}

jest.mock('@lvce-editor/rpc-registry', () => ({
  get: jest.fn().mockReturnValue(mockRpcRegistry),
}))

FileSystemProcess.set(mockRpc)

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  mockInvoke.mockClear()
  mockRpcRegistry.invoke.mockClear()
})

test('watchFile should throw error for invalid URI', async () => {
  await expect(FileWatcher.watchFile(1, 'invalid-uri', 123)).rejects.toThrow('uri must be a valid uri')
})

test('watchFile should register watch callback and invoke FileSystemProcess', async () => {
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.watchFile') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })

  await expect(FileWatcher.watchFile(1, 'file:///test.txt', 123)).resolves.not.toThrow()
})

test('unwatchFile should unregister watch callback and invoke FileSystemProcess', async () => {
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.unwatchFile') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })

  await expect(FileWatcher.unwatchFile(1)).resolves.not.toThrow()
})

test('watchFile should register memfs watcher without invoking FileSystemProcess', async () => {
  const memfsUri = 'memfs://test.txt'

  // Clear any previous calls
  mockInvoke.mockClear()

  await FileWatcher.watchFile(1, memfsUri, 123)

  // Should not call FileSystemProcess for memfs URIs
  expect(mockInvoke).not.toHaveBeenCalled()

  // Should register the watch callback
  const watchIds = WatchCallbacks.getWatchCallbackIdsForUri(memfsUri)
  expect(watchIds).toContain(1)
})

test('triggerMemfsFileWatcher should find registered watchers for URI', async () => {
  const memfsUri = 'memfs://test.txt'

  // Register a watcher
  await FileWatcher.watchFile(1, memfsUri, 123)

  // Check that the watcher is registered
  const watchIds = WatchCallbacks.getWatchCallbackIdsForUri(memfsUri)
  expect(watchIds).toContain(1)
  expect(watchIds).toHaveLength(1)
})

test('triggerMemfsFileWatcher should handle multiple watchers for same URI', async () => {
  const memfsUri = 'memfs://test.txt'

  // Register multiple watchers for the same URI
  await FileWatcher.watchFile(1, memfsUri, 123)
  await FileWatcher.watchFile(2, memfsUri, 456)

  // Check that both watchers are registered
  const watchIds = WatchCallbacks.getWatchCallbackIdsForUri(memfsUri)
  expect(watchIds).toContain(1)
  expect(watchIds).toContain(2)
  expect(watchIds).toHaveLength(2)
})

test('triggerMemfsFileWatcher should not find watchers for different URIs', async () => {
  const memfsUri1 = 'memfs://test1.txt'
  const memfsUri2 = 'memfs://test2.txt'

  // Register watchers for different URIs
  await FileWatcher.watchFile(1, memfsUri1, 123)
  await FileWatcher.watchFile(2, memfsUri2, 456)

  // Check that only the correct watcher is found for each URI
  const watchIds1 = WatchCallbacks.getWatchCallbackIdsForUri(memfsUri1)
  const watchIds2 = WatchCallbacks.getWatchCallbackIdsForUri(memfsUri2)

  expect(watchIds1).toContain(1)
  expect(watchIds1).not.toContain(2)
  expect(watchIds2).toContain(2)
  expect(watchIds2).not.toContain(1)
})
