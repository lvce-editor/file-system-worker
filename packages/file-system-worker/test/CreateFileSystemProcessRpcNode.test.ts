import { beforeAll, expect, jest, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
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
  const rendererWorker = RendererWorker.registerMockRpc({
    'WebSocketCapability.create'(): unknown {
      return { protocols: ['lvce-rpc', 'lvce-capability.token'], url: 'ws://localhost/websocket/capability' }
    },
  })
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
  try {
    const rpc = await createFileSystemProcessRpcNode()
    expect(rpc).toBeDefined()
    await rpc.dispose()
  } finally {
    rendererWorker[Symbol.dispose]()
  }
})

test('handles error when creating file system process rpc', async () => {
  const rendererWorker = RendererWorker.registerMockRpc({
    'WebSocketCapability.create'(): unknown {
      return { protocols: ['lvce-rpc', 'lvce-capability.token'], url: 'ws://localhost/websocket/capability' }
    },
  })
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
  rendererWorker[Symbol.dispose]()
  jest.useRealTimers()
})
