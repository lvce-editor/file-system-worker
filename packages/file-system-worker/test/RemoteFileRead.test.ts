import { expect, test } from '@jest/globals'
import { createMockRpc } from '@lvce-editor/rpc'
import { FileSystemProcess, RendererWorker } from '@lvce-editor/rpc-registry'
import * as FileSystemDisk from '../src/parts/FileSystemDisk/FileSystemDisk.js'

test('reads an SSH workspace through the renderer provider route', async () => {
  const workspace = 'remote-ssh://user@example.com:2222/home/project%20files/'
  const uri = `${workspace}README.md`
  const entries = [{ name: 'README.md', type: 7 }]
  const renderer = createMockRpc({
    commandMap: {
      'FileSystem.readDirWithFileTypes': async () => entries,
      'FileSystem.readFile': async () => 'Remote README\nActual file text',
    },
  })
  const local = createMockRpc({
    commandMap: {
      'FileSystem.readDirWithFileTypes': async () => {
        throw new Error('The URL must be of scheme file')
      },
      'FileSystem.readFile': async () => {
        throw new Error('The URL must be of scheme file')
      },
    },
  })
  RendererWorker.set(renderer)
  FileSystemProcess.set(local)
  await expect(FileSystemDisk.readDirWithFileTypes(workspace)).resolves.toEqual(entries)
  await expect(FileSystemDisk.readFile(uri)).resolves.toBe('Remote README\nActual file text')
  expect(renderer.invocations).toEqual([
    ['FileSystem.readDirWithFileTypes', workspace],
    ['FileSystem.readFile', uri],
  ])
  expect(local.invocations).toEqual([])
})

test('preserves a missing remote file error', async () => {
  const uri = 'remote-ssh://user@host/work/missing.txt'
  RendererWorker.set(
    createMockRpc({
      commandMap: {
        'FileSystem.readFile': async () => {
          throw new Error(`ENOENT: no such file ${uri}`)
        },
      },
    }),
  )
  await expect(FileSystemDisk.readFile(uri)).rejects.toThrow(`ENOENT: no such file ${uri}`)
})
