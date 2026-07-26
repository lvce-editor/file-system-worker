import { expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import { RendererWorker, RpcId, get } from '@lvce-editor/rpc-registry'
import { initialize } from '../src/parts/Initialize/Initialize.ts'
import * as PlatformType from '../src/parts/PlatformType/PlatformType.ts'

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
    [
      'SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess',
      expect.anything(),
      'HandleMessagePortForFileSystemProcess.handleMessagePortForFileSystemProcess',
      209,
    ],
  ])
  expect(rpc).toBeDefined()
  await rpc.dispose()
})

test('initialize - web installs unavailable disk file system rpc', async () => {
  await initialize(PlatformType.Web)

  const rpc = get(RpcId.FileSystemProcess)
  await expect(rpc.invoke('FileSystem.readFile', '/test/config.json')).rejects.toThrow('Disk file system is not available in web')
})
