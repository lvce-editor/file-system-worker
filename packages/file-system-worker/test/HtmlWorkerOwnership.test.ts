import { beforeEach, expect, jest, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { HtmlHandle } from '../src/parts/HtmlHandle/HtmlHandle.ts'

const stored = new Map<string, HtmlHandle>()
const getHandle = jest.fn<(uri: string) => Promise<HtmlHandle | undefined>>(async (uri) => stored.get(uri))
const addHandle = jest.fn<(uri: string, handle: Readonly<HtmlHandle>) => Promise<void>>(async (uri, handle) => {
  stored.set(uri, handle)
})
jest.unstable_mockModule('../src/parts/HandleStorage/HandleStorage.ts', () => ({ addHandle, getHandle }))
const { commandMap } = await import('../src/parts/CommandMap/CommandMap.ts')
const PersistentFileHandle = await import('../src/parts/PersistentFileHandle/PersistentFileHandle.ts')

beforeEach(() => {
  jest.clearAllMocks()
  stored.clear()
})

test.each(['/legacy-leading', 'legacy-bare'])('restores legacy key %s and migrates the canonical key', async (legacyKey) => {
  const handle = { kind: 'directory', name: legacyKey.replace('/', '') } as FileSystemDirectoryHandle
  const uri = `html:///${handle.name}`
  stored.set(legacyKey, handle)
  expect(await PersistentFileHandle.getHandle(uri)).toBe(handle)
  expect(stored.get(uri)).toBe(handle)
  expect(addHandle).toHaveBeenCalledWith(uri, handle)
})

test('HTML commands keep handle lookup, file search, text search and binary IO in this worker', async () => {
  const renderer = createMockRpc({ commandMap: {} })
  RendererWorker.set(renderer)
  const file = new File(['a Needle in text'], 'file.txt')
  const write = jest.fn()
  const close = jest.fn()
  const fileHandle = { createWritable: async () => ({ close, write }), getFile: async () => file, kind: 'file', name: 'file.txt' } as unknown as FileSystemFileHandle
  const removeEntry = jest.fn()
  const root = {
    getFileHandle: async () => fileHandle,
    kind: 'directory',
    name: 'ownership',
    removeEntry,
    async *values() {
      yield fileHandle
    },
  } as unknown as FileSystemDirectoryHandle
  await commandMap['PersistentFileHandle.addHandle']('html:///ownership', root)
  expect(await commandMap['FileSystem.readDirWithFileTypes']('html:///ownership')).toEqual([{ name: 'file.txt', type: 7 }])
  expect(await commandMap['FileSystem.readFile']('html:///ownership/file.txt')).toBe('a Needle in text')
  expect(await commandMap['FileSystem.exists']('html:///ownership')).toBe(true)
  expect(await commandMap['FileSystemHtml.fileSearch']('html:///ownership')).toEqual(['file.txt'])
  expect(await commandMap['FileSystemHtml.textSearch']('html:///ownership', 'needle')).toEqual([
    { end: 0, lineNumber: 0, start: 0, text: 'file.txt', type: 1 },
    { end: 8, lineNumber: 0, start: 2, text: 'a Needle in text', type: 2 },
  ])
  expect(await commandMap['FileSystemHtml.textSearch']('html:///ownership', 'needle', { flags: 16 })).toEqual([])
  const blob = new Blob([new Uint8Array([0, 255, 42])])
  await commandMap['FileSystem.writeBlob']('html:///ownership/new.bin', blob)
  expect(write).toHaveBeenCalledWith(blob)
  expect(close).toHaveBeenCalledTimes(1)
  expect(await commandMap['FileSystem.readFileAsBlob']('html:///ownership/file.txt')).toBe(file)
  await commandMap['FileSystem.remove']('html:///ownership/file.txt')
  expect(removeEntry).toHaveBeenCalledWith('file.txt')
  expect(renderer.invocations).toEqual([])
})

test('nested mkdir resolves existing parents and creates missing parents', async () => {
  const getDirectoryHandle = jest.fn<(name: string, options?: Readonly<FileSystemGetDirectoryOptions>) => Promise<FileSystemDirectoryHandle>>()
  const root = { getDirectoryHandle, kind: 'directory', name: 'mkdir' } as unknown as FileSystemDirectoryHandle
  const existing = { getDirectoryHandle, kind: 'directory', name: 'existing' } as unknown as FileSystemDirectoryHandle
  const created = { getDirectoryHandle, kind: 'directory', name: 'created' } as unknown as FileSystemDirectoryHandle
  getDirectoryHandle.mockImplementation(async (name, options) => {
    if (name === 'existing') return existing
    if (options?.create) return created
    throw new DOMException('missing', 'NotFoundError')
  })
  await PersistentFileHandle.addHandle('html:///mkdir', root)
  await commandMap['FileSystem.mkdir']('html:///mkdir/existing/missing/nested')
  expect(getDirectoryHandle).toHaveBeenCalledWith('existing')
  expect(getDirectoryHandle).toHaveBeenCalledWith('missing', { create: true })
  expect(getDirectoryHandle).toHaveBeenCalledWith('nested', { create: true })
  expect(await PersistentFileHandle.getHandle('html:///mkdir/existing/missing/nested')).toBe(created)
})
