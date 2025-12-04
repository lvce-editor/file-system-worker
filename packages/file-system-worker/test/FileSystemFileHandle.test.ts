import { beforeEach, expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import * as FileSystemFileHandle from '../src/parts/FileSystemFileHandle/FileSystemFileHandle.ts'
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
  const mockBinaryString = 'binary content'
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockHandle = {
    getFile: mockGetFile,
  } as unknown as FileSystemFileHandle
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'Blob.blobToBinaryString') {
      return mockBinaryString
    }
    throw new Error(`unexpected method ${method}`)
  })
  const result = await FileSystemFileHandle.getBinaryString(mockHandle)
  expect(result).toBe(mockBinaryString)
  expect(mockGetFile).toHaveBeenCalled()
  expect(mockInvoke).toHaveBeenCalledWith('Blob.blobToBinaryString', mockFile)
})

test('write', async () => {
  const mockWrite = jest.fn<(data: Readonly<string>) => Promise<void>>().mockResolvedValue(undefined)
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
