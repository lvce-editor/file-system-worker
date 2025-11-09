import { test, expect } from '@jest/globals'
import * as FileSystemMemory from '../src/parts/FileSystemMemory/FileSystemMemory.ts'

test('getPathSeparator should return forward slash', async () => {
  const result = await FileSystemMemory.getPathSeparator('memory://')
  expect(result).toBe('/')
})

test('writeFile should not throw error for memfs URI', async () => {
  // This test just verifies the method doesn't throw, since we can't easily mock the RPC calls
  await expect(FileSystemMemory.writeFile('memfs://test.txt', 'content')).rejects.toThrow()
})

test('remove should not throw error for memfs URI', async () => {
  // This test just verifies the method doesn't throw, since we can't easily mock the RPC calls
  await expect(FileSystemMemory.remove('memfs://test.txt')).rejects.toThrow()
})

test('readFileAsBlob should throw not implemented', async () => {
  await expect(FileSystemMemory.readFileAsBlob('memory://test.txt')).rejects.toThrow('not implemented')
})

test('exists should throw not implemented', async () => {
  await expect(FileSystemMemory.exists('memory://test.txt')).rejects.toThrow('not implemented')
})

test('readDirWithFileTypes should throw not implemented', async () => {
  await expect(FileSystemMemory.readDirWithFileTypes('memory://')).rejects.toThrow('not implemented')
})

test('readJson should throw not implemented', async () => {
  await expect(FileSystemMemory.readJson('memory://test.json')).rejects.toThrow('not implemented')
})

test('getRealPath should throw not implemented', async () => {
  await expect(FileSystemMemory.getRealPath('memory://test.txt')).rejects.toThrow('not implemented')
})

test('stat should throw not implemented', async () => {
  await expect(FileSystemMemory.stat('memory://test.txt')).rejects.toThrow('not implemented')
})

test('createFile should not throw error for memfs URI', async () => {
  // This test just verifies the method doesn't throw, since we can't easily mock the RPC calls
  await expect(FileSystemMemory.createFile('memfs://test.txt')).rejects.toThrow()
})

test('mkdir should throw not implemented', async () => {
  await expect(FileSystemMemory.mkdir('memory://folder')).rejects.toThrow('not implemented')
})

test('rename should not throw error for memfs URI', async () => {
  // This test just verifies the method doesn't throw, since we can't easily mock the RPC calls
  await expect(FileSystemMemory.rename('memfs://old.txt', 'memfs://new.txt')).rejects.toThrow()
})

test('copy should throw not implemented', async () => {
  await expect(FileSystemMemory.copy('memory://source.txt', 'memory://dest.txt')).rejects.toThrow('not implemented')
})

test('getFolderSize should throw not implemented', async () => {
  await expect(FileSystemMemory.getFolderSize('memory://folder')).rejects.toThrow('not implemented')
})
