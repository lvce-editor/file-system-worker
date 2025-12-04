import { beforeEach, expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import * as FileSystemHandle from '../src/parts/FileSystemHandle/FileSystemHandle.ts'
import { setFactory } from '../src/parts/RendererProcess/RendererProcess.ts'

const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockRpc = MockRpc.create({
  commandMap: {},
  invoke: mockInvoke,
})

beforeEach(() => {
  jest.resetAllMocks()
  setFactory(async () => mockRpc)
})

test('getFileHandles', async () => {
  const mockHandles = [{ kind: 'file', name: 'file1' }]
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileHandles.get') {
      return mockHandles
    }
    throw new Error(`unexpected method ${method}`)
  })
  const result = await FileSystemHandle.getFileHandles(['id1'])
  expect(result).toEqual(mockHandles)
  expect(mockInvoke).toHaveBeenCalledWith('FileHandles.get', ['id1'])
})

test('addFileHandle', async () => {
  const mockHandle = { kind: 'file', name: 'file1' }
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystemHandle.addFileHandle') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemHandle.addFileHandle(mockHandle as FileSystemHandle)
  expect(mockInvoke).toHaveBeenCalledWith('FileSystemHandle.addFileHandle', mockHandle)
})
