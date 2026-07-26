import { expect, test } from '@jest/globals'
import { createUnavailableFileSystemProcessRpc } from '../src/parts/CreateUnavailableFileSystemProcessRpc/CreateUnavailableFileSystemProcessRpc.ts'

test('throws a clear error when invoked', async () => {
  const rpc = createUnavailableFileSystemProcessRpc()

  await expect(rpc.invoke('FileSystem.readFile', '/test/config.json')).rejects.toThrow('Disk file system is not available in web')
})
