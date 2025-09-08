import { test, expect } from '@jest/globals'
import { ExtensionHost } from '@lvce-editor/rpc-registry'
import * as ExtensionHostWorker from '../src/parts/ExtensionHostWorker/ExtensionHostWorker.ts'

test('set should be available from ExtensionHost', () => {
  expect(ExtensionHostWorker.set).toBe(ExtensionHost.set)
})
