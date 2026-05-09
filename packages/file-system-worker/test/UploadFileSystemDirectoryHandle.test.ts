import { beforeEach, expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.ts'
import * as UploadFileSystemDirectoryHandle from '../src/parts/UploadFileSystemDirectoryHandle/UploadFileSystemDirectoryHandle.ts'

let mockRpc: ReturnType<typeof createMockRpc>

beforeEach(() => {
  mockRpc = createMockRpc({
    commandMap: {
      'FileSystem.mkdir': async () => undefined,
    },
  })
  FileSystemProcess.set(mockRpc)
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

  await UploadFileSystemDirectoryHandle.uploadDirectory(mockDirectoryHandle, '/', '/root', mockUploadHandles)

  expect(mockRpc.invocations).toEqual([['FileSystem.mkdir', '/root/folder1']])
  expect(mockUploadHandles).toHaveBeenCalledWith([mockChildHandle], '/', '/root/folder1')
})
