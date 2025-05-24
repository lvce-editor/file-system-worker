import { test, expect } from '@jest/globals'
import * as Protocol from '../src/parts/Protocol/Protocol.js'
import { getWebSocketProtocol } from '../src/parts/WebSocketProtocol/WebSocketProtocol.js'

test('getWebSocketProtocol converts HTTP to WS', () => {
  expect(getWebSocketProtocol('http:')).toBe(Protocol.Ws)
})

test('getWebSocketProtocol converts HTTPS to WSS', () => {
  expect(getWebSocketProtocol(Protocol.Https)).toBe(Protocol.Wss)
})
