import { expect, jest, test } from '@jest/globals'
import * as FileSystemFileHandle from '../src/parts/FileSystemFileHandle/FileSystemFileHandle.ts'

const MockProgressEvent = class ProgressEvent extends Event {
  target: any

  constructor(type: string, init?: any) {
    super(type, init)
    this.target = init?.target
  }
}

const MockFileReader = class FileReader extends EventTarget {
  target: any
  result: string | ArrayBuffer | null = null
  readyState: number = 0
  error: Error | null = null
  onload: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onloadend: ((event: any) => void) | null = null

  async readAsBinaryString(blob: Blob): Promise<void> {
    this.readyState = 1
    try {
      const buffer = await blob.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binaryString = ''
      for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCodePoint(bytes[i])
      }
      this.result = binaryString
      this.readyState = 2
      if (this.onload) {
        this.onload({ target: this })
      }
      if (this.onloadend) {
        this.onloadend({ target: this })
      }
    } catch (error) {
      this.error = error as Error | null
      this.readyState = 2
      if (this.onerror) {
        this.onerror({ target: this })
      }
      if (this.onloadend) {
        this.onloadend({ target: this })
      }
    }
  }
}

Object.defineProperties(globalThis, {
  FileReader: {
    configurable: true,
    value: MockFileReader,
  },
  ProgressEvent: {
    configurable: true,
    value: MockProgressEvent,
  },
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
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockHandle = {
    getFile: mockGetFile,
  } as unknown as FileSystemFileHandle
  const result = await FileSystemFileHandle.getBinaryString(mockHandle)
  expect(result).toBe('content')
  expect(mockGetFile).toHaveBeenCalled()
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
