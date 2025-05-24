import { test, expect } from '@jest/globals'
import * as WebSocketProtocol from '../src/parts/WebSocketProtocol/WebSocketProtocol.js'
import * as Protocol from '../src/parts/Protocol/Protocol.js'

test('getWebSocketProtocol returns wss for https', () => {
  const result = WebSocketProtocol.getWebSocketProtocol(Protocol.Https)
  expect(result).toBe(Protocol.Wss)
})

test('getWebSocketProtocol returns ws for http', () => {
  const result = WebSocketProtocol.getWebSocketProtocol('http:')
  expect(result).toBe(Protocol.Ws)
})
