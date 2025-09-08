import { test, expect, jest } from '@jest/globals'
import * as WatchCallbacks from '../src/parts/WatchCallbacks/WatchCallbacks.ts'

// Mock the RpcRegistry module
const mockRpc = {
  invoke: jest.fn()
}

jest.mock('@lvce-editor/rpc-registry', () => ({
  get: jest.fn().mockReturnValue(mockRpc)
}))

test('registerWatchCallback should register a callback', () => {
  expect(() => WatchCallbacks.registerWatchCallback(1, 123, 'test.command')).not.toThrow()
})

test('executeWatchCallBack should execute a registered callback', async () => {
  mockRpc.invoke.mockResolvedValue(undefined as any)
  
  WatchCallbacks.registerWatchCallback(1, 123, 'test.command')
  await expect(WatchCallbacks.executeWatchCallBack(1)).resolves.not.toThrow()
  expect(mockRpc.invoke).toHaveBeenCalledWith('test.command', 1)
})

test('executeWatchCallBack should throw error for non-existent callback', async () => {
  await expect(WatchCallbacks.executeWatchCallBack(999)).rejects.toThrow('watch callback 999 not found')
})

test('unregisterWatchCallback should remove a callback', async () => {
  WatchCallbacks.registerWatchCallback(1, 123, 'test.command')
  WatchCallbacks.unregisterWatchCallback(1)
  
  // This should throw because callback was removed
  await expect(WatchCallbacks.executeWatchCallBack(1)).rejects.toThrow('watch callback 1 not found')
})

test('executeWatchCallBack should handle multiple callbacks', async () => {
  mockRpc.invoke.mockResolvedValue(undefined as any)
  
  WatchCallbacks.registerWatchCallback(1, 123, 'test.command1')
  WatchCallbacks.registerWatchCallback(2, 123, 'test.command2')
  
  await expect(WatchCallbacks.executeWatchCallBack(1)).resolves.not.toThrow()
  await expect(WatchCallbacks.executeWatchCallBack(2)).resolves.not.toThrow()
  
  expect(mockRpc.invoke).toHaveBeenCalledWith('test.command1', 1)
  expect(mockRpc.invoke).toHaveBeenCalledWith('test.command2', 2)
})
