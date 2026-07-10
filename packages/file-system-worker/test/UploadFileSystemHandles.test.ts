import { expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import { setFactory } from '../src/parts/RendererProcess/RendererProcess.ts'
import * as UploadFileSystemHandles from '../src/parts/UploadFileSystemHandles/UploadFileSystemHandles.ts'

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
  const mockFileSystemRpc = createMockFileSystemRpcWithWrite()
  const mockFile = new File(['file content'], 'file1.txt')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockFileHandle = {
    getFile: mockGetFile,
    kind: 'file',
    name: 'file1.txt',
  } as unknown as FileSystemFileHandle

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [mockFileHandle])

  expect(result).toBe(false)
  expect(mockFileSystemRpc.invocations).toEqual([['FileSystem.writeFile', '/root/file1.txt', 'file content']])
})

test('uploadFileSystemHandles with multiple handles', async () => {
  const mockFileSystemRpc = createMockFileSystemRpc()
  const mockFile = new File(['file content'], 'file1.txt')
  const mockChildFile = new File(['child content'], 'file2.txt')

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
    yield mockChildHandle
  }
  const mockDirectoryHandle = {
    kind: 'directory',
    name: 'folder1',
    values: jest.fn().mockReturnValue(mockValues()),
  } as unknown as FileSystemDirectoryHandle

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [mockFileHandle, mockDirectoryHandle])

  expect(result).toBe(false)
  expect(mockFileSystemRpc.invocations).toEqual([
    ['FileSystem.writeFile', '/root/file1.txt', 'file content'],
    ['FileSystem.mkdir', '/root/folder1'],
    ['FileSystem.writeFile', '/root/folder1/file2.txt', 'child content'],
  ])
})

test('uploadFileSystemHandles with empty array', async () => {
  const mockFileSystemRpc = createMockFileSystemRpcWithNoCalls()
  const rpc = createMockRpc({
    commandMap: {},
  })
  setFactory(async () => rpc)

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [])

  expect(result).toBe(false)
  expect(mockFileSystemRpc.invocations).toEqual([])
  expect(rpc.invocations).toEqual([])
})

const createMockFileSystemRpcWithWrite = (): ReturnType<typeof createMockRpc> => {
  const mockFileSystemRpc = createMockRpc({
    commandMap: {
      'FileSystem.writeFile': async () => undefined,
    },
  })
  FileSystemProcess.set(mockFileSystemRpc)
  return mockFileSystemRpc
}

const createMockFileSystemRpcWithNoCalls = (): ReturnType<typeof createMockRpc> => {
  const mockFileSystemRpc = createMockFileSystemRpcWithWrite()
  FileSystemProcess.set(mockFileSystemRpc)
  return mockFileSystemRpc
}
