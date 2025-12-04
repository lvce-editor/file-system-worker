import { test } from '@jest/globals'
import { mockWorkerGlobalRpc } from '@lvce-editor/rpc'
import { listen } from '../src/parts/Listen/Listen.ts'

test('listen', async () => {
  const { dispose, start } = mockWorkerGlobalRpc()
  const listenPromise = listen()
  start()
  await listenPromise
  dispose()
})
