import { test, expect } from '@jest/globals'
import { getWebSocketUrl } from '../src/parts/GetWebSocketUrl/GetWebSocketUrl.ts'
import * as Protocol from '../src/parts/Protocol/Protocol.ts'

test('getWebSocketUrl with http protocol', () => {
  const url = getWebSocketUrl('test', 'localhost:3000', 'http:')
  expect(url).toBe('ws://localhost:3000/websocket/test')
})

test('getWebSocketUrl with https protocol', () => {
  const url = getWebSocketUrl('test', 'localhost:3000', Protocol.Https)
  expect(url).toBe('wss://localhost:3000/websocket/test')
})
