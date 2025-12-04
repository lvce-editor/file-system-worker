import { expect, jest, test, beforeEach } from '@jest/globals'

beforeEach(() => {
  jest.resetModules()
})

test('uploadFileSystemHandles with single directory', async () => {
  const RendererProcess = await import('../src/parts/RendererProcess/RendererProcess.ts')
  const UploadFileSystemHandles = await import('../src/parts/UploadFileSystemHandles/UploadFileSystemHandles.ts')

  const mockRendererInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
  RendererProcess.set({
    invoke: mockRendererInvoke,
  } as any)

  mockRendererInvoke.mockImplementation(async (method: string) => {
    if (method === 'PersistentFileHandle.addHandle') {
      return
    }
    if (method === 'Workspace.setPath') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })

  const mockDirectoryHandle = {
    name: 'folder1',
    kind: 'directory',
  } as FileSystemDirectoryHandle

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [mockDirectoryHandle])

  expect(result).toBe(true)
  expect(mockRendererInvoke).toHaveBeenCalledWith('PersistentFileHandle.addHandle', '/folder1', mockDirectoryHandle)
  expect(mockRendererInvoke).toHaveBeenCalledWith('Workspace.setPath', 'html:///folder1')
})

test('uploadFileSystemHandles with single file', async () => {
  const FileSystemProcess = await import('../src/parts/FileSystemProcess/FileSystemProcess.ts')
  const RendererProcess = await import('../src/parts/RendererProcess/RendererProcess.ts')
  const UploadFileSystemHandles = await import('../src/parts/UploadFileSystemHandles/UploadFileSystemHandles.ts')

  const mockFileSystemInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
  FileSystemProcess.set({
    invoke: mockFileSystemInvoke,
  } as any)

  const mockRendererInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
  RendererProcess.set({
    invoke: mockRendererInvoke,
  } as any)

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

  const mockFile = new File(['file content'], 'file1.txt')
  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockFileHandle = {
    name: 'file1.txt',
    kind: 'file',
    getFile: mockGetFile,
  } as unknown as FileSystemFileHandle

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [mockFileHandle])

  expect(result).toBe(false)
  expect(mockFileSystemInvoke).toHaveBeenCalledWith('FileSystem.writeFile', '/root/file1.txt', 'file content')
})

test('uploadFileSystemHandles with multiple handles', async () => {
  const FileSystemProcess = await import('../src/parts/FileSystemProcess/FileSystemProcess.ts')
  const RendererProcess = await import('../src/parts/RendererProcess/RendererProcess.ts')
  const UploadFileSystemHandles = await import('../src/parts/UploadFileSystemHandles/UploadFileSystemHandles.ts')

  const mockFile = new File(['file content'], 'file1.txt')
  const mockChildFile = new File(['child content'], 'file2.txt')

  const mockFileSystemInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
  FileSystemProcess.set({
    invoke: mockFileSystemInvoke,
  } as any)

  const mockRendererInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
  RendererProcess.set({
    invoke: mockRendererInvoke,
  } as any)

  mockFileSystemInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.writeFile') {
      return
    }
    if (method === 'FileSystem.mkdir') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })

  mockRendererInvoke.mockImplementation(async (method: string, ...args: readonly unknown[]) => {
    if (method === 'Blob.blobToBinaryString') {
      const file = args[0] as File | undefined
      if (file === mockFile) {
        return 'file content'
      }
      if (file === mockChildFile) {
        return 'child content'
      }
      return 'content'
    }
    throw new Error(`unexpected method ${method}`)
  })

  const mockGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockFile)
  const mockFileHandle = {
    name: 'file1.txt',
    kind: 'file',
    getFile: mockGetFile,
  } as unknown as FileSystemFileHandle
  const mockChildGetFile = jest.fn<() => Promise<File>>().mockResolvedValue(mockChildFile)
  const mockChildHandle = {
    name: 'file2.txt',
    kind: 'file',
    getFile: mockChildGetFile,
  } as unknown as FileSystemFileHandle
  const mockValues = async function* (): AsyncGenerator<FileSystemHandle, void, unknown> {
    yield mockChildHandle as FileSystemHandle
  }
  const mockDirectoryHandle = {
    name: 'folder1',
    kind: 'directory',
    values: jest.fn().mockReturnValue(mockValues()),
  } as unknown as FileSystemDirectoryHandle

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [mockFileHandle, mockDirectoryHandle])

  expect(result).toBe(false)
  expect(mockFileSystemInvoke).toHaveBeenCalledWith('FileSystem.writeFile', '/root/file1.txt', 'file content')
  expect(mockFileSystemInvoke).toHaveBeenCalledWith('FileSystem.mkdir', '/root/folder1')
})

test('uploadFileSystemHandles with empty array', async () => {
  const FileSystemProcess = await import('../src/parts/FileSystemProcess/FileSystemProcess.ts')
  const RendererProcess = await import('../src/parts/RendererProcess/RendererProcess.ts')
  const UploadFileSystemHandles = await import('../src/parts/UploadFileSystemHandles/UploadFileSystemHandles.ts')

  const mockFileSystemInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
  FileSystemProcess.set({
    invoke: mockFileSystemInvoke,
  } as any)

  const mockRendererInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
  RendererProcess.set({
    invoke: mockRendererInvoke,
  } as any)

  const result = await UploadFileSystemHandles.uploadFileSystemHandles('/root', '/', [])

  expect(result).toBe(false)
  expect(mockFileSystemInvoke).not.toHaveBeenCalled()
  expect(mockRendererInvoke).not.toHaveBeenCalled()
})
