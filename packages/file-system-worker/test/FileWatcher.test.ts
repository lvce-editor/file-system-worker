import { test, expect, jest } from '@jest/globals'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import * as FileWatcher from '../src/parts/FileWatcher/FileWatcher.ts'

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
