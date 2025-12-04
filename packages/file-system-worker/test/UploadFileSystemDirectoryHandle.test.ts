import { beforeEach, expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import * as UploadFileSystemDirectoryHandle from '../src/parts/UploadFileSystemDirectoryHandle/UploadFileSystemDirectoryHandle.ts'

const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockRpc = MockRpc.create({
  commandMap: {},
  invoke: mockInvoke,
})
FileSystemProcess.set(mockRpc)

beforeEach(() => {
  jest.resetAllMocks()
})

test('uploadDirectory', async () => {
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

  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.mkdir') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })

  await UploadFileSystemDirectoryHandle.uploadDirectory(mockDirectoryHandle, '/', '/root', mockUploadHandles)

  expect(mockInvoke).toHaveBeenCalledWith('FileSystem.mkdir', '/root/folder1')
  expect(mockUploadHandles).toHaveBeenCalledWith([mockChildHandle], '/', '/root/folder1')
})
