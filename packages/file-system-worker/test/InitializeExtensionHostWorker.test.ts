import { test, expect, jest } from '@jest/globals'
import { createExtensionHostRpc } from '../src/parts/InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts'

test('createExtensionHostRpc should create RPC successfully', async () => {
  await expect(createExtensionHostRpc()).resolves.toBeDefined()
})

test('createExtensionHostRpc should throw VError on failure', async () => {
  // Mock GetPortTuple to throw an error
  jest.doMock('../src/parts/GetPortTuple/GetPortTuple.ts', () => ({
    getPortTuple: () => {
      throw new Error('Port creation failed')
    }
  }))

  await expect(createExtensionHostRpc()).rejects.toThrow('Failed to create extension host rpc')
})
