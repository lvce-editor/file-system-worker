import { test, expect, jest } from '@jest/globals'
import * as WatchCallbacks from '../src/parts/WatchCallbacks/WatchCallbacks.ts'

// Mock the RpcRegistry module
const mockRpc = {
  invoke: jest.fn(),
}

jest.mock('@lvce-editor/rpc-registry', () => ({
  get: jest.fn().mockReturnValue(mockRpc),
}))

test('registerWatchCallback should register a callback', () => {
  expect(() => WatchCallbacks.registerWatchCallback(1, 123, 'test.command')).not.toThrow()
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
