import { beforeAll, expect, jest, test } from '@jest/globals'
import { createFileSystemProcessRpcNode } from '../src/parts/CreateFileSystemProcessRpcNode/CreateFileSystemProcessRpcNode.js'

beforeAll(() => {
  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: {
      href: 'http://localhost:3000',
      protocol: 'http:',
    },
  })
})

test('creates file system process rpc', async () => {
  class MockWebSocket extends EventTarget {
    constructor() {
      super()

      setTimeout((): void => {
        this.dispatchEvent(new Event('open'))
      }, 0)
    }

    close(): void {}
  }
  Object.defineProperty(globalThis, 'WebSocket', {
    configurable: true,
    value: MockWebSocket,
  })
  const rpc = await createFileSystemProcessRpcNode()
  expect(rpc).toBeDefined()
  await rpc.dispose()
})

test('handles error when creating file system process rpc', async () => {
  jest.useFakeTimers()
  class MockWebSocket extends EventTarget {
    constructor() {
      super()

      setTimeout((): void => {
        this.dispatchEvent(new Event('close'))
      }, 0)
    }

    close(): void {}
  }
  Object.defineProperty(globalThis, 'WebSocket', {
    configurable: true,
    value: MockWebSocket,
  })
  const rpcPromise = createFileSystemProcessRpcNode()
  const errorPromise = (async (): Promise<unknown> => {
    try {
      return await rpcPromise
    } catch (error) {
      return error
    }
  })()
  await jest.runAllTimersAsync()
  await expect(errorPromise).resolves.toMatchObject({
    message: 'Failed to create file system process rpc: Failed to create rpc connection: IpcError: Websocket connection was immediately closed',
  })
  jest.useRealTimers()
})
