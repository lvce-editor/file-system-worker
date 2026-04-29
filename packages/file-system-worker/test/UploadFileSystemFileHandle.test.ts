import { beforeEach, expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import { setFactory } from '../src/parts/RendererProcess/RendererProcess.ts'
import * as UploadFileSystemFileHandle from '../src/parts/UploadFileSystemFileHandle/UploadFileSystemFileHandle.ts'

let mockFileSystemRpc: ReturnType<typeof createMockRpc>
let mockRendererRpc: ReturnType<typeof createMockRpc>

beforeEach(() => {
  mockFileSystemRpc = createMockRpc({
    commandMap: {
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

test('uploadFile', async () => {
  const mockFile = new File(['file content'], 'file1.txt')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockFileHandle = {
    getFile: mockGetFile,
    kind: 'file',
    name: 'file1.txt',
  } as unknown as FileSystemFileHandle

  await UploadFileSystemFileHandle.uploadFile(mockFileHandle, '/', '/root')

  expect(mockRendererRpc.invocations).toEqual([['Blob.blobToBinaryString', mockFile]])
  expect(mockFileSystemRpc.invocations).toEqual([['FileSystem.writeFile', '/root/file1.txt', 'file content']])
})
