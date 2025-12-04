import { beforeEach, expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import * as RendererProcess from '../src/parts/RendererProcess/RendererProcess.ts'
import * as UploadFileSystemFileHandle from '../src/parts/UploadFileSystemFileHandle/UploadFileSystemFileHandle.ts'

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
  RendererProcess.set(mockRendererRpc)
})

test('uploadFile', async () => {
  const mockFile = new File(['file content'], 'file1.txt')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockFileHandle = {
    name: 'file1.txt',
    kind: 'file',
    getFile: mockGetFile,
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

  await UploadFileSystemFileHandle.uploadFile(mockFileHandle, '/', '/root')

  expect(mockRendererInvoke).toHaveBeenCalledWith('Blob.blobToBinaryString', mockFile)
  expect(mockFileSystemInvoke).toHaveBeenCalledWith('FileSystem.writeFile', '/root/file1.txt', 'file content')
})
