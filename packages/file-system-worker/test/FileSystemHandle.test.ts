import { beforeEach, expect, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import { RpcId, set as setRpc } from '@lvce-editor/rpc-registry'
import * as FileSystemHandle from '../src/parts/FileSystemHandle/FileSystemHandle.ts'

let mockRpc: ReturnType<typeof createMockRpc>

beforeEach(() => {
  mockRpc = createMockRpc({
    commandMap: {
      'FileHandles.get': async () => [{ kind: 'file', name: 'file1' }],
      'FileSystemHandle.addFileHandle': async () => undefined,
    },
  })
  setRpc(RpcId.RendererProcess, mockRpc)
})

test('getFileHandles', async () => {
  const mockHandles = [{ kind: 'file', name: 'file1' }]
  const result = await FileSystemHandle.getFileHandles(['id1'])
  expect(result).toEqual(mockHandles)
  expect(mockRpc.invocations).toEqual([['FileHandles.get', ['id1']]])
})

test('addFileHandle', async () => {
  const mockHandle = { kind: 'file', name: 'file1' }
  await FileSystemHandle.addFileHandle(mockHandle as FileSystemHandle)
  expect(mockRpc.invocations).toEqual([['FileSystemHandle.addFileHandle', mockHandle]])
})
