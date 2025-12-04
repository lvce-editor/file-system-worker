import { expect, jest, test } from '@jest/globals'
import * as FileSystemDirectoryHandle from '../src/parts/FileSystemDirectoryHandle/FileSystemDirectoryHandle.ts'

test('getFileHandle', async () => {
  const mockFileHandle = { name: 'file1', kind: 'file' } as FileSystemFileHandle
  const mockGetFileHandle = jest.fn<(name: string) => Promise<FileSystemFileHandle>>().mockResolvedValue(mockFileHandle)
  const mockHandle = {
    getFileHandle: mockGetFileHandle,
  } as unknown as FileSystemDirectoryHandle
  const result = await FileSystemDirectoryHandle.getFileHandle(mockHandle, 'file1')
  expect(result).toBe(mockFileHandle)
  expect(mockGetFileHandle).toHaveBeenCalledWith('file1')
})

test('getChildHandles', async () => {
  const mockChildHandle = { name: 'file1', kind: 'file' }
  const mockValues = async function* (): AsyncGenerator<FileSystemHandle, void, unknown> {
    yield mockChildHandle as FileSystemHandle
  }
  const mockHandle = {
    values: jest.fn().mockReturnValue(mockValues()),
  } as unknown as FileSystemDirectoryHandle
  const result = await FileSystemDirectoryHandle.getChildHandles(mockHandle)
  expect(result).toEqual([mockChildHandle])
})
