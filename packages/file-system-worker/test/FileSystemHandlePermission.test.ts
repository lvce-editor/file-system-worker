import { beforeEach, expect, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import * as FileSystemHandlePermission from '../src/parts/FileSystemHandlePermission/FileSystemHandlePermission.ts'
import { setFactory } from '../src/parts/RendererProcess/RendererProcess.ts'

let mockRpc: ReturnType<typeof createMockRpc>

beforeEach(() => {
  mockRpc = createMockRpc({
    commandMap: {
      'FileSystemHandle.requestPermission': async () => 'granted',
    },
  })
  setFactory(async () => mockRpc)
})

test('requestPermission', async () => {
  const mockHandle = { kind: 'file' as const, name: 'file1' }
  const options = { mode: 'read' as const }
  const result = await FileSystemHandlePermission.requestPermission(mockHandle, options)
  expect(result).toBe('granted')
  expect(mockRpc.invocations).toEqual([['FileSystemHandle.requestPermission', mockHandle, options]])
})

test('queryPermission', async () => {
  const mockQueryPermission = jest.fn<(options: Readonly<{ mode?: 'read' | 'readwrite' }>) => Promise<PermissionState>>().mockResolvedValue('granted')
  const mockHandle = {
    kind: 'file',
    name: 'file1',
    queryPermission: mockQueryPermission,
  }
  const options = { mode: 'read' as const }
  const result = await FileSystemHandlePermission.queryPermission(mockHandle, options)
  expect(result).toBe('granted')
  expect(mockQueryPermission).toHaveBeenCalledWith(options)
})
