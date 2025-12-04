import { beforeEach, expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import * as RendererProcess from '../src/parts/RendererProcess/RendererProcess.ts'
import * as UploadFileSystemHandle from '../src/parts/UploadFileSystemHandle/UploadFileSystemHandle.ts'

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

test('uploadHandle with file', async () => {
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

  const mockUploadHandles = jest.fn<(fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>>()

  await UploadFileSystemHandle.uploadHandle(mockFileHandle, '/', '/root', mockUploadHandles)

  expect(mockFileSystemInvoke).toHaveBeenCalledWith('FileSystem.writeFile', '/root/file1.txt', 'file content')
})

test('uploadHandle with directory', async () => {
  const mockChildHandle = { name: 'file1', kind: 'file' } as FileSystemHandle
  const mockValues = async function* (): AsyncGenerator<FileSystemHandle, void, unknown> {
    yield mockChildHandle
  }
  const mockDirectoryHandle = {
    name: 'folder1',
    kind: 'directory',
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
    name: 'unknown',
    kind: 'unknown',
  } as unknown as FileSystemHandle

  const mockUploadHandles = jest.fn<(fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>>()

  await expect(UploadFileSystemHandle.uploadHandle(mockHandle, '/', '/root', mockUploadHandles)).rejects.toThrow(
    'unsupported file system handle type unknown',
  )
})
