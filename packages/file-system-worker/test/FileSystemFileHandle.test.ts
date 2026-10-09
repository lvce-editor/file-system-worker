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

test('getBinaryString', async () => {
  const mockFile = new File(['content'], 'file1')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockHandle = {
    getFile: mockGetFile,
  } as unknown as FileSystemFileHandle
  const result = await FileSystemFileHandle.getBinaryString(mockHandle)
  expect(result).toBe('content')
  expect(mockGetFile).toHaveBeenCalled()
})

test('getBinaryString preserves non-ASCII file bytes', async () => {
  const mockFile = new File([new Uint8Array([0x00, 0x80, 0xff])], 'binary')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockHandle = {
    getFile: mockGetFile,
  } as unknown as FileSystemFileHandle
  await expect(FileSystemFileHandle.getBinaryString(mockHandle)).resolves.toBe(String.fromCodePoint(0, 0x80, 0xff))
})

test('write', async () => {
  const mockWrite = jest.fn<(data: Readonly<string>) => Promise<void>>().mockResolvedValue(undefined)
  const mockClose = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
  const mockWritable = {
    close: mockClose,
    write: mockWrite,
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
  const mockWritablePipeTo = jest.fn<(destination: Readonly<WritableStream>) => Promise<void>>().mockResolvedValue(undefined)
  const mockWritable = {
    pipeTo: mockWritablePipeTo,
  } as unknown as FileSystemWritableFileStream
  const mockCreateWritable = jest.fn<() => Promise<FileSystemWritableFileStream>>().mockResolvedValue(mockWritable)
  const mockHandle = {
    createWritable: mockCreateWritable,
  } as unknown as FileSystemFileHandle
  const mockBodyPipeTo = jest.fn<(destination: Readonly<WritableStream>) => Promise<void>>().mockResolvedValue(undefined)
  const mockBody = {
    pipeTo: mockBodyPipeTo,
  } as unknown as ReadableStream
  const mockResponse = {
    body: mockBody,
  } as Response
  await FileSystemFileHandle.writeResponse(mockHandle, mockResponse)
  expect(mockCreateWritable).toHaveBeenCalled()
  expect(mockBodyPipeTo).toHaveBeenCalledWith(mockWritable)
})

test('writeResponse with null body', async () => {
  const mockWritable = {} as unknown as FileSystemWritableFileStream
  const mockCreateWritable = jest.fn<() => Promise<FileSystemWritableFileStream>>().mockResolvedValue(mockWritable)
  const mockHandle = {
    createWritable: mockCreateWritable,
  } as unknown as FileSystemFileHandle
  const mockResponse = {
    body: null,
  } as Response
  await FileSystemFileHandle.writeResponse(mockHandle, mockResponse)
  expect(mockCreateWritable).toHaveBeenCalled()
})
