import { expect, jest, test } from '@jest/globals'
import * as FileSystemFileHandle from '../src/parts/FileSystemFileHandle/FileSystemFileHandle.ts'

test('getFile', async () => {
  const mockFile = new File(['content'], 'file1')
  const mockHandle = {
    getFile: jest.fn().mockResolvedValue(mockFile),
  } as unknown as FileSystemFileHandle
  const result = await FileSystemFileHandle.getFile(mockHandle)
  expect(result).toBe(mockFile)
  expect(mockHandle.getFile).toHaveBeenCalled()
})

test('write', async () => {
  const mockWritable = {
    write: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  }
  const mockHandle = {
    createWritable: jest.fn().mockResolvedValue(mockWritable),
  } as unknown as FileSystemFileHandle
  await FileSystemFileHandle.write(mockHandle, 'content')
  expect(mockHandle.createWritable).toHaveBeenCalled()
  expect(mockWritable.write).toHaveBeenCalledWith('content')
  expect(mockWritable.close).toHaveBeenCalled()
})

test('writeResponse', async () => {
  const mockWritable = {
    pipeTo: jest.fn().mockResolvedValue(undefined),
  }
  const mockHandle = {
    createWritable: jest.fn().mockResolvedValue(mockWritable),
  } as unknown as FileSystemFileHandle
  const mockResponse = {
    body: { pipeTo: jest.fn().mockResolvedValue(undefined) },
  } as unknown as Response
  await FileSystemFileHandle.writeResponse(mockHandle, mockResponse)
  expect(mockHandle.createWritable).toHaveBeenCalled()
  if (mockResponse.body) {
    expect(mockResponse.body.pipeTo).toHaveBeenCalledWith(mockWritable)
  }
})
