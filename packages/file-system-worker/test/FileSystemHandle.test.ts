import { beforeEach, expect, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import * as FileSystemHandle from '../src/parts/FileSystemHandle/FileSystemHandle.ts'
import { setFactory } from '../src/parts/RendererProcess/RendererProcess.ts'

let mockRpc: ReturnType<typeof createMockRpc>

beforeEach(() => {
  mockRpc = createMockRpc({
    commandMap: {
      'FileHandles.get': async () => [{ kind: 'file', name: 'file1' }],
      'FileSystemHandle.addFileHandle': async () => undefined,
    },
  })
  setFactory(async () => mockRpc)
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
