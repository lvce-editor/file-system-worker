/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { beforeEach, expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
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

let mockFileSystemRpc: ReturnType<typeof createMockRpc>
let mockRendererRpc: ReturnType<typeof createMockRpc>

beforeEach(() => {
  mockFileSystemRpc = createMockRpc({
    commandMap: {
      'FileSystem.mkdir': async () => undefined,
      'FileSystem.writeFile': async () => undefined,
    },
  })
  mockRendererRpc = createMockRpc({
    commandMap: {
      'Blob.blobToBinaryString': async () => 'file content',
    },
  })
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

  const mockUploadHandles = jest.fn<(fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>>()

  await UploadFileSystemHandle.uploadHandle(mockFileHandle, '/', '/root', mockUploadHandles)

  expect(mockRendererRpc.invocations).toEqual([['Blob.blobToBinaryString', mockFile]])
  expect(mockFileSystemRpc.invocations).toEqual([['FileSystem.writeFile', '/root/file1.txt', 'file content']])
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

  const mockUploadHandles = jest.fn<(fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>>()

  await UploadFileSystemHandle.uploadHandle(mockDirectoryHandle, '/', '/root', mockUploadHandles)

  expect(mockFileSystemRpc.invocations).toEqual([['FileSystem.mkdir', '/root/folder1']])
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
