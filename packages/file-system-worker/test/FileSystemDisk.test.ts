import { beforeEach, expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import { ExtensionHost } from '@lvce-editor/rpc-registry'
import * as FileSystemDisk from '../src/parts/FileSystemDisk/FileSystemDisk.js'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.js'

const mockInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()
const mockExtensionHostInvoke = jest.fn<(method: string, ...args: readonly unknown[]) => Promise<unknown>>()

const createMockFileSystemRpcs = (): {
  mockRpc: ReturnType<typeof createMockRpc>
  mockExtensionHostRpc: ReturnType<typeof createMockRpc>
} => {
  const mockRpc = createMockRpc({
    commandMap: {
      'FileSystem.copy': async (oldUri: string, newUri: string) => mockInvoke('FileSystem.copy', oldUri, newUri),
      'FileSystem.getPathSeparator': async (root: string) => mockInvoke('FileSystem.getPathSeparator', root),
      'FileSystem.getRealPath': async (path: string) => mockInvoke('FileSystem.getRealPath', path),
      'FileSystem.mkdir': async (uri: string) => mockInvoke('FileSystem.mkdir', uri),
      'FileSystem.readDirWithFileTypes': async (uri: string) => mockInvoke('FileSystem.readDirWithFileTypes', uri),
      'FileSystem.readFile': async (uri: string) => mockInvoke('FileSystem.readFile', uri),
      'FileSystem.readJson': async (uri: string) => mockInvoke('FileSystem.readJson', uri),
      'FileSystem.remove': async (uri: string) => mockInvoke('FileSystem.remove', uri),
      'FileSystem.rename': async (oldUri: string, newUri: string) => mockInvoke('FileSystem.rename', oldUri, newUri),
      'FileSystem.stat': async (uri: string) => mockInvoke('FileSystem.stat', uri),
      'FileSystem.writeBuffer': async (uri: string, bytes: Uint8Array) => mockInvoke('FileSystem.writeBuffer', uri, bytes),
      'FileSystem.writeFile': async (uri: string, content: string) => mockInvoke('FileSystem.writeFile', uri, content),
    },
  })
  const mockExtensionHostRpc = createMockRpc({
    commandMap: {
      'FileSystemMemory.readFile': async (uri: string) => mockExtensionHostInvoke('FileSystemMemory.readFile', uri),
    },
  })
  FileSystemProcess.set(mockRpc)
  ExtensionHost.set(mockExtensionHostRpc)
  return { mockExtensionHostRpc, mockRpc }
}

beforeEach(() => {
  jest.resetAllMocks()
  mockInvoke.mockReset()
  mockExtensionHostInvoke.mockReset()
})

test('remove', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.remove') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.remove('/test/path')
  expect(mockRpc.invocations).toEqual([['FileSystem.remove', '/test/path']])
})

test('readFile', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.readFile') {
      return 'file content'
    }
    throw new Error(`unexpected method ${method}`)
  })
  const content = await FileSystemDisk.readFile('/test/path')
  expect(content).toBe('file content')
  expect(mockRpc.invocations).toEqual([['FileSystem.readFile', '/test/path']])
})

test('readDirWithFileTypes', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.readDirWithFileTypes') {
      return [{ name: 'file1' }, { name: 'file2' }]
    }
    throw new Error(`unexpected method ${method}`)
  })
  const files = await FileSystemDisk.readDirWithFileTypes('/test/path')
  expect(files).toEqual([{ name: 'file1' }, { name: 'file2' }])
  expect(mockRpc.invocations).toEqual([['FileSystem.readDirWithFileTypes', '/test/path']])
})

test('getPathSeparator', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.getPathSeparator') {
      return '/'
    }
    throw new Error(`unexpected method ${method}`)
  })
  const separator = await FileSystemDisk.getPathSeparator('/test/path')
  expect(separator).toBe('/')
  expect(mockRpc.invocations).toEqual([['FileSystem.getPathSeparator', '/test/path']])
})

test('readJson', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.readJson') {
      return { key: 'value' }
    }
    throw new Error(`unexpected method ${method}`)
  })
  const json = await FileSystemDisk.readJson('/test/path')
  expect(json).toEqual({ key: 'value' })
  expect(mockRpc.invocations).toEqual([['FileSystem.readJson', '/test/path']])
})

test('getRealPath', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.getRealPath') {
      return '/real/path'
    }
    throw new Error(`unexpected method ${method}`)
  })
  const path = await FileSystemDisk.getRealPath('/test/path')
  expect(path).toBe('/real/path')
  expect(mockRpc.invocations).toEqual([['FileSystem.getRealPath', '/test/path']])
})

test('stat', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.stat') {
      return { size: 100 }
    }
    throw new Error(`unexpected method ${method}`)
  })
  const stats = await FileSystemDisk.stat('/test/path')
  expect(stats).toEqual({ size: 100 })
  expect(mockRpc.invocations).toEqual([['FileSystem.stat', '/test/path']])
})

test('createFile', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.writeFile') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.createFile('/test/path')
  expect(mockRpc.invocations).toEqual([['FileSystem.writeFile', '/test/path', '']])
})

test('writeFile', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.writeFile') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.writeFile('/test/path', 'content')
  expect(mockRpc.invocations).toEqual([['FileSystem.writeFile', '/test/path', 'content']])
})

test('writeBlob', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  const blob = new Blob(['abc'])
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.writeBuffer') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.writeBlob('file:///test/path', blob)
  expect(mockRpc.invocations).toEqual([['FileSystem.writeBuffer', 'file:///test/path', new Uint8Array([97, 98, 99])]])
})

test('readFileAsBlob routes memfs uri to FileSystemMemory', async () => {
  const { mockExtensionHostRpc } = createMockFileSystemRpcs()
  mockExtensionHostInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystemMemory.readFile') {
      return '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
    }
    throw new Error(`unexpected method ${method}`)
  })

  const blob = await FileSystemDisk.readFileAsBlob('memfs:///workspace/left.svg')

  expect(blob.type).toBe('image/svg+xml')
  await expect(blob.text()).resolves.toBe('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
  expect(mockExtensionHostRpc.invocations).toEqual([['FileSystemMemory.readFile', 'memfs:///workspace/left.svg']])
})

test('mkdir', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.mkdir') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.mkdir('/test/path')
  expect(mockRpc.invocations).toEqual([['FileSystem.mkdir', '/test/path']])
})

test('rename', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.rename') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.rename('/old/path', '/new/path')
  expect(mockRpc.invocations).toEqual([['FileSystem.rename', '/old/path', '/new/path']])
})

test('copy', async () => {
  const { mockRpc } = createMockFileSystemRpcs()
  mockInvoke.mockImplementation(async (method: string) => {
    if (method === 'FileSystem.copy') {
      return
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.copy('/old/path', '/new/path')
  expect(mockRpc.invocations).toEqual([['FileSystem.copy', '/old/path', '/new/path']])
})
