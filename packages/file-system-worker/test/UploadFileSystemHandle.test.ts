/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { beforeEach, expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import { setFactory } from '../src/parts/RendererProcess/RendererProcess.ts'
import * as UploadFileSystemHandle from '../src/parts/UploadFileSystemHandle/UploadFileSystemHandle.ts'

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

const mockFileSystemInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockFileSystemRpc = MockRpc.create({
  commandMap: {},
  invoke: mockFileSystemInvoke,
})

const mockRendererInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockRendererRpc = MockRpc.create({
  commandMap: {},
  invoke: mockRendererInvoke,
})

beforeEach(() => {
  jest.resetAllMocks()
  FileSystemProcess.set(mockFileSystemRpc)
  setFactory(async () => mockRendererRpc)
})

test('uploadHandle with file', async () => {
  const mockFile = new File(['file content'], 'file1.txt')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockFileHandle = {
    getFile: mockGetFile,
    kind: 'file',
    name: 'file1.txt',
  } as unknown as FileSystemFileHandle

  mockFileSystemInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.writeFile') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })

  mockRendererInvoke.mockImplementation(async (method: string) => {
    if (method === 'Blob.blobToBinaryString') {
      return 'file content'
    }
    throw new Error(`unexpected method ${method}`)
  })

  const mockUploadHandles = jest.fn<(fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>>()

  await UploadFileSystemHandle.uploadHandle(mockFileHandle, '/', '/root', mockUploadHandles)

  expect(mockFileSystemInvoke).toHaveBeenCalledWith('FileSystem.writeFile', '/root/file1.txt', 'file content')
})

test('uploadHandle with directory', async () => {
  const mockChildHandle = { kind: 'file', name: 'file1' } as FileSystemHandle
  const mockValues = async function* (): AsyncGenerator<FileSystemHandle, void, unknown> {
    yield mockChildHandle
  }
  const mockDirectoryHandle = {
    kind: 'directory',
    name: 'folder1',
    values: jest.fn().mockReturnValue(mockValues()),
  } as unknown as FileSystemDirectoryHandle

  mockFileSystemInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.mkdir') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })

  const mockUploadHandles = jest.fn<(fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>>()

  await UploadFileSystemHandle.uploadHandle(mockDirectoryHandle, '/', '/root', mockUploadHandles)

  expect(mockFileSystemInvoke).toHaveBeenCalledWith('FileSystem.mkdir', '/root/folder1')
  expect(mockUploadHandles).toHaveBeenCalledWith([mockChildHandle], '/', '/root/folder1')
})

test('uploadHandle with unsupported type', async () => {
  const mockHandle = {
    kind: 'unknown',
    name: 'unknown',
  } as unknown as FileSystemHandle

  const mockUploadHandles = jest.fn<(fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>>()

  const promise = UploadFileSystemHandle.uploadHandle(mockHandle, '/', '/root', mockUploadHandles)
  await expect(promise).rejects.toThrow('unsupported file system handle type unknown')
})
