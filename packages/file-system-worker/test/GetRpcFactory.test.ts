import { test, expect } from '@jest/globals'
import { createFileSystemProcessRpcElectron } from '../src/parts/CreateFileSystemProcessRpcElectron/CreateFileSystemProcessRpcElectron.js'
import { createFileSystemProcessRpcNode } from '../src/parts/CreateFileSystemProcessRpcNode/CreateFileSystemProcessRpcNode.js'
import { getRpcFactory } from '../src/parts/GetRpcFactory/GetRpcFactory.js'
import * as PlatformType from '../src/parts/PlatformType/PlatformType.js'

test('returns electron rpc factory for electron platform', () => {
  const factory = getRpcFactory(PlatformType.Electron)
  expect(factory).toBe(createFileSystemProcessRpcElectron)
})

test('returns node rpc factory for remote platform', () => {
  const factory = getRpcFactory(PlatformType.Remote)
  expect(factory).toBe(createFileSystemProcessRpcNode)
})

test('throws error for unexpected platform', () => {
  expect(() => getRpcFactory(999)).toThrow('unexpected platform')
})
