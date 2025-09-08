import { test, expect } from '@jest/globals'
import { handleMessagePort } from '../src/parts/HandleMessagePort/HandleMessagePort.ts'
import { get } from '@lvce-editor/rpc-registry'

test('handleMessagePort should create RPC without rpcId', async () => {
  const mockPort = new MessageChannel().port1

  await expect(handleMessagePort(mockPort)).resolves.not.toThrow()

  // Clean up the message port
  mockPort.close()
})

test('handleMessagePort should create RPC with rpcId', async () => {
  const mockPort = new MessageChannel().port1

  await expect(handleMessagePort(mockPort, 123)).resolves.not.toThrow()

  // Clean up the RPC and message port
  const rpc = get(123)
  if (rpc) {
    await rpc.dispose()
  }
  mockPort.close()
})
