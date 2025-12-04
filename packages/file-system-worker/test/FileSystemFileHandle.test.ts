import { beforeEach, expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import { setFactory } from '../src/parts/RendererProcess/RendererProcess.ts'
import * as FileSystemFileHandle from '../src/parts/FileSystemFileHandle/FileSystemFileHandle.ts'

// @ts-ignore
globalThis.ProgressEvent = class ProgressEvent extends Event {
  constructor(type: string, init?: any) {
    super(type, init)
    this.target = init?.target
  }
  target: any
}

// @ts-ignore
globalThis.FileReader = class FileReader extends EventTarget {
  result: string | ArrayBuffer | null = null
  readyState: number = 0
  error: Error | null = null
  onload: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onloadend: ((event: any) => void) | null = null

  readAsBinaryString(blob: Blob): void {
    this.readyState = 1
    blob
      .arrayBuffer()
      .then((buffer) => {
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
      })
      .catch((error) => {
        this.error = error
        this.readyState = 2
        if (this.onerror) {
          this.onerror({ target: this })
        }
        if (this.onloadend) {
          this.onloadend({ target: this })
        }
      })
  }
}

const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockRpc = MockRpc.create({
  commandMap: {},
  invoke: mockInvoke,
})

beforeEach(() => {
  jest.resetAllMocks()
  setFactory(async () => mockRpc)
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
