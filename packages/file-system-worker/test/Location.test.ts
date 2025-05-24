import { test, expect } from '@jest/globals'
import { getHost, getProtocol } from '../src/parts/Location/Location.js'

test('getHost returns location.host', () => {
  // @ts-ignore
  globalThis.location = {
    host: 'test.example.com',
  }
  expect(getHost()).toBe('test.example.com')
})

test('getProtocol returns location.protocol', () => {
  // @ts-ignore
  globalThis.location = {
    protocol: 'https:',
  }
  expect(getProtocol()).toBe('https:')
})
