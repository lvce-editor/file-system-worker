import { test, expect } from '@jest/globals'
import { createExtensionHostRpc } from '../src/parts/InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts'

test('createExtensionHostRpc should be a function', () => {
  expect(typeof createExtensionHostRpc).toBe('function')
})
