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

test.skip('invoke should call rpc.invoke with method and params', async () => {
  let invokeCallCount = 0
  let lastMethod: string | undefined
  let lastParams: readonly unknown[] | undefined
  const mockRpc = MockRpc.create({
    commandMap: {},
    invoke: async (method: string, ...params: readonly unknown[]) => {
      invokeCallCount++
      lastMethod = method
      lastParams = params
      return undefined
    },
  })
  ExtensionHost.set(mockRpc)

  await ExtensionHostWorker.invoke('testMethod', 'param1', 'param2')

  expect(invokeCallCount).toBe(1)
  expect(lastMethod).toBe('testMethod')
  expect(lastParams).toEqual(['param1', 'param2'])

  await mockRpc.dispose()
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
