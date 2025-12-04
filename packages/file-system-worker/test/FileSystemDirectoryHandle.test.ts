import { expect, jest, test } from '@jest/globals'
import * as FileSystemDirectoryHandle from '../src/parts/FileSystemDirectoryHandle/FileSystemDirectoryHandle.ts'

test('getFileHandle', async () => {
  const mockHandle = {
    getFileHandle: jest.fn().mockResolvedValue({ name: 'file1', kind: 'file' }),
  } as unknown as FileSystemDirectoryHandle
  const result = await FileSystemDirectoryHandle.getFileHandle(mockHandle, 'file1')
  expect(result).toEqual({ name: 'file1', kind: 'file' })
  expect(mockHandle.getFileHandle).toHaveBeenCalledWith('file1')
})

test('getChildHandles', async () => {
  const mockChildHandle = { name: 'file1', kind: 'file' }
  const mockValues = async function* () {
    yield mockChildHandle
  }
  const mockHandle = {
    values: jest.fn().mockReturnValue(mockValues()),
  } as unknown as FileSystemDirectoryHandle
  const result = await FileSystemDirectoryHandle.getChildHandles(mockHandle)
  expect(result).toEqual([mockChildHandle])
})

