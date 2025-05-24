import { test, expect } from '@jest/globals'
import { getHost, getProtocol } from '../src/parts/Location/Location.js'

test('getHost returns location.host', () => {
  const originalHost = globalThis.location.host
  Object.defineProperty(globalThis, 'location', {
    value: { host: 'test.example.com' },
    writable: true,
  })

  expect(getHost()).toBe('test.example.com')

  Object.defineProperty(globalThis, 'location', {
    value: { host: originalHost },
    writable: true,
  })
})

test('getProtocol returns location.protocol', () => {
  const originalProtocol = globalThis.location.protocol
  Object.defineProperty(globalThis, 'location', {
    value: { protocol: 'https:' },
    writable: true,
  })

  expect(getProtocol()).toBe('https:')

  Object.defineProperty(globalThis, 'location', {
    value: { protocol: originalProtocol },
    writable: true,
  })
})
