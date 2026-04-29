import { expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { initializeExtensionHostWorker } from '../src/parts/InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts'

test('createExtensionHostRpc should create RPC successfully', async () => {
  const mockInvokeAndTransfer = jest.fn<(method: string, port: MessagePort, command: string, rpcId: number) => Promise<void>>()
  const mockRpc = createMockRpc({
    commandMap: {
      'SendMessagePortToExtensionHostWorker.sendMessagePortToExtensionHostWorker': mockInvokeAndTransfer,
    },
  })
  RendererWorker.set(mockRpc)
  await expect(initializeExtensionHostWorker()).resolves.toBeUndefined()
  expect(mockRpc.invocations).toEqual([
    ['SendMessagePortToExtensionHostWorker.sendMessagePortToExtensionHostWorker', expect.anything(), 'HandleMessagePort.handleMessagePort', 0],
  ])
})

test('createExtensionHostRpc should handle error when sendMessagePortToExtensionHostWorker fails', async () => {
  const mockInvokeAndTransfer = jest.fn<(method: string, port: MessagePort, command: string, rpcId: number) => Promise<void>>(() => {
    throw new Error('sendMessagePort error')
  })
  const mockRpc = createMockRpc({
    commandMap: {
      'SendMessagePortToExtensionHostWorker.sendMessagePortToExtensionHostWorker': mockInvokeAndTransfer,
    },
  })
  RendererWorker.set(mockRpc)
  await expect(initializeExtensionHostWorker()).rejects.toThrow('Failed to create extension host rpc')
  expect(mockRpc.invocations).toEqual([
    ['SendMessagePortToExtensionHostWorker.sendMessagePortToExtensionHostWorker', expect.anything(), 'HandleMessagePort.handleMessagePort', 0],
  ])
})
