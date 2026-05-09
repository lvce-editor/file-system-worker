import { expect, test } from '@jest/globals'
import { RpcId, get } from '@lvce-editor/rpc-registry'
import { initializeExtensionHostWorker } from '../src/parts/InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts'

test('createExtensionHostRpc should create RPC successfully', async () => {
  await expect(initializeExtensionHostWorker()).resolves.toBeUndefined()
  expect(get(RpcId.ExtensionHostWorker)).toBeDefined()
})

test('createExtensionHostRpc should keep extension host rpc available after repeated initialization', async () => {
  await expect(initializeExtensionHostWorker()).resolves.toBeUndefined()
  await expect(initializeExtensionHostWorker()).resolves.toBeUndefined()

  expect(get(RpcId.ExtensionHostWorker)).toBeDefined()
})
