import { test, expect, jest } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { initializeExtensionHostWorker } from '../src/parts/InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts'

test('createExtensionHostRpc should create RPC successfully', async () => {
  const mockInvokeAndTransfer = jest.fn<(method: string, port: MessagePort, command: string, rpcId: number) => Promise<void>>()
  const mockRpc = MockRpc.create({
    commandMap: {},
    invoke: () => {},
    invokeAndTransfer: mockInvokeAndTransfer,
  })
  RendererWorker.set(mockRpc)
  const rpc = await initializeExtensionHostWorker()
  expect(rpc).toBeDefined()
  expect(mockInvokeAndTransfer).toHaveBeenCalledTimes(1)
  expect(mockInvokeAndTransfer).toHaveBeenCalledWith(expect.any(String), expect.any(MessagePort), expect.any(String), expect.any(Number))
  await rpc.dispose()
})

test('createExtensionHostRpc should handle error when sendMessagePortToExtensionHostWorker fails', async () => {
  const mockInvokeAndTransfer = jest.fn<(method: string, port: MessagePort, command: string, rpcId: number) => Promise<void>>(() => {
    throw new Error('sendMessagePort error')
  })
  const mockRpc = MockRpc.create({
    commandMap: {},
    invoke: () => {},
    invokeAndTransfer: mockInvokeAndTransfer,
  })
  RendererWorker.set(mockRpc)
  await expect(initializeExtensionHostWorker()).rejects.toThrow('Failed to create extension host rpc')
})
