import { test, expect, jest } from '@jest/globals'
import * as FileWatcher from '../src/parts/FileWatcher/FileWatcher.ts'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'

const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockRpc = {
  invoke: mockInvoke,
  send: jest.fn(),
  invokeAndTransfer: jest.fn(),
  dispose: jest.fn()
} as any

// Mock the RpcRegistry module
const mockRpcRegistry = {
  invoke: jest.fn()
}

jest.mock('@lvce-editor/rpc-registry', () => ({
  get: jest.fn().mockReturnValue(mockRpcRegistry)
}))

FileSystemProcess.set(mockRpc)

test('watchFile should throw error for invalid URI', async () => {
  await expect(FileWatcher.watchFile(1, 'invalid-uri', 123)).rejects.toThrow('uri must be a valid uri')
})

test('watchFile should register watch callback and invoke FileSystemProcess', async () => {
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.watchFile') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })

  await expect(FileWatcher.watchFile(1, 'file:///test.txt', 123)).resolves.not.toThrow()
})

test('executeWatchCallback should execute watch callback', async () => {
  mockRpcRegistry.invoke.mockResolvedValue(undefined as any)
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.watchFile') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })

  // First register a watch callback
  await FileWatcher.watchFile(1, 'file:///test.txt', 123)
  
  // Then execute the callback
  await FileWatcher.executeWatchCallback(1)
  
  expect(mockRpcRegistry.invoke).toHaveBeenCalledWith('Output.executeWatchCallback', 1)
})

test('executeWatchCallback should handle errors gracefully', async () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  
  // Execute callback for non-existent ID
  await FileWatcher.executeWatchCallback(999)
  
  expect(consoleSpy).toHaveBeenCalled()
  
  consoleSpy.mockRestore()
})

test('unwatchFile should unregister watch callback and invoke FileSystemProcess', async () => {
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.unwatchFile') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })

  await expect(FileWatcher.unwatchFile(1)).resolves.not.toThrow()
})

test('watchFile should handle RPC not found gracefully', async () => {
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.watchFile') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })

  // Register a watch callback
  await FileWatcher.watchFile(1, 'file:///test.txt', 123)
  
  // Mock RPC not found
  const rpcRegistry = jest.requireMock('@lvce-editor/rpc-registry')
  jest.mocked(rpcRegistry.get).mockReturnValue(null)
  
  // Execute callback should not throw
  await expect(FileWatcher.executeWatchCallback(1)).resolves.not.toThrow()
})
