import { test, expect } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import { set } from '@lvce-editor/rpc-registry'
import * as WatchCallbacks from '../src/parts/WatchCallbacks/WatchCallbacks.ts'

test('registerWatchCallback should register a callback', () => {
  const mockRpc = createMockRpc({
    commandMap: {
      'test.command': async () => undefined,
    },
  })
  set(123, mockRpc)
  expect(() => WatchCallbacks.registerWatchCallback(1, 123, 'test.command', 'file:///test.txt')).not.toThrow()
})

test('executeWatchCallBack should throw error for non-existent callback', async () => {
  await expect(WatchCallbacks.executeWatchCallBack(999)).rejects.toThrow('watch callback 999 not found')
})

test('unregisterWatchCallback should remove a callback', async () => {
  const mockRpc = createMockRpc({
    commandMap: {
      'test.command': async () => undefined,
    },
  })
  set(123, mockRpc)
  WatchCallbacks.registerWatchCallback(1, 123, 'test.command', 'file:///test.txt')
  WatchCallbacks.unregisterWatchCallback(1)

  // This should throw because callback was removed
  await expect(WatchCallbacks.executeWatchCallBack(1)).rejects.toThrow('watch callback 1 not found')
})
