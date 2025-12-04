import { expect, jest, test } from '@jest/globals'
import * as FileSystemFileHandle from '../src/parts/FileSystemFileHandle/FileSystemFileHandle.ts'

test('getFile', async () => {
  const mockFile = new File(['content'], 'file1')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockHandle = {
    getFile: mockGetFile,
  } as unknown as FileSystemFileHandle
  const result = await FileSystemFileHandle.getFile(mockHandle)
  expect(result).toBe(mockFile)
  expect(mockGetFile).toHaveBeenCalled()
})

test('write', async () => {
  const mockWrite = jest.fn<(data: string) => Promise<void>>().mockResolvedValue(undefined)
  const mockClose = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
  const mockWritable = {
    write: mockWrite,
    close: mockClose,
  } as unknown as FileSystemWritableFileStream
  const mockCreateWritable = jest.fn<() => Promise<FileSystemWritableFileStream>>().mockResolvedValue(mockWritable)
  const mockHandle = {
    createWritable: mockCreateWritable,
  } as unknown as FileSystemFileHandle
  await FileSystemFileHandle.write(mockHandle, 'content')
  expect(mockCreateWritable).toHaveBeenCalled()
  expect(mockWrite).toHaveBeenCalledWith('content')
  expect(mockClose).toHaveBeenCalled()
})

test('writeResponse', async () => {
  const mockWritablePipeTo = jest.fn<(destination: WritableStream) => Promise<void>>().mockResolvedValue(undefined)
  const mockWritable = {
    pipeTo: mockWritablePipeTo,
  } as unknown as FileSystemWritableFileStream
  const mockCreateWritable = jest.fn<() => Promise<FileSystemWritableFileStream>>().mockResolvedValue(mockWritable)
  const mockHandle = {
    createWritable: mockCreateWritable,
  } as unknown as FileSystemFileHandle
  const mockBodyPipeTo = jest.fn<(destination: WritableStream) => Promise<void>>().mockResolvedValue(undefined)
  const mockBody = {
    pipeTo: mockBodyPipeTo,
  } as unknown as ReadableStream
  const mockResponse = {
    body: mockBody,
  } as Response
  await FileSystemFileHandle.writeResponse(mockHandle, mockResponse)
  expect(mockCreateWritable).toHaveBeenCalled()
  if (mockResponse.body) {
    expect(mockBodyPipeTo).toHaveBeenCalledWith(mockWritable)
  }
})
