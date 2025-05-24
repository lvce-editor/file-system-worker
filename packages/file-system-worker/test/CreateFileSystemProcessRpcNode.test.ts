import { beforeAll, expect, jest, test } from '@jest/globals'
import { createFileSystemProcessRpcNode } from '../src/parts/CreateFileSystemProcessRpcNode/CreateFileSystemProcessRpcNode.js'
import * as GetWebSocketUrl from '../src/parts/GetWebSocketUrl/GetWebSocketUrl.js'

beforeAll(() => {
  // @ts-ignore
  globalThis.location = {
    href: 'http://localhost:3000',
    protocol: 'http:',
  }
})

test('creates file system process rpc', async () => {
  // @ts-ignore
  globalThis.WebSocket = class MockWebSocket extends EventTarget {
    constructor() {
      super()

      setTimeout(() => {
        this.dispatchEvent(new Event('open'))
      }, 0)
    }

    close() {}
  }
  const rpc = await createFileSystemProcessRpcNode()
  expect(rpc).toBeDefined()
  rpc.dispose()
})

test('handles error when creating file system process rpc', async () => {
  // @ts-ignore
  globalThis.WebSocket = class MockWebSocket extends EventTarget {
    constructor() {
      super()

      setTimeout(() => {
        this.dispatchEvent(new Event('close'))
      }, 0)
    }

    close() {}
  }
  await expect(createFileSystemProcessRpcNode()).rejects.toThrow(
    new Error('Failed to create file system process rpc: IpcError: Websocket connection was immediately closed'),
  )
})
