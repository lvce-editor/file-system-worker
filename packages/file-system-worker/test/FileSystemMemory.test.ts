import { expect, test } from '@jest/globals'
import * as ApplicationFileSystem from '../src/parts/ApplicationFileSystem/ApplicationFileSystem.ts'
import * as Memory from '../src/parts/FileSystemMemory/FileSystemMemory.ts'

test('owns file contents, creates parents, reads blobs and survives reads', async () => {
  await Memory.writeFile('memfs:///workspace/left.svg', '<svg/>')
  expect(await Memory.readFile('memfs:///workspace/left.svg')).toBe('<svg/>')
  expect(await Memory.readDirWithFileTypes('memfs:///workspace')).toEqual([{ name: 'left.svg', type: 7 }])
  const blob = await Memory.readFileAsBlob('memfs:///workspace/left.svg')
  expect(blob.type).toBe('image/svg+xml')
  expect(await blob.text()).toBe('<svg/>')
  await Memory.remove('memfs:///workspace')
  await expect(Memory.readFile('memfs:///workspace/left.svg')).rejects.toThrow('File not found')
})

test('renames a directory tree, copies files and removes only the selected tree', async () => {
  await Memory.writeFile('memfs:///tree/child/file', 'hello')
  await Memory.writeFile('memfs:///tree-other/file', 'keep')
  await Memory.rename('memfs:///tree', 'memfs:///renamed')
  expect(await Memory.exists('memfs:///tree')).toBe(false)
  expect(await Memory.readFile('memfs:///renamed/child/file')).toBe('hello')
  await Memory.copy('memfs:///renamed/child/file', 'memfs:///copy')
  await Memory.remove('memfs:///renamed')
  expect(await Memory.readFile('memfs:///copy')).toBe('hello')
  expect(await Memory.readFile('memfs:///tree-other/file')).toBe('keep')
})

test('separate applications can use the same URI and dispose independently', async () => {
  const uri = 'memfs:///workspace/main.ts'
  await ApplicationFileSystem.execute('source', 'writeFile', uri, 'source text')
  await ApplicationFileSystem.execute('preview', 'writeFile', uri, 'preview text')
  expect(await ApplicationFileSystem.execute('source', 'readFile', uri)).toBe('source text')
  await ApplicationFileSystem.dispose('source')
  await expect(ApplicationFileSystem.execute('source', 'readFile', uri)).rejects.toThrow('File not found')
  expect(await ApplicationFileSystem.execute('preview', 'readFile', uri)).toBe('preview text')
  await ApplicationFileSystem.dispose('preview')
})

test('json, stat, directory and copy operations use the same storage', async () => {
  await Memory.mkdir('memfs:///operations')
  await Memory.createFile('memfs:///operations/empty')
  await Memory.writeFile('memfs:///operations/file.json', '{"value":42}')
  expect(await Memory.readJson('memfs:///operations/file.json')).toEqual({ value: 42 })
  expect(await Memory.stat('memfs:///operations')).toMatchObject({ exists: true, type: 3 })
  expect(await Memory.stat('memfs:///operations/empty')).toMatchObject({ exists: true, size: 0, type: 7 })
  expect(await Memory.getFolderSize('memfs:///operations')).toBe(12)
  await expect(Memory.rename('memfs:///operations', 'memfs:///operations/child')).rejects.toThrow('into itself')
  await Memory.remove('memfs:///operations')
  expect(await Memory.exists('memfs:///operations')).toBe(false)
})
