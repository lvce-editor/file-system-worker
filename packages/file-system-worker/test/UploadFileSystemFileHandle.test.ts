import { beforeEach, expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import * as UploadFileSystemFileHandle from '../src/parts/UploadFileSystemFileHandle/UploadFileSystemFileHandle.ts'

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
      'FileSystem.writeFile': async () => undefined,
    },
  })
  FileSystemProcess.set(mockFileSystemRpc)
  return mockFileSystemRpc
}

beforeEach(() => {
  jest.resetAllMocks()
})

test('uploadFile', async () => {
  const mockFileSystemRpc = createMockFileSystemRpc()
  const mockFile = new File(['file content'], 'file1.txt')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockFileHandle = {
    getFile: mockGetFile,
    kind: 'file',
    name: 'file1.txt',
  } as unknown as FileSystemFileHandle

  await UploadFileSystemFileHandle.uploadFile(mockFileHandle, '/', '/root')

  expect(mockFileSystemRpc.invocations).toEqual([['FileSystem.writeFile', '/root/file1.txt', 'file content']])
})
