import { test, expect } from '@jest/globals'
import { handleMessagePort } from '../src/parts/HandleMessagePort/HandleMessagePort.ts'

test('handleMessagePort should create RPC without rpcId', async () => {
  const mockPort = new MessageChannel().port1
  
  await expect(handleMessagePort(mockPort)).resolves.not.toThrow()
})

test('handleMessagePort should create RPC with rpcId', async () => {
  const mockPort = new MessageChannel().port1
  
  await expect(handleMessagePort(mockPort, 123)).resolves.not.toThrow()
})
