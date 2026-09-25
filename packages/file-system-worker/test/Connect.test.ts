import { expect, test } from '@jest/globals'
import { TransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { connect } from '../src/parts/Connect/Connect.ts'

test('a direct worker connection reads the same application filesystem as its host', async () => {
  const rpc = await TransferMessagePortRpcParent.create({ commandMap: {}, send: connect })
  try {
    await rpc.invoke('ApplicationFileSystem.execute', 'direct', 'writeFile', 'memfs:///file.ts', 'direct connection')
    expect(await rpc.invoke('ApplicationFileSystem.execute', 'direct', 'readFile', 'memfs:///file.ts')).toBe('direct connection')
    await rpc.invoke('ApplicationFileSystem.dispose', 'direct')
    expect(await rpc.invoke('ApplicationFileSystem.execute', 'direct', 'exists', 'memfs:///file.ts')).toBe(false)
  } finally {
    await rpc.dispose()
  }
})
