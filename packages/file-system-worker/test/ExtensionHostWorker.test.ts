import { test, expect, jest, beforeEach } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import { ExtensionHost } from '@lvce-editor/rpc-registry'
import * as ExtensionHostWorker from '../src/parts/ExtensionHostWorker/ExtensionHostWorker.ts'

const mockCreateExtensionHostRpc = jest.fn<() => Promise<any>>()

jest.mock('../src/parts/InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts', () => ({
  createExtensionHostRpc: mockCreateExtensionHostRpc,
}))

beforeEach(() => {
  mockCreateExtensionHostRpc.mockReset()
})

test('set should be available from ExtensionHost', () => {
  expect(ExtensionHostWorker.set).toBe(ExtensionHost.set)
})

test.skip('invoke should call rpc.invoke with method and params', async () => {
  const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
  const mockRpc = MockRpc.create({
    commandMap: {},
    invoke: mockInvoke,
  })
  mockCreateExtensionHostRpc.mockResolvedValue(mockRpc)

  await ExtensionHostWorker.invoke('testMethod', 'param1', 'param2')

  expect(mockInvoke).toHaveBeenCalledTimes(1)
  expect(mockInvoke).toHaveBeenCalledWith('testMethod', 'param1', 'param2')
})
