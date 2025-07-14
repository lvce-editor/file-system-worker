import { expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import { createFileSystemProcessRpcElectron } from '../src/parts/CreateFileSystemProcessRpcElectron/CreateFileSystemProcessRpcElectron.js'
import * as RendererWorker from '../src/parts/RendererWorker/RendererWorker.js'

test('creates file system process rpc', async () => {
  const mockInvokeAndTransfer = jest.fn()
  const mockRpc = MockRpc.create({
    commandMap: {},
    invoke: async () => {},
    invokeAndTransfer: mockInvokeAndTransfer,
  })
  RendererWorker.set(mockRpc)
  const rpc = await createFileSystemProcessRpcElectron()
  expect(mockInvokeAndTransfer).toHaveBeenCalledTimes(1)
  expect(mockInvokeAndTransfer).toHaveBeenCalledWith(
    'SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess',
    expect.anything(),
    'HandleMessagePortForFileSystemProcess.handleMessagePortForFileSystemProcess',
    209,
  )
  expect(rpc).toBeDefined()
  await rpc.dispose()
})

test('handles error when creating file system process rpc', async () => {
  const mockInvokeAndTransfer = jest.fn(() => {
    throw new Error('test error')
  })
  const mockRpc = MockRpc.create({
    commandMap: {},
    invoke: async () => {},
    invokeAndTransfer: mockInvokeAndTransfer,
  })
  RendererWorker.set(mockRpc)
  await expect(createFileSystemProcessRpcElectron()).rejects.toThrow('Failed to create file system process rpc')
})
