import { jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { RpcId, get } from '@lvce-editor/rpc-registry'
import { initialize } from '../src/parts/Initialize/Initialize.ts'

test('initialize', async () => {
  const mockInvokeAndTransfer = jest.fn()
  const mockRpc = MockRpc.create({
    commandMap: {},
    invoke: () => {},
    invokeAndTransfer: mockInvokeAndTransfer,
  })
  RendererWorker.set(mockRpc)
  await initialize(2)
  const rpc = get(RpcId.FileSystemProcess)
  await rpc.dispose()
})
