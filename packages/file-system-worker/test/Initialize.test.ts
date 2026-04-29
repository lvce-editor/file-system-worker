import { expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { RpcId, get } from '@lvce-editor/rpc-registry'
import { initialize } from '../src/parts/Initialize/Initialize.ts'

test('initialize', async () => {
  const mockInvokeAndTransfer = jest.fn()
  const mockRpc = createMockRpc({
    commandMap: {
      'SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess': mockInvokeAndTransfer,
    },
  })
  RendererWorker.set(mockRpc)
  await initialize(2)
  const rpc = get(RpcId.FileSystemProcess)
  expect(mockRpc.invocations).toEqual([
    ['SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess', expect.anything(), 'HandleMessagePortForFileSystemProcess.handleMessagePortForFileSystemProcess', 209],
  ])
  expect(rpc).toBeDefined()
  await rpc.dispose()
})
