import { expect, jest, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { initializeExtensionHostWorker } from '../src/parts/InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts'

test('createExtensionHostRpc should create RPC successfully', async () => {
  const mockInvokeAndTransfer = jest.fn<(method: string, port: MessagePort, command: string, rpcId: number) => Promise<void>>()
  const mockRpc = {
    dispose: jest.fn(),
    invoke: jest.fn(),
    invokeAndTransfer: mockInvokeAndTransfer,
    send: jest.fn(),
  } as any
  RendererWorker.set(mockRpc)
  await expect(initializeExtensionHostWorker()).resolves.toBeUndefined()
  expect(mockInvokeAndTransfer).toHaveBeenCalledWith(
    'SendMessagePortToExtensionHostWorker.sendMessagePortToExtensionHostWorker',
    expect.anything(),
    'HandleMessagePort.handleMessagePort2',
    0,
  )
})

test('createExtensionHostRpc should handle error when sendMessagePortToExtensionHostWorker fails', async () => {
  const mockInvokeAndTransfer = jest.fn<(method: string, port: MessagePort, command: string, rpcId: number) => Promise<void>>(() => {
    throw new Error('sendMessagePort error')
  })
  const mockRpc = {
    dispose: jest.fn(),
    invoke: jest.fn(),
    invokeAndTransfer: mockInvokeAndTransfer,
    send: jest.fn(),
  } as any
  RendererWorker.set(mockRpc)
  await expect(initializeExtensionHostWorker()).rejects.toThrow('Failed to create extension host rpc')
  expect(mockInvokeAndTransfer).toHaveBeenCalledWith(
    'SendMessagePortToExtensionHostWorker.sendMessagePortToExtensionHostWorker',
    expect.anything(),
    'HandleMessagePort.handleMessagePort2',
    0,
  )
})
