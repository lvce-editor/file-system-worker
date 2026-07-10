import { beforeEach, expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import * as UploadFileSystemHandle from '../src/parts/UploadFileSystemHandle/UploadFileSystemHandle.ts'

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

const createMockFileSystemRpc = (): ReturnType<typeof createMockRpc> => {
  const mockFileSystemRpc = createMockRpc({
    commandMap: {
      'FileSystem.mkdir': async () => undefined,
      'FileSystem.writeFile': async () => undefined,
    },
  })
  FileSystemProcess.set(mockFileSystemRpc)
  return mockFileSystemRpc
}

beforeEach(() => {
  jest.resetAllMocks()
})

test('uploadHandle with file', async () => {
  const mockFileSystemRpc = createMockFileSystemRpc()
  const mockFile = new File(['file content'], 'file1.txt')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockFileHandle = {
    getFile: mockGetFile,
    kind: 'file',
    name: 'file1.txt',
  } as unknown as FileSystemFileHandle

  const mockUploadHandles = jest.fn<(fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>>()

  await UploadFileSystemHandle.uploadHandle(mockFileHandle, '/', '/root', mockUploadHandles)

  expect(mockFileSystemRpc.invocations).toEqual([['FileSystem.writeFile', '/root/file1.txt', 'file content']])
})

test('uploadHandle with directory', async () => {
  const mockFileSystemRpc = createMockFileSystemRpc()
  const mockChildHandle = { kind: 'file', name: 'file1' } as FileSystemHandle
  const mockValues = async function* (): AsyncGenerator<FileSystemHandle, void, unknown> {
    yield mockChildHandle
  }
  const mockDirectoryHandle = {
    kind: 'directory',
    name: 'folder1',
    values: jest.fn().mockReturnValue(mockValues()),
  } as unknown as FileSystemDirectoryHandle

  const mockUploadHandles = jest.fn<(fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>>()

  await UploadFileSystemHandle.uploadHandle(mockDirectoryHandle, '/', '/root', mockUploadHandles)

  expect(mockFileSystemRpc.invocations).toEqual([['FileSystem.mkdir', '/root/folder1']])
  expect(mockUploadHandles).toHaveBeenCalledWith([mockChildHandle], '/', '/root/folder1')
})

test('uploadHandle with unsupported type', async () => {
  const mockFileSystemRpc = createMockFileSystemRpc()
  const mockHandle = {
    kind: 'unknown',
    name: 'unknown',
  } as unknown as FileSystemHandle

  const mockUploadHandles = jest.fn<(fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>>()

  const promise = UploadFileSystemHandle.uploadHandle(mockHandle, '/', '/root', mockUploadHandles)
  await expect(promise).rejects.toThrow('unsupported file system handle type unknown')
  expect(mockFileSystemRpc.invocations).toEqual([])
})
