import { beforeEach, expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import * as FileSystemHandlePermission from '../src/parts/FileSystemHandlePermission/FileSystemHandlePermission.ts'
import { setFactory } from '../src/parts/RendererProcess/RendererProcess.ts'

beforeEach(() => {
  jest.resetAllMocks()
})

test('requestPermission', async () => {
  const mockRpc = createMockRpc({
    commandMap: {
      'FileSystemHandle.requestPermission': async () => 'granted',
    },
  })
  setFactory(async () => mockRpc)

  const mockHandle = {
    isSameEntry: async (): Promise<boolean> => false,
    kind: 'file' as const,
    name: 'file1',
  }
  const options = { mode: 'read' as const }
  const result = await FileSystemHandlePermission.requestPermission(mockHandle, options)
  expect(result).toBe('granted')
  expect(mockRpc.invocations).toEqual([['FileSystemHandle.requestPermission', mockHandle, options]])
})

test('queryPermission', async () => {
  const mockRpc = createMockRpc({
    commandMap: {
      'FileSystemHandle.requestPermission': async () => 'granted',
    },
  })
  setFactory(async () => mockRpc)

  const mockQueryPermission = jest.fn<(options: Readonly<{ mode?: 'read' | 'readwrite' }>) => Promise<PermissionState>>().mockResolvedValue('granted')
  const mockHandle = {
    isSameEntry: async (): Promise<boolean> => false,
    kind: 'file' as const,
    name: 'file1',
    queryPermission: mockQueryPermission,
  }
  const options = { mode: 'read' as const }
  const result = await FileSystemHandlePermission.queryPermission(mockHandle, options)
  expect(result).toBe('granted')
  expect(mockQueryPermission).toHaveBeenCalledWith(options)
})
