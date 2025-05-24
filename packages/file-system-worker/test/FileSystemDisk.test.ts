import { beforeEach, expect, jest, test } from '@jest/globals'
import { MockRpc } from '@lvce-editor/rpc'
import * as FileSystemDisk from '../src/parts/FileSystemDisk/FileSystemDisk.js'
import * as FileSystemProcess from '../src/parts/FileSystemProcess/FileSystemProcess.js'

const mockInvoke = jest.fn<(method: string, ...args: unknown[]) => Promise<unknown>>()
const mockRpc = MockRpc.create({
  commandMap: {},
  invoke: mockInvoke,
})
FileSystemProcess.set(mockRpc)

beforeEach(() => {
  jest.resetAllMocks()
})

test('remove', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.remove') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.remove('/test/path')
})

test('readFile', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.readFile') {
      return Promise.resolve('file content')
    }
    throw new Error(`unexpected method ${method}`)
  })
  const content = await FileSystemDisk.readFile('/test/path')
  expect(content).toBe('file content')
})

test('readDirWithFileTypes', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.readDirWithFileTypes') {
      return Promise.resolve([{ name: 'file1' }, { name: 'file2' }])
    }
    throw new Error(`unexpected method ${method}`)
  })
  const files = await FileSystemDisk.readDirWithFileTypes('/test/path')
  expect(files).toEqual([{ name: 'file1' }, { name: 'file2' }])
})

test('getPathSeparator', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.getPathSeparator') {
      return Promise.resolve('/')
    }
    throw new Error(`unexpected method ${method}`)
  })
  const separator = await FileSystemDisk.getPathSeparator('/test/path')
  expect(separator).toBe('/')
})

test('readJson', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.readJson') {
      return Promise.resolve({ key: 'value' })
    }
    throw new Error(`unexpected method ${method}`)
  })
  const json = await FileSystemDisk.readJson('/test/path')
  expect(json).toEqual({ key: 'value' })
})

test('getRealPath', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.getRealPath') {
      return Promise.resolve('/real/path')
    }
    throw new Error(`unexpected method ${method}`)
  })
  const path = await FileSystemDisk.getRealPath('/test/path')
  expect(path).toBe('/real/path')
})

test('stat', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.stat') {
      return Promise.resolve({ size: 100 })
    }
    throw new Error(`unexpected method ${method}`)
  })
  const stats = await FileSystemDisk.stat('/test/path')
  expect(stats).toEqual({ size: 100 })
})

test('createFile', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.writeFile') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.createFile('/test/path')
})

test('writeFile', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.writeFile') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.writeFile('/test/path', 'content')
})

test('mkdir', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.mkdir') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.mkdir('/test/path')
})

test('rename', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.rename') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.rename('/old/path', '/new/path')
})

test('copy', async () => {
  mockInvoke.mockImplementation((method: string) => {
    if (method === 'FileSystem.copy') {
      return Promise.resolve()
    }
    throw new Error(`unexpected method ${method}`)
  })
  await FileSystemDisk.copy('/old/path', '/new/path')
})
