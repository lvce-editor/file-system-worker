import { expect, jest, test } from '@jest/globals'
import * as FileSystemFetch from '../src/parts/FileSystemFetch/FileSystemFetch.ts'

const fetchMock = jest.fn()

Object.defineProperty(globalThis, 'fetch', {
  configurable: true,
  value: fetchMock,
})

test('readFile should fetch and return text content', async () => {
  // @ts-ignore
  const mockText = jest.fn().mockResolvedValue('file content') as any
  const mockResponse = {
    ok: true,
    text: mockText,
  } as any
  // @ts-ignore
  fetchMock.mockResolvedValue(mockResponse)

  const result = await FileSystemFetch.readFile('https://example.com/file.txt')

  expect(fetchMock).toHaveBeenCalledWith('https://example.com/file.txt')
  expect(result).toBe('file content')
})

test('readFile should throw error when response is not ok', async () => {
  const mockResponse = {
    ok: false,
    statusText: 'Not Found',
  } as any
  // @ts-ignore
  fetchMock.mockResolvedValue(mockResponse)

  await expect(FileSystemFetch.readFile('https://example.com/notfound.txt')).rejects.toThrow('Not Found')
})

test('readFileAsBlob should fetch and return blob content', async () => {
  const mockBlob = new Blob(['blob content'])
  // @ts-ignore
  const mockBlobFn = jest.fn().mockResolvedValue(mockBlob) as any
  const mockResponse = {
    blob: mockBlobFn,
    ok: true,
  } as any
  // @ts-ignore
  fetchMock.mockResolvedValue(mockResponse)

  const result = await FileSystemFetch.readFileAsBlob('https://example.com/file.bin')

  expect(fetchMock).toHaveBeenCalledWith('https://example.com/file.bin')
  expect(result).toBe(mockBlob)
})

test('readFileAsBlob should throw error when response is not ok', async () => {
  const mockResponse = {
    ok: false,
    statusText: 'Server Error',
  } as any
  // @ts-ignore
  fetchMock.mockResolvedValue(mockResponse)

  await expect(FileSystemFetch.readFileAsBlob('https://example.com/error.bin')).rejects.toThrow('Server Error')
})

test('exists should return true for successful response', async () => {
  const mockResponse = {
    ok: true,
  } as any
  // @ts-ignore
  fetchMock.mockResolvedValue(mockResponse)

  const result = await FileSystemFetch.exists('https://example.com/exists.txt')

  expect(result).toBe(true)
})

test('exists should return false for failed response', async () => {
  const mockResponse = {
    ok: false,
  } as any
  // @ts-ignore
  fetchMock.mockResolvedValue(mockResponse)

  const result = await FileSystemFetch.exists('https://example.com/notfound.txt')

  expect(result).toBe(false)
})

test('getPathSeparator should return forward slash', async () => {
  const result = await FileSystemFetch.getPathSeparator('https://example.com/')
  expect(result).toBe('/')
})

test('readJson should fetch and return JSON content', async () => {
  const mockJson = { key: 'value' }
  // @ts-ignore
  const mockJsonFn = jest.fn().mockResolvedValue(mockJson) as any
  const mockResponse = {
    json: mockJsonFn,
    ok: true,
  } as any
  // @ts-ignore
  fetchMock.mockResolvedValue(mockResponse)

  const result = await FileSystemFetch.readJson('https://example.com/data.json')

  expect(fetchMock).toHaveBeenCalledWith('https://example.com/data.json')
  expect(result).toEqual(mockJson)
})

test('readJson should throw error when response is not ok', async () => {
  const mockResponse = {
    ok: false,
    statusText: 'Bad Request',
  } as any
  // @ts-ignore
  fetchMock.mockResolvedValue(mockResponse)

  await expect(FileSystemFetch.readJson('https://example.com/invalid.json')).rejects.toThrow('Bad Request')
})

test('remove should throw not implemented', async () => {
  await expect(FileSystemFetch.remove('https://example.com/file.txt')).rejects.toThrow('not implemented')
})

test('readDirWithFileTypes should throw not implemented', async () => {
  await expect(FileSystemFetch.readDirWithFileTypes('https://example.com/')).rejects.toThrow('not implemented')
})

test('getRealPath should throw not implemented', async () => {
  await expect(FileSystemFetch.getRealPath('https://example.com/file.txt')).rejects.toThrow('not implemented')
})

test('stat should throw not implemented', async () => {
  await expect(FileSystemFetch.stat('https://example.com/file.txt')).rejects.toThrow('not implemented')
})

test('createFile should throw not implemented', async () => {
  await expect(FileSystemFetch.createFile('https://example.com/file.txt')).rejects.toThrow('not implemented')
})

test('writeFile should throw not implemented', async () => {
  await expect(FileSystemFetch.writeFile('https://example.com/file.txt', 'content')).rejects.toThrow('not implemented')
})

test('mkdir should throw not implemented', async () => {
  await expect(FileSystemFetch.mkdir('https://example.com/folder')).rejects.toThrow('not implemented')
})

test('rename should throw not implemented', async () => {
  await expect(FileSystemFetch.rename('https://example.com/old.txt', 'https://example.com/new.txt')).rejects.toThrow('not implemented')
})

test('copy should throw not implemented', async () => {
  await expect(FileSystemFetch.copy('https://example.com/source.txt', 'https://example.com/dest.txt')).rejects.toThrow('not implemented')
})

test('getFolderSize should throw not implemented', async () => {
  await expect(FileSystemFetch.getFolderSize('https://example.com/folder')).rejects.toThrow('not implemented')
})
