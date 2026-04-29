/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import { setFactory } from '../src/parts/RendererProcess/RendererProcess.ts'
import * as UploadFileSystemHandles from '../src/parts/UploadFileSystemHandles/UploadFileSystemHandles.ts'

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

test('uploadFileSystemHandles with single directory', async () => {
  const rpc = createMockRpc({
    commandMap: {
      'PersistentFileHandle.addHandle': async () => undefined,
      'Workspace.setPath': async () => undefined,
    },
  })
  setFactory(async () => rpc)

  const mockDirectoryHandle = {
    kind: 'directory',
    name: 'folder1',
  } as FileSystemDirectoryHandle

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [mockDirectoryHandle])

  expect(result).toBe(true)
  expect(rpc.invocations).toEqual([
    ['PersistentFileHandle.addHandle', '/folder1', mockDirectoryHandle],
    ['Workspace.setPath', 'html:///folder1'],
  ])
})

test('uploadFileSystemHandles with single file', async () => {
  const mockFileSystemRpc = createMockRpc({
    commandMap: {
      'FileSystem.writeFile': async () => undefined,
    },
  })
  FileSystemProcess.set(mockFileSystemRpc)

  const rpc = createMockRpc({
    commandMap: {
      'Blob.blobToBinaryString': async () => 'file content',
    },
  })
  setFactory(async () => rpc)

  const mockFile = new File(['file content'], 'file1.txt')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockFileHandle = {
    getFile: mockGetFile,
    kind: 'file',
    name: 'file1.txt',
  } as unknown as FileSystemFileHandle

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [mockFileHandle])

  expect(result).toBe(false)
  expect(rpc.invocations).toEqual([['Blob.blobToBinaryString', mockFile]])
  expect(mockFileSystemRpc.invocations).toEqual([['FileSystem.writeFile', '/root/file1.txt', 'file content']])
})

test('uploadFileSystemHandles with multiple handles', async () => {
  const mockFile = new File(['file content'], 'file1.txt')
  const mockChildFile = new File(['child content'], 'file2.txt')

  const mockFileSystemRpc = createMockRpc({
    commandMap: {
      'FileSystem.mkdir': async () => undefined,
      'FileSystem.writeFile': async () => undefined,
    },
  })
  FileSystemProcess.set(mockFileSystemRpc)

  const rpc = createMockRpc({
    commandMap: {
      'Blob.blobToBinaryString': async (file: File) => {
        if (file === mockFile) {
          return 'file content'
        }
        if (file === mockChildFile) {
          return 'child content'
        }
        return 'content'
      },
    },
  })
  setFactory(async () => rpc)

  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockFileHandle = {
    getFile: mockGetFile,
    kind: 'file',
    name: 'file1.txt',
  } as unknown as FileSystemFileHandle
  const mockChildGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockChildFile)
  const mockChildHandle = {
    getFile: mockChildGetFile,
    kind: 'file',
    name: 'file2.txt',
  } as unknown as FileSystemFileHandle
  const mockValues = async function* (): AsyncGenerator<FileSystemHandle, void, unknown> {
    yield mockChildHandle as FileSystemHandle
  }
  const mockDirectoryHandle = {
    kind: 'directory',
    name: 'folder1',
    values: jest.fn().mockReturnValue(mockValues()),
  } as unknown as FileSystemDirectoryHandle

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [mockFileHandle, mockDirectoryHandle])

  expect(result).toBe(false)
  expect(rpc.invocations).toEqual([
    ['Blob.blobToBinaryString', mockFile],
    ['Blob.blobToBinaryString', mockChildFile],
  ])
  expect(mockFileSystemRpc.invocations).toEqual([
    ['FileSystem.writeFile', '/root/file1.txt', 'file content'],
    ['FileSystem.mkdir', '/root/folder1'],
    ['FileSystem.writeFile', '/root/folder1/file2.txt', 'child content'],
  ])
})

test('uploadFileSystemHandles with empty array', async () => {
  const mockFileSystemRpc = createMockRpc({
    commandMap: {},
  })
  FileSystemProcess.set(mockFileSystemRpc)

  const rpc = createMockRpc({
    commandMap: {},
  })
  setFactory(async () => rpc)

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [])

  expect(result).toBe(false)
  expect(mockFileSystemRpc.invocations).toEqual([])
  expect(rpc.invocations).toEqual([])
})
