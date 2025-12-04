import { test, expect, jest } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import { ExtensionHost } from '@lvce-editor/rpc-registry'

const mockCreateExtensionHostRpc = jest.fn<() => Promise<any>>()

jest.mock('../src/parts/InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts', () => ({
  createExtensionHostRpc: mockCreateExtensionHostRpc,
}))

test('set should be available from ExtensionHost', async () => {
  const ExtensionHostWorker = await import('../src/parts/ExtensionHostWorker/ExtensionHostWorker.ts')
  expect(ExtensionHostWorker.set).toBe(ExtensionHost.set)
})

test('invoke should call rpc.invoke with method and params', async () => {
  const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
  const mockRpc = MockRpc.create({
    commandMap: {},
    invoke: mockInvoke,
  })
  mockCreateExtensionHostRpc.mockResolvedValue(mockRpc)

  const ExtensionHostWorker = await import('../src/parts/ExtensionHostWorker/ExtensionHostWorker.ts')
  await ExtensionHostWorker.invoke('testMethod', 'param1', 'param2')

  expect(mockInvoke).toHaveBeenCalledTimes(1)
  expect(mockInvoke).toHaveBeenCalledWith('testMethod', 'param1', 'param2')
})
