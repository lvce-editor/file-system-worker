import { beforeEach, expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import * as FileSystemHandlePermission from '../src/parts/FileSystemHandlePermission/FileSystemHandlePermission.ts'
import * as RendererProcess from '../src/parts/RendererProcess/RendererProcess.ts'

const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockRpc = MockRpc.create({
  commandMap: {},
  invoke: mockInvoke,
})

beforeEach(() => {
  jest.resetAllMocks()
  RendererProcess.set(mockRpc)
})

test('requestPermission', async () => {
  const mockHandle = { name: 'file1', kind: 'file' } as FileSystemHandle
  const options = { mode: 'read' as const }
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystemHandle.requestPermission') {
      return 'granted' as PermissionState
    }
    throw new Error(`unexpected method ${method}`)
  })
  const result = await FileSystemHandlePermission.requestPermission(mockHandle, options)
  expect(result).toBe('granted')
  expect(mockInvoke).toHaveBeenCalledWith('FileSystemHandle.requestPermission', mockHandle, options)
})

test('queryPermission', async () => {
  const mockQueryPermission = jest.fn<(options: Readonly<{ mode?: 'read' | 'readwrite' }>) => Promise<PermissionState>>().mockResolvedValue('granted')
  const mockHandle = {
    name: 'file1',
    kind: 'file',
    queryPermission: mockQueryPermission,
  } as unknown as FileSystemHandle & { queryPermission: (options: Readonly<{ mode?: 'read' | 'readwrite' }>) => Promise<PermissionState> }
  const options = { mode: 'read' as const }
  const result = await FileSystemHandlePermission.queryPermission(mockHandle, options)
  expect(result).toBe('granted')
  expect(mockQueryPermission).toHaveBeenCalledWith(options)
})
