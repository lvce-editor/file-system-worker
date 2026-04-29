import { expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import { createFileSystemProcessRpcElectron } from '../src/parts/CreateFileSystemProcessRpcElectron/CreateFileSystemProcessRpcElectron.js'
import * as RendererWorker from '../src/parts/RendererWorker/RendererWorker.js'

test('creates file system process rpc', async () => {
  const mockInvokeAndTransfer = jest.fn()
  const mockRpc = createMockRpc({
    commandMap: {
      'SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess': mockInvokeAndTransfer,
    },
  })
  RendererWorker.set(mockRpc)
  const rpc = await createFileSystemProcessRpcElectron()
  expect(mockRpc.invocations).toEqual([
    ['SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess', expect.anything(), 'HandleMessagePortForFileSystemProcess.handleMessagePortForFileSystemProcess', 209],
  ])
  expect(rpc).toBeDefined()
  await rpc.dispose()
})

test('handles error when creating file system process rpc', async () => {
  const mockInvokeAndTransfer = jest.fn(() => {
    throw new Error('test error')
  })
  const mockRpc = createMockRpc({
    commandMap: {
      'SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess': mockInvokeAndTransfer,
    },
  })
  RendererWorker.set(mockRpc)
  await expect(createFileSystemProcessRpcElectron()).rejects.toThrow('Failed to create file system process rpc')
  expect(mockRpc.invocations).toEqual([
    ['SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess', expect.anything(), 'HandleMessagePortForFileSystemProcess.handleMessagePortForFileSystemProcess', 209],
  ])
})
